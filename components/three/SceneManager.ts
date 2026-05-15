import * as THREE from 'three';
import { ZONE_CONFIGS } from '@/lib/constants';
import type { PipelineZone } from '@/lib/types';
import { ZONE_CLASS_MAP, type AnyZone } from './zones';
import { disposeObject } from '@/lib/three-utils';

export class SceneManager {
  readonly scene: THREE.Scene;
  private zones: Map<PipelineZone, AnyZone> = new Map();
  private dirLight: THREE.DirectionalLight;
  private pointLights: THREE.PointLight[] = [];
  private connectorLines: THREE.Line[] = [];
  private gridHelper: THREE.GridHelper;
  private groundMesh: THREE.Mesh;

  constructor() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#0A0E14');
    this.scene.fog = new THREE.FogExp2(0x0a0e14, 0.008);

    // Ground plane
    const groundGeo = new THREE.PlaneGeometry(140, 50);
    const groundMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#0A0E14'),
      roughness: 0.95,
      metalness: 0.05,
    });
    this.groundMesh = new THREE.Mesh(groundGeo, groundMat);
    this.groundMesh.rotation.x = -Math.PI / 2;
    this.groundMesh.position.y = -0.5;
    this.groundMesh.receiveShadow = true;
    this.scene.add(this.groundMesh);

    // Grid
    this.gridHelper = new THREE.GridHelper(140, 70, 0x1a2530, 0x111820);
    this.gridHelper.position.y = -0.49;
    const gridMat = this.gridHelper.material as THREE.Material | THREE.Material[];
    const applyOpacity = (m: THREE.Material) => {
      m.transparent = true;
      (m as THREE.LineBasicMaterial).opacity = 0.35;
    };
    if (Array.isArray(gridMat)) gridMat.forEach(applyOpacity);
    else applyOpacity(gridMat);
    this.scene.add(this.gridHelper);

    // Ambient + directional light
    const ambient = new THREE.AmbientLight(0xffffff, 0.25);
    this.scene.add(ambient);

    this.dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    this.dirLight.position.set(20, 30, 20);
    this.dirLight.castShadow = true;
    this.dirLight.shadow.mapSize.set(2048, 2048);
    this.dirLight.shadow.camera.near = 0.5;
    this.dirLight.shadow.camera.far = 120;
    this.dirLight.shadow.camera.left = -60;
    this.dirLight.shadow.camera.right = 60;
    this.dirLight.shadow.camera.top = 30;
    this.dirLight.shadow.camera.bottom = -30;
    this.scene.add(this.dirLight);

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
    }
  }

  update(delta: number): void {
    for (const zone of this.zones.values()) {
      zone.update(delta);
    }
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
    for (const pl of this.pointLights) {
      this.scene.remove(pl);
    }
    this.pointLights = [];
    this.scene.remove(this.dirLight);
    this.scene.remove(this.gridHelper);
    this.gridHelper.geometry.dispose();
    const gMat = this.gridHelper.material;
    if (Array.isArray(gMat)) gMat.forEach((m) => m.dispose());
    else gMat.dispose();
    this.scene.remove(this.groundMesh);
    this.groundMesh.geometry.dispose();
    (this.groundMesh.material as THREE.Material).dispose();
    disposeObject(this.scene);
  }
}
