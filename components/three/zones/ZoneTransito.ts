import * as THREE from 'three';
import type { ZoneConfig } from '@/lib/types';
import { disposeObject } from '@/lib/three-utils';

/**
 * Ocean Transit — animated multi-frequency ocean, detailed cargo ship (tapered hull,
 * bridge tower, container stacks via InstancedMesh, mast/antenna), white wake triangles,
 * cloud particles, GPS pulse marker with TorusGeometry rings, satellite + solar panels,
 * data stream particles ship→satellite, CatmullRomCurve3 + TubeGeometry route,
 * navigation buoys with blinking lights.
 * Target: 45+ meshes.
 */
export class ZoneTransito extends THREE.Group {
  readonly config: ZoneConfig;
  private highlightables: THREE.MeshStandardMaterial[] = [];
  private baseEmissiveIntensities: number[] = [];
  private oceanGeometry: THREE.PlaneGeometry;
  private oceanInitialZ: Float32Array;
  private gpsRings: THREE.Mesh[] = [];
  private gpsRingMats: THREE.MeshBasicMaterial[] = [];
  private buoyLightMats: THREE.MeshStandardMaterial[] = [];
  private dataStreamGeo: THREE.BufferGeometry;
  private dataStreamPos: Float32Array;
  private dataStreamPhase: Float32Array;
  private dataStreamPoints: THREE.Points;
  private cloudGeo: THREE.BufferGeometry;
  private cloudPos: Float32Array;
  private cloudPoints: THREE.Points;
  private wakeMatA: THREE.MeshStandardMaterial;
  private wakeMatB: THREE.MeshStandardMaterial;
  private satelliteRotor: THREE.Mesh;

  constructor(config: ZoneConfig) {
    super();
    this.config = config;
    this.name = `zone:${config.id}`;
    this.userData = { zoneId: config.id };
    this.position.set(config.position.x, config.position.y, config.position.z);

    // ---- Animated ocean ----
    this.oceanGeometry = new THREE.PlaneGeometry(14, 10, 30, 30);
    const posAttr = this.oceanGeometry.attributes.position as THREE.BufferAttribute;
    this.oceanInitialZ = new Float32Array(posAttr.count);
    for (let i = 0; i < posAttr.count; i++) {
      this.oceanInitialZ[i] = posAttr.getZ(i);
    }
    const oceanMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#0A2A4A'),
      roughness: 0.1,
      metalness: 0.2,
      transparent: true,
      opacity: 0.85,
    });
    const ocean = new THREE.Mesh(this.oceanGeometry, oceanMat);
    ocean.rotation.x = -Math.PI / 2;
    ocean.receiveShadow = true;
    ocean.userData = { objectId: `${config.id}:ocean` };
    this.add(ocean);
    this.registerMaterial(oceanMat);

    // ---- Horizon plane (subtle gradient feel via dark blue at far Z) ----
    const horizonMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#0D1A22'),
      roughness: 1.0,
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide,
    });
    const horizon = new THREE.Mesh(
      new THREE.PlaneGeometry(20, 5),
      horizonMat,
    );
    horizon.position.set(0, 2.5, -5);
    this.add(horizon);
    this.registerMaterial(horizonMat);

    // ---- Ship hull (tapered box) ----
    const hullGeo = new THREE.BoxGeometry(6, 1.2, 2, 8, 1, 1);
    const hposAttr = hullGeo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < hposAttr.count; i++) {
      const x = hposAttr.getX(i);
      const y = hposAttr.getY(i);
      const z = hposAttr.getZ(i);
      if (y < 0) {
        const taper = 1 - Math.abs(x) / 3.5;
        hposAttr.setZ(i, z * Math.max(0.3, taper));
      }
    }
    hullGeo.computeVertexNormals();
    const hullMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#6B6B6B'),
      roughness: 0.45,
      metalness: 0.75,
    });
    const hull = new THREE.Mesh(hullGeo, hullMat);
    hull.position.set(0, 0.8, 0);
    hull.castShadow = true;
    hull.userData = { objectId: `${config.id}:ship-hull` };
    this.add(hull);
    this.registerMaterial(hullMat);

    // ---- Ship deck (a darker top) ----
    const deckMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#1F2A36'),
      roughness: 0.8,
    });
    const deck = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.06, 1.7), deckMat);
    deck.position.set(0, 1.43, 0);
    this.add(deck);
    this.registerMaterial(deckMat);

    // ---- Bridge tower (stacked boxes) ----
    const bridgeMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#E6EDF3'),
      roughness: 0.6,
    });
    const bridgeWindowMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#0A1A2A'),
      emissive: new THREE.Color('#88AAFF'),
      emissiveIntensity: 0.5,
      metalness: 0.3,
      roughness: 0.2,
    });
    const bridgeBase = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 1.0, 1.5),
      bridgeMat,
    );
    bridgeBase.position.set(-1.7, 1.96, 0);
    bridgeBase.castShadow = true;
    this.add(bridgeBase);
    const bridgeTop = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 0.6, 1.3),
      bridgeMat,
    );
    bridgeTop.position.set(-1.7, 2.76, 0);
    bridgeTop.castShadow = true;
    this.add(bridgeTop);
    const bridgeWindows = new THREE.Mesh(
      new THREE.BoxGeometry(1.45, 0.3, 1.35),
      bridgeWindowMat,
    );
    bridgeWindows.position.set(-1.7, 2.86, 0);
    this.add(bridgeWindows);
    this.registerMaterial(bridgeMat);
    // bridgeWindowMat NOT registered — keep windows lit
    // Mast + antenna
    const mastMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#8A8A8A'),
      metalness: 0.85,
      roughness: 0.4,
    });
    const mast = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 1.2, 6),
      mastMat,
    );
    mast.position.set(-1.7, 3.65, 0);
    this.add(mast);
    const antenna = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.02, 0.5, 5),
      mastMat,
    );
    antenna.position.set(-1.7, 4.4, 0);
    this.add(antenna);
    this.registerMaterial(mastMat);

    // ---- Container stacks on deck (InstancedMesh of 10 containers, varying colors) ----
    // Use 2 InstancedMeshes (warm + cool palette) for 2 visible material variations.
    const warmMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#D4A843'),
      roughness: 0.55,
      metalness: 0.55,
    });
    const coolMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#2D8B5E'),
      roughness: 0.55,
      metalness: 0.55,
    });
    const containerGeo = new THREE.BoxGeometry(1.4, 0.7, 1.4);
    const warmInstances = new THREE.InstancedMesh(containerGeo, warmMat, 5);
    const coolInstances = new THREE.InstancedMesh(containerGeo, coolMat, 5);
    const cdummy = new THREE.Object3D();
    let wi = 0;
    let ci = 0;
    for (let i = 0; i < 10; i++) {
      const row = Math.floor(i / 5);
      const col = i % 5;
      cdummy.position.set(0.6 + col * 0.5 - 0.3, 1.85 + row * 0.72, -0.45 + (col % 2) * 0.7);
      cdummy.updateMatrix();
      if (i % 2 === 0) {
        warmInstances.setMatrixAt(wi++, cdummy.matrix);
      } else {
        coolInstances.setMatrixAt(ci++, cdummy.matrix);
      }
    }
    warmInstances.instanceMatrix.needsUpdate = true;
    coolInstances.instanceMatrix.needsUpdate = true;
    warmInstances.userData = { objectId: `${config.id}:deck-containers` };
    this.add(warmInstances);
    this.add(coolInstances);
    this.registerMaterial(warmMat);
    this.registerMaterial(coolMat);

    // ---- Ship railing (4 thin rails around deck) ----
    const railingMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#8A8A8A'),
      metalness: 0.85,
      roughness: 0.4,
    });
    const railHorizGeo = new THREE.CylinderGeometry(0.025, 0.025, 5.6, 5);
    [-0.85, 0.85].forEach((rz) => {
      const r = new THREE.Mesh(railHorizGeo, railingMat);
      r.position.set(0, 1.7, rz);
      r.rotation.z = Math.PI / 2;
      this.add(r);
    });
    this.registerMaterial(railingMat);

    // ---- Data logger (kept, smaller) ----
    const loggerMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#1A1F1A'),
      emissive: new THREE.Color('#2DDD66'),
      emissiveIntensity: 1.2,
    });
    const logger = new THREE.Mesh(
      new THREE.BoxGeometry(0.25, 0.1, 0.25),
      loggerMat,
    );
    logger.position.set(-1.0, 1.55, 0);
    logger.userData = { objectId: `${config.id}:data-logger` };
    this.add(logger);
    // logger emissive — NOT registered to keep glowing

    // ---- GPS pulse marker (sphere + 3 expanding rings) ----
    const gpsCoreMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#88AAFF'),
      emissive: new THREE.Color('#88AAFF'),
      emissiveIntensity: 1.6,
    });
    const gpsCore = new THREE.Mesh(
      new THREE.SphereGeometry(0.15, 10, 8),
      gpsCoreMat,
    );
    gpsCore.position.set(-0.4, 4.5, 0);
    this.add(gpsCore);
    for (let r = 0; r < 3; r++) {
      const ringMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color('#88AAFF'),
        transparent: true,
        opacity: 0.6,
        side: THREE.DoubleSide,
      });
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.2, 0.02, 6, 24),
        ringMat,
      );
      ring.position.set(-0.4, 4.5, 0);
      ring.rotation.x = Math.PI / 2;
      this.add(ring);
      this.gpsRings.push(ring);
      this.gpsRingMats.push(ringMat);
    }

    // ---- Satellite high above ----
    const satBodyMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#8A8A8A'),
      metalness: 0.85,
      roughness: 0.4,
    });
    const satBody = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.4, 0.5),
      satBodyMat,
    );
    satBody.position.set(2.5, 7.0, 0);
    satBody.userData = { objectId: `${config.id}:satellite` };
    this.add(satBody);
    this.registerMaterial(satBodyMat);
    const solarMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#1A2A4A'),
      emissive: new THREE.Color('#1A3A6A'),
      emissiveIntensity: 0.4,
      metalness: 0.6,
      roughness: 0.3,
      side: THREE.DoubleSide,
    });
    [-1, 1].forEach((sx) => {
      const panel = new THREE.Mesh(
        new THREE.PlaneGeometry(1.2, 0.6),
        solarMat,
      );
      panel.position.set(2.5 + sx * 0.95, 7.0, 0);
      panel.rotation.y = Math.PI / 2;
      this.add(panel);
    });
    this.registerMaterial(solarMat);
    // Satellite rotation indicator (small cylinder)
    this.satelliteRotor = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.06, 0.12, 6),
      satBodyMat,
    );
    this.satelliteRotor.position.set(2.5, 7.3, 0);
    this.add(this.satelliteRotor);

    // ---- Data stream particles ship → satellite (15 dots rising) ----
    const STREAM = 15;
    this.dataStreamPos = new Float32Array(STREAM * 3);
    this.dataStreamPhase = new Float32Array(STREAM);
    for (let i = 0; i < STREAM; i++) {
      this.dataStreamPhase[i] = i / STREAM;
      this.dataStreamPos[i * 3] = -0.4;
      this.dataStreamPos[i * 3 + 1] = 4.5;
      this.dataStreamPos[i * 3 + 2] = 0;
    }
    this.dataStreamGeo = new THREE.BufferGeometry();
    this.dataStreamGeo.setAttribute(
      'position',
      new THREE.BufferAttribute(this.dataStreamPos, 3),
    );
    const streamMat = new THREE.PointsMaterial({
      color: new THREE.Color('#22DD66'),
      size: 0.12,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    this.dataStreamPoints = new THREE.Points(this.dataStreamGeo, streamMat);
    this.add(this.dataStreamPoints);

    // ---- Cloud particles (8) ----
    const CLOUDS = 8;
    this.cloudPos = new Float32Array(CLOUDS * 3);
    for (let i = 0; i < CLOUDS; i++) {
      this.cloudPos[i * 3] = (Math.random() - 0.5) * 12;
      this.cloudPos[i * 3 + 1] = 9 + Math.random() * 2.5;
      this.cloudPos[i * 3 + 2] = (Math.random() - 0.5) * 6;
    }
    this.cloudGeo = new THREE.BufferGeometry();
    this.cloudGeo.setAttribute(
      'position',
      new THREE.BufferAttribute(this.cloudPos, 3),
    );
    const cloudMat = new THREE.PointsMaterial({
      color: new THREE.Color('#CCD6E0'),
      size: 1.6,
      transparent: true,
      opacity: 0.18,
      depthWrite: false,
    });
    this.cloudPoints = new THREE.Points(this.cloudGeo, cloudMat);
    this.add(this.cloudPoints);

    // ---- Wake triangles ----
    this.wakeMatA = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#E6F2FF'),
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide,
    });
    this.wakeMatB = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#E6F2FF'),
      transparent: true,
      opacity: 0.25,
      side: THREE.DoubleSide,
    });
    const wakeShape = new THREE.Shape();
    wakeShape.moveTo(0, 0);
    wakeShape.lineTo(-3, 0.3);
    wakeShape.lineTo(-3, -0.3);
    wakeShape.lineTo(0, 0);
    const wakeGeo = new THREE.ShapeGeometry(wakeShape);
    const wakeA = new THREE.Mesh(wakeGeo, this.wakeMatA);
    wakeA.position.set(-3.2, 0.06, 0.5);
    wakeA.rotation.x = -Math.PI / 2;
    this.add(wakeA);
    const wakeB = new THREE.Mesh(wakeGeo, this.wakeMatB);
    wakeB.position.set(-3.2, 0.06, -0.5);
    wakeB.rotation.x = -Math.PI / 2;
    this.add(wakeB);

    // ---- Route line (CatmullRomCurve3 + TubeGeometry) ----
    const routeCurve = new THREE.CatmullRomCurve3(
      [
        new THREE.Vector3(-6.5, 0.08, 0),
        new THREE.Vector3(-3, 0.08, 0.5),
        new THREE.Vector3(0, 0.08, -0.3),
        new THREE.Vector3(3, 0.08, 0.4),
        new THREE.Vector3(6.5, 0.08, 0),
      ],
      false,
      'catmullrom',
      0.4,
    );
    const tubeGeo = new THREE.TubeGeometry(routeCurve, 48, 0.03, 6, false);
    const tubeMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#88AAFF'),
      emissive: new THREE.Color('#4488FF'),
      emissiveIntensity: 0.55,
      transparent: true,
      opacity: 0.85,
    });
    const tube = new THREE.Mesh(tubeGeo, tubeMat);
    tube.userData = { objectId: `${config.id}:route` };
    this.add(tube);
    // tube emissive — NOT registered

    // ---- Navigation buoys (3) ----
    const buoyMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#1A1A20'),
      roughness: 0.7,
    });
    const buoyGeo = new THREE.CylinderGeometry(0.18, 0.22, 0.35, 8);
    const buoyTopGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.12, 6);
    const buoyXs = [-5, -1.5, 4.5];
    buoyXs.forEach((bx, i) => {
      const buoy = new THREE.Mesh(buoyGeo, buoyMat);
      buoy.position.set(bx, 0.18, 1.6 + (i % 2) * 0.4);
      this.add(buoy);
      const top = new THREE.Mesh(buoyTopGeo, buoyMat);
      top.position.set(bx, 0.42, 1.6 + (i % 2) * 0.4);
      this.add(top);
      const lightMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color('#FF4444'),
        emissive: new THREE.Color('#FF4444'),
        emissiveIntensity: 1.2,
      });
      const light = new THREE.Mesh(
        new THREE.SphereGeometry(0.05, 6, 5),
        lightMat,
      );
      light.position.set(bx, 0.55, 1.6 + (i % 2) * 0.4);
      this.add(light);
      this.buoyLightMats.push(lightMat);
    });
    this.registerMaterial(buoyMat);
  }

  private registerMaterial(m: THREE.MeshStandardMaterial): void {
    this.highlightables.push(m);
    this.baseEmissiveIntensities.push(m.emissiveIntensity ?? 0);
  }

  update(delta: number): void {
    // Animated multi-frequency ocean
    const posAttr = this.oceanGeometry.attributes.position as THREE.BufferAttribute;
    const t = performance.now() * 0.001;
    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i);
      const y = posAttr.getY(i);
      const wave =
        Math.sin(x * 0.4 + t) * 0.12 +
        Math.cos(y * 0.5 + t * 0.7) * 0.08 +
        Math.sin(x * 0.9 + y * 0.6 + t * 1.4) * 0.05;
      posAttr.setZ(i, this.oceanInitialZ[i] + wave);
    }
    posAttr.needsUpdate = true;
    this.oceanGeometry.computeVertexNormals();

    // GPS rings expanding + fading
    const ringT = (performance.now() * 0.0006) % 1;
    this.gpsRings.forEach((ring, i) => {
      const phase = (ringT + i / this.gpsRings.length) % 1;
      const s = 0.3 + phase * 4.0;
      ring.scale.set(s, s, 1);
      this.gpsRingMats[i].opacity = 0.7 * (1 - phase);
    });

    // Buoy blinking lights (offset per buoy)
    const bt = performance.now() * 0.003;
    this.buoyLightMats.forEach((m, i) => {
      m.emissiveIntensity = (Math.sin(bt + i * 1.6) > 0.4) ? 1.4 : 0.2;
    });

    // Data stream particles ship→satellite
    const arr = (this.dataStreamGeo.attributes.position as THREE.BufferAttribute)
      .array as Float32Array;
    for (let i = 0; i < this.dataStreamPhase.length; i++) {
      this.dataStreamPhase[i] += delta * 0.35;
      if (this.dataStreamPhase[i] > 1) this.dataStreamPhase[i] -= 1;
      const u = this.dataStreamPhase[i];
      arr[i * 3] = -0.4 + (2.5 - -0.4) * u;
      arr[i * 3 + 1] = 4.5 + (7.0 - 4.5) * u;
      arr[i * 3 + 2] = 0;
    }
    (this.dataStreamGeo.attributes.position as THREE.BufferAttribute).needsUpdate = true;

    // Cloud drift
    const cloudArr = (this.cloudGeo.attributes.position as THREE.BufferAttribute)
      .array as Float32Array;
    for (let i = 0; i < cloudArr.length; i += 3) {
      cloudArr[i] += delta * 0.12;
      if (cloudArr[i] > 8) cloudArr[i] = -8;
    }
    (this.cloudGeo.attributes.position as THREE.BufferAttribute).needsUpdate = true;

    // Wake fade pulse
    this.wakeMatA.opacity = 0.3 + 0.1 * Math.sin(t * 2);
    this.wakeMatB.opacity = 0.2 + 0.1 * Math.sin(t * 2 + 1);

    // Satellite spin
    this.satelliteRotor.rotation.y += delta * 0.6;
  }

  setHighlight(active: boolean): void {
    this.highlightables.forEach((m, i) => {
      m.emissive.set(active ? '#4488FF' : '#000000');
      m.emissiveIntensity = active ? 0.2 : this.baseEmissiveIntensities[i] ?? 0;
    });
  }

  setRiskLevel(level: number): void {
    const clamped = Math.max(0, Math.min(1, level));
    const color = new THREE.Color().lerpColors(
      new THREE.Color('#22DD66'),
      new THREE.Color('#FF4444'),
      clamped,
    );
    this.highlightables.forEach((m) => {
      m.emissive.copy(color);
      m.emissiveIntensity = clamped * 0.4;
    });
  }

  getBoundingBox(): THREE.Box3 {
    return new THREE.Box3().setFromObject(this);
  }

  dispose(): void {
    disposeObject(this);
  }
}
