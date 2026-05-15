import * as THREE from 'three';
import { ZONE_CONFIGS } from '@/lib/constants';
import type { PipelineZone } from '@/lib/types';
import { ZONE_CLASS_MAP, type AnyZone } from './zones';
import { disposeObject } from '@/lib/three-utils';

export class SceneManager {
  readonly scene: THREE.Scene;
  private zones: Map<PipelineZone, AnyZone> = new Map();
  private dirLight: THREE.DirectionalLight;
  private hemiLight: THREE.HemisphereLight;
  private rimLight: THREE.DirectionalLight;
  private skyMesh: THREE.Mesh;
  private pointLights: THREE.PointLight[] = [];
  private connectorLines: THREE.Line[] = [];
  private connectorMats: THREE.LineDashedMaterial[] = [];
  private gridMesh: THREE.Mesh;
  private groundMesh: THREE.Mesh;
  private dustGeometry: THREE.BufferGeometry;
  private dustPositions: Float32Array;
  private dustVelocities: Float32Array;
  private dustPoints: THREE.Points;

  constructor() {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x0d1b2a, 0.005);

    // Gradient sky dome (inside-out sphere with custom shader)
    const skyGeo = new THREE.SphereGeometry(200, 32, 32);
    const skyMat = new THREE.ShaderMaterial({
      uniforms: {
        topColor: { value: new THREE.Color('#0D1B2A') },
        bottomColor: { value: new THREE.Color('#1B2838') },
        horizonColor: { value: new THREE.Color('#162030') },
        offset: { value: 10 },
        exponent: { value: 0.4 },
      },
      vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 topColor;
        uniform vec3 bottomColor;
        uniform vec3 horizonColor;
        uniform float offset;
        uniform float exponent;
        varying vec3 vWorldPosition;
        void main() {
          float h = normalize(vWorldPosition + offset).y;
          float t = max(pow(max(h, 0.0), exponent), 0.0);
          vec3 color = mix(horizonColor, topColor, t);
          color = mix(bottomColor, color, smoothstep(-0.1, 0.2, h));
          gl_FragColor = vec4(color, 1.0);
        }
      `,
      side: THREE.BackSide,
      depthWrite: false,
    });
    this.skyMesh = new THREE.Mesh(skyGeo, skyMat);
    this.scene.add(this.skyMesh);

    // ---- Ground: matte concrete base + emissive tech grid above ----
    // Base layer kept MATTE on purpose — earlier polished/clearcoat version
    // produced a giant specular hotspot of the key light reflecting straight
    // into the camera that the bloom pass then torched into a sun-blob.
    // Sits at y=-0.04, a hair below the zone terrain pads (y=0), so zones
    // land FLUSH instead of hovering 0.5u above an obvious cliff.
    const groundGeo = new THREE.PlaneGeometry(140, 50);
    const groundMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#0E141C'),
      roughness: 0.95,
      metalness: 0.05,
      envMapIntensity: 0.25,
    });
    this.groundMesh = new THREE.Mesh(groundGeo, groundMat);
    this.groundMesh.rotation.x = -Math.PI / 2;
    this.groundMesh.position.y = -0.04;
    this.groundMesh.receiveShadow = true;
    this.scene.add(this.groundMesh);

    // Grid layer: custom ShaderMaterial. Anti-aliased grid lines (minor every
    // 1u, major every 10u — matches zone spacing), radial fade so distant
    // grid breathes into the fog. Transparent everywhere except on lines, so
    // the polished-concrete base shows through and reflects the IBL.
    const gridGeo = new THREE.PlaneGeometry(140, 50);
    const gridMat = new THREE.ShaderMaterial({
      uniforms: {
        uMajorColor: { value: new THREE.Color('#2D8B5E') },
        uMinorColor: { value: new THREE.Color('#3A5870') },
        uFadeNear: { value: 22.0 },
        uFadeFar: { value: 60.0 },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
      vertexShader: `
        varying vec3 vWorldPos;
        void main() {
          vec4 wp = modelMatrix * vec4(position, 1.0);
          vWorldPos = wp.xyz;
          gl_Position = projectionMatrix * viewMatrix * wp;
        }
      `,
      fragmentShader: `
        uniform vec3 uMajorColor;
        uniform vec3 uMinorColor;
        uniform float uFadeNear;
        uniform float uFadeFar;
        varying vec3 vWorldPos;

        // Anti-aliased grid line via fwidth derivative.
        // Returns ~1 on a line, 0 between lines, smoothly across pixels.
        float gridLine(vec2 coord, float scale, float thickness) {
          vec2 c = coord / scale;
          vec2 g = abs(fract(c - 0.5) - 0.5) / fwidth(c);
          float line = min(g.x, g.y);
          return clamp(thickness - line, 0.0, 1.0);
        }

        void main() {
          vec2 p = vWorldPos.xz;
          float minor = gridLine(p, 1.0, 1.0);
          float major = gridLine(p, 10.0, 1.5);

          // Radial fade so distant grid blends into fog
          float dist = length(p);
          float fade = 1.0 - smoothstep(uFadeNear, uFadeFar, dist);

          vec3 col = uMinorColor * minor * 0.35 + uMajorColor * major * 0.7;
          float alpha = (minor * 0.40 + major * 0.85) * fade;
          gl_FragColor = vec4(col, alpha);
        }
      `,
    });
    this.gridMesh = new THREE.Mesh(gridGeo, gridMat);
    this.gridMesh.rotation.x = -Math.PI / 2;
    this.gridMesh.position.y = -0.035;
    this.gridMesh.renderOrder = 1;
    this.scene.add(this.gridMesh);

    // Lighting balanced for IBL workflow: scene.environment (PMREM) supplies
    // the ambient + reflections, so we keep AmbientLight low and let the key
    // directional + blue rim do the directional shaping.
    const ambient = new THREE.AmbientLight(0xffffff, 0.18);
    this.scene.add(ambient);

    this.hemiLight = new THREE.HemisphereLight(0x9aaecc, 0x1a1a2e, 0.35);
    this.hemiLight.position.set(0, 50, 0);
    this.scene.add(this.hemiLight);

    // Key light — warm amber, calmed down so its specular reflection in the
    // floor doesn't blow past the bloom threshold.
    this.dirLight = new THREE.DirectionalLight(0xfff0d8, 1.0);
    this.dirLight.position.set(22, 32, 18);
    this.dirLight.castShadow = true;
    this.dirLight.shadow.mapSize.set(2048, 2048);
    this.dirLight.shadow.camera.near = 0.5;
    this.dirLight.shadow.camera.far = 120;
    this.dirLight.shadow.camera.left = -60;
    this.dirLight.shadow.camera.right = 60;
    this.dirLight.shadow.camera.top = 30;
    this.dirLight.shadow.camera.bottom = -30;
    this.dirLight.shadow.bias = -0.0004;
    this.dirLight.shadow.normalBias = 0.04;
    // VSMShadowMap softness (set on PipelineCanvas renderer); radius widens it
    this.dirLight.shadow.radius = 4;
    this.scene.add(this.dirLight);

    // Cool blue rim light from behind — separates silhouettes from sky
    this.rimLight = new THREE.DirectionalLight(0x4488ff, 0.4);
    this.rimLight.position.set(-32, 14, -22);
    this.scene.add(this.rimLight);

    // Zones
    for (const config of ZONE_CONFIGS) {
      const ZoneCtor = ZONE_CLASS_MAP[config.id];
      const zone = new ZoneCtor(config);
      this.zones.set(config.id, zone);
      this.scene.add(zone);

      // Per-zone point light
      const pLight = new THREE.PointLight(
        new THREE.Color(config.accentColor),
        0.4,
        15,
      );
      pLight.position.set(config.position.x, config.size.h + 4, config.position.z);
      this.scene.add(pLight);
      this.pointLights.push(pLight);
    }

    // Connector dashed lines between adjacent zones
    for (let i = 0; i < ZONE_CONFIGS.length - 1; i++) {
      const a = ZONE_CONFIGS[i].position;
      const b = ZONE_CONFIGS[i + 1].position;
      const geo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(a.x + 4, 0.1, a.z),
        new THREE.Vector3(b.x - 4, 0.1, b.z),
      ]);
      const mat = new THREE.LineDashedMaterial({
        color: new THREE.Color('#4488FF'),
        dashSize: 0.5,
        gapSize: 0.3,
        transparent: true,
        opacity: 0.55,
      });
      const line = new THREE.Line(geo, mat);
      line.computeLineDistances();
      this.scene.add(line);
      this.connectorLines.push(line);
      this.connectorMats.push(mat);
    }

    // ---- Global ambient dust motes (100, drift slowly across the whole scene) ----
    const DUST = 100;
    this.dustPositions = new Float32Array(DUST * 3);
    this.dustVelocities = new Float32Array(DUST);
    for (let i = 0; i < DUST; i++) {
      this.dustPositions[i * 3] = (Math.random() - 0.5) * 130;
      this.dustPositions[i * 3 + 1] = 0.5 + Math.random() * 8;
      this.dustPositions[i * 3 + 2] = (Math.random() - 0.5) * 30;
      this.dustVelocities[i] = 0.04 + Math.random() * 0.06;
    }
    this.dustGeometry = new THREE.BufferGeometry();
    this.dustGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(this.dustPositions, 3),
    );
    const dustMat = new THREE.PointsMaterial({
      color: new THREE.Color('#FFFFFF'),
      size: 0.05,
      transparent: true,
      opacity: 0.15,
      depthWrite: false,
      sizeAttenuation: true,
    });
    this.dustPoints = new THREE.Points(this.dustGeometry, dustMat);
    this.scene.add(this.dustPoints);
  }

  update(delta: number): void {
    for (const zone of this.zones.values()) {
      zone.update(delta);
    }

    // Animate connector line dashes (flow effect)
    const t = performance.now() * 0.001;
    for (const mat of this.connectorMats) {
      // dashOffset sets where the dash pattern starts; negative values advance the dash
      mat.dashSize = 0.5;
      mat.gapSize = 0.3;
      // LineDashedMaterial does not natively expose an offset uniform; use opacity pulse + color shift
      mat.opacity = 0.45 + 0.15 * Math.sin(t * 1.4);
    }

    // Drift global dust motes horizontally across X, gentle Y bob
    const arr = (this.dustGeometry.attributes.position as THREE.BufferAttribute)
      .array as Float32Array;
    for (let i = 0; i < this.dustVelocities.length; i++) {
      arr[i * 3] += this.dustVelocities[i] * delta;
      arr[i * 3 + 1] += Math.sin(t + i * 0.4) * 0.001;
      if (arr[i * 3] > 65) arr[i * 3] = -65;
    }
    (this.dustGeometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;
  }

  getZoneGroup(zoneId: PipelineZone): AnyZone | undefined {
    return this.zones.get(zoneId);
  }

  getAllZones(): AnyZone[] {
    return Array.from(this.zones.values());
  }

  dispose(): void {
    for (const zone of this.zones.values()) {
      zone.dispose();
      this.scene.remove(zone);
    }
    this.zones.clear();
    for (const line of this.connectorLines) {
      this.scene.remove(line);
      line.geometry.dispose();
      (line.material as THREE.Material).dispose();
    }
    this.connectorLines = [];
    this.connectorMats = [];
    for (const pl of this.pointLights) {
      this.scene.remove(pl);
    }
    this.pointLights = [];
    this.scene.remove(this.dirLight);
    this.scene.remove(this.hemiLight);
    this.scene.remove(this.rimLight);
    this.scene.remove(this.skyMesh);
    this.skyMesh.geometry.dispose();
    (this.skyMesh.material as THREE.Material).dispose();
    this.scene.remove(this.gridMesh);
    this.gridMesh.geometry.dispose();
    (this.gridMesh.material as THREE.Material).dispose();
    this.scene.remove(this.groundMesh);
    this.groundMesh.geometry.dispose();
    (this.groundMesh.material as THREE.Material).dispose();
    this.scene.remove(this.dustPoints);
    this.dustGeometry.dispose();
    (this.dustPoints.material as THREE.Material).dispose();
    disposeObject(this.scene);
  }
}
