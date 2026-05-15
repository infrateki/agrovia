import * as THREE from 'three';
import type { ZoneConfig } from '@/lib/types';
import { disposeObject } from '@/lib/three-utils';

/**
 * The Field — rolling terrain, fruit trees + palms, berry bushes,
 * harvest bins overflowing with fruit, workers, fallen leaves, drifting pollen.
 * Target: 40+ meshes (heavy InstancedMesh use for berries / leaves).
 */
export class ZoneCosecha extends THREE.Group {
  readonly config: ZoneConfig;
  private highlightables: THREE.MeshStandardMaterial[] = [];
  private baseEmissiveIntensities: number[] = [];
  private sunlight: THREE.PointLight;
  private warmGlow: THREE.PointLight;
  private pollenGeometry: THREE.BufferGeometry;
  private pollenPositions: Float32Array;
  private pollenVelocities: Float32Array;
  private pollenPoints: THREE.Points;

  constructor(config: ZoneConfig) {
    super();
    this.config = config;
    this.name = `zone:${config.id}`;
    this.userData = { zoneId: config.id };
    this.position.set(config.position.x, config.position.y, config.position.z);

    // ---- Rolling terrain ----
    const terrainGeo = new THREE.PlaneGeometry(10, 10, 24, 24);
    const tposAttr = terrainGeo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < tposAttr.count; i++) {
      const x = tposAttr.getX(i);
      const y = tposAttr.getY(i);
      const z =
        Math.sin(x * 0.5) * 0.18 +
        Math.cos(y * 0.45) * 0.14 +
        Math.sin(x * 1.1 + y * 0.8) * 0.05;
      tposAttr.setZ(i, z);
    }
    terrainGeo.computeVertexNormals();
    const terrainMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#2D5A1E'),
      roughness: 0.95,
    });
    const terrain = new THREE.Mesh(terrainGeo, terrainMat);
    terrain.rotation.x = -Math.PI / 2;
    terrain.receiveShadow = true;
    terrain.userData = { objectId: `${config.id}:terrain` };
    this.add(terrain);
    this.registerMaterial(terrainMat);

    // ---- Dirt path (3 segments snaking through field) ----
    const pathMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#7A5A3A'),
      roughness: 1.0,
    });
    const pathSegs: Array<[number, number, number, number]> = [
      [-3, -0.5, 3.5, 0.18],
      [0, 0, 3.0, 0],
      [3, 0.7, 3.5, -0.16],
    ];
    pathSegs.forEach(([px, pz, len, rot]) => {
      const seg = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.02, len), pathMat);
      seg.position.set(px, 0.06, pz);
      seg.rotation.y = rot;
      this.add(seg);
    });
    this.registerMaterial(pathMat);

    // ---- Fruit trees (4) ----
    const fruitTreePositions: Array<[number, number]> = [
      [-3.2, -2.4],
      [-1.0, 1.8],
      [1.6, -1.2],
      [3.4, 2.4],
    ];
    const trunkMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#5D3A1A'),
      roughness: 0.95,
    });
    const fruitCanopyMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#3A7B2D'),
      roughness: 0.85,
    });
    const treeBerryMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#4A0E78'),
      roughness: 0.35,
      metalness: 0.0,
    });
    const trunkGeo = new THREE.CylinderGeometry(0.13, 0.18, 1.0, 8);
    const canopyGeo = new THREE.SphereGeometry(0.85, 12, 10);
    const berryGeo = new THREE.SphereGeometry(0.04, 6, 5);
    fruitTreePositions.forEach(([x, z], i) => {
      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.set(x, 0.5, z);
      trunk.castShadow = true;
      trunk.userData = { objectId: `${config.id}:tree-${i}-trunk` };
      this.add(trunk);

      const canopy = new THREE.Mesh(canopyGeo, fruitCanopyMat);
      canopy.position.set(x, 1.4, z);
      canopy.castShadow = true;
      canopy.userData = { objectId: `${config.id}:tree-${i}-canopy` };
      this.add(canopy);

      const berryCount = 18;
      const berries = new THREE.InstancedMesh(berryGeo, treeBerryMat, berryCount);
      const dummy = new THREE.Object3D();
      for (let b = 0; b < berryCount; b++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(0.2 + Math.random() * 0.7);
        const r = 0.85;
        dummy.position.set(
          x + r * Math.sin(phi) * Math.cos(theta),
          1.4 + r * Math.cos(phi),
          z + r * Math.sin(phi) * Math.sin(theta),
        );
        dummy.updateMatrix();
        berries.setMatrixAt(b, dummy.matrix);
      }
      berries.instanceMatrix.needsUpdate = true;
      this.add(berries);
    });
    this.registerMaterial(trunkMat);
    this.registerMaterial(fruitCanopyMat);
    this.registerMaterial(treeBerryMat);

    // ---- Palms (4) ----
    const palmPositions: Array<[number, number]> = [
      [-4.2, 3.6],
      [-3.0, 4.0],
      [4.0, -3.6],
      [-4.4, -3.4],
    ];
    const palmTrunkMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#6B4A1F'),
      roughness: 0.95,
    });
    const frondMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#2E6B22'),
      roughness: 0.7,
      side: THREE.DoubleSide,
    });
    const palmTrunkGeo = new THREE.CylinderGeometry(0.08, 0.14, 2.4, 8);
    const frondGeo = new THREE.ConeGeometry(0.08, 0.95, 4, 1);
    palmPositions.forEach(([x, z], i) => {
      const lean = (Math.sin(i * 1.7) - 0.5) * 0.18;
      const trunk = new THREE.Mesh(palmTrunkGeo, palmTrunkMat);
      trunk.position.set(x, 1.2, z);
      trunk.rotation.z = lean;
      trunk.castShadow = true;
      trunk.userData = { objectId: `${config.id}:palm-${i}-trunk` };
      this.add(trunk);
      const topX = x + Math.sin(lean) * 1.2;
      for (let f = 0; f < 4; f++) {
        const frond = new THREE.Mesh(frondGeo, frondMat);
        frond.position.set(topX, 2.4, z);
        frond.rotation.y = (f / 4) * Math.PI * 2;
        frond.rotation.z = Math.PI / 2.2;
        frond.castShadow = true;
        this.add(frond);
      }
    });
    this.registerMaterial(palmTrunkMat);
    this.registerMaterial(frondMat);

    // ---- Berry bushes (3) ----
    const bushMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#3A6B22'),
      roughness: 0.85,
    });
    const bushBerryMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#4A0E78'),
      roughness: 0.35,
      metalness: 0.0,
    });
    const bushGeo = new THREE.SphereGeometry(0.32, 10, 8);
    const bushBerryGeo = new THREE.SphereGeometry(0.03, 5, 4);
    const bushPositions: Array<[number, number]> = [
      [-1.8, -3.6],
      [2.2, -3.4],
      [0.4, 3.6],
    ];
    bushPositions.forEach(([bx, bz], i) => {
      const bush = new THREE.Mesh(bushGeo, bushMat);
      bush.position.set(bx, 0.32, bz);
      bush.castShadow = true;
      bush.userData = { objectId: `${config.id}:bush-${i}` };
      this.add(bush);

      const count = 16;
      const bushBerries = new THREE.InstancedMesh(bushBerryGeo, bushBerryMat, count);
      const dummy = new THREE.Object3D();
      for (let b = 0; b < count; b++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(0.4 + Math.random() * 0.6);
        const r = 0.32;
        dummy.position.set(
          bx + r * Math.sin(phi) * Math.cos(theta),
          0.32 + r * Math.cos(phi),
          bz + r * Math.sin(phi) * Math.sin(theta),
        );
        dummy.updateMatrix();
        bushBerries.setMatrixAt(b, dummy.matrix);
      }
      bushBerries.instanceMatrix.needsUpdate = true;
      this.add(bushBerries);
    });
    this.registerMaterial(bushMat);
    this.registerMaterial(bushBerryMat);

    // ---- Harvest bins overflowing (4) ----
    const binMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#6E4C2A'),
      roughness: 0.9,
      metalness: 0.0,
    });
    const binBerryMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#4A0E78'),
      roughness: 0.35,
      metalness: 0.0,
    });
    const binGeo = new THREE.BoxGeometry(0.6, 0.4, 0.6);
    const binPositions: Array<[number, number]> = [
      [0, 3.4],
      [1.5, 3.6],
      [-1.5, 3.2],
      [0.7, 4.2],
    ];
    binPositions.forEach(([bx, bz], i) => {
      const bin = new THREE.Mesh(binGeo, binMat);
      bin.position.set(bx, 0.2, bz);
      bin.castShadow = true;
      bin.userData = { objectId: `${config.id}:bin-${i}` };
      this.add(bin);
    });
    const overflowCount = 40;
    const overflowGeo = new THREE.SphereGeometry(0.05, 6, 5);
    const overflow = new THREE.InstancedMesh(overflowGeo, binBerryMat, overflowCount);
    const overflowDummy = new THREE.Object3D();
    for (let i = 0; i < overflowCount; i++) {
      const bin = binPositions[i % binPositions.length];
      overflowDummy.position.set(
        bin[0] + (Math.random() - 0.5) * 0.55,
        0.42 + Math.random() * 0.18,
        bin[1] + (Math.random() - 0.5) * 0.55,
      );
      overflowDummy.updateMatrix();
      overflow.setMatrixAt(i, overflowDummy.matrix);
    }
    overflow.instanceMatrix.needsUpdate = true;
    this.add(overflow);
    this.registerMaterial(binMat);
    this.registerMaterial(binBerryMat);

    // ---- Worker figures (3) ----
    const workerSkinMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#D4A07A'),
      roughness: 0.9,
    });
    const workerShirtMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#3A7BD0'),
      roughness: 0.75,
    });
    const basketMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#A07238'),
      roughness: 0.85,
    });
    const workerBodyGeo = new THREE.CylinderGeometry(0.15, 0.18, 0.5, 8);
    const workerHeadGeo = new THREE.SphereGeometry(0.12, 8, 6);
    const basketGeo = new THREE.CylinderGeometry(0.16, 0.13, 0.18, 8, 1, true);
    const armGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.3, 5);
    const workerPositions: Array<[number, number]> = [
      [-2.4, 0.8],
      [1.2, 0.4],
      [3.0, -2.0],
    ];
    workerPositions.forEach(([wx, wz], i) => {
      const body = new THREE.Mesh(workerBodyGeo, workerShirtMat);
      body.position.set(wx, 0.45, wz);
      body.castShadow = true;
      body.userData = { objectId: `${config.id}:worker-${i}` };
      this.add(body);

      const head = new THREE.Mesh(workerHeadGeo, workerSkinMat);
      head.position.set(wx, 0.85, wz);
      head.castShadow = true;
      this.add(head);

      const basket = new THREE.Mesh(basketGeo, basketMat);
      basket.position.set(wx + 0.22, 0.55, wz);
      basket.castShadow = true;
      this.add(basket);

      const arm = new THREE.Mesh(armGeo, workerShirtMat);
      arm.position.set(wx + 0.12, 0.6, wz);
      arm.rotation.z = -Math.PI / 4;
      this.add(arm);
    });
    this.registerMaterial(workerSkinMat);
    this.registerMaterial(workerShirtMat);
    this.registerMaterial(basketMat);

    // ---- Fallen leaves (InstancedMesh, ground cover) ----
    const leafMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#8B6A3A'),
      roughness: 1.0,
      side: THREE.DoubleSide,
    });
    const leafCount = 28;
    const leafGeo = new THREE.PlaneGeometry(0.12, 0.08);
    const leaves = new THREE.InstancedMesh(leafGeo, leafMat, leafCount);
    const leafDummy = new THREE.Object3D();
    for (let i = 0; i < leafCount; i++) {
      leafDummy.position.set(
        (Math.random() - 0.5) * 9,
        0.06,
        (Math.random() - 0.5) * 9,
      );
      leafDummy.rotation.set(-Math.PI / 2, 0, Math.random() * Math.PI);
      const s = 0.7 + Math.random() * 0.6;
      leafDummy.scale.setScalar(s);
      leafDummy.updateMatrix();
      leaves.setMatrixAt(i, leafDummy.matrix);
    }
    leaves.instanceMatrix.needsUpdate = true;
    this.add(leaves);
    this.registerMaterial(leafMat);

    // ---- Pollen / firefly particles (40, drift upward) ----
    const POLLEN = 40;
    this.pollenPositions = new Float32Array(POLLEN * 3);
    this.pollenVelocities = new Float32Array(POLLEN);
    for (let i = 0; i < POLLEN; i++) {
      this.pollenPositions[i * 3] = (Math.random() - 0.5) * 8;
      this.pollenPositions[i * 3 + 1] = 0.5 + Math.random() * 2.5;
      this.pollenPositions[i * 3 + 2] = (Math.random() - 0.5) * 8;
      this.pollenVelocities[i] = 0.04 + Math.random() * 0.06;
    }
    this.pollenGeometry = new THREE.BufferGeometry();
    this.pollenGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(this.pollenPositions, 3),
    );
    const pollenMat = new THREE.PointsMaterial({
      color: new THREE.Color('#FFE0A0'),
      size: 0.06,
      transparent: true,
      opacity: 0.7,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    this.pollenPoints = new THREE.Points(this.pollenGeometry, pollenMat);
    this.add(this.pollenPoints);

    // ---- Lights ----
    this.sunlight = new THREE.PointLight(0xffe4b5, 0.5, 18);
    this.sunlight.position.set(0, 5, 0);
    this.add(this.sunlight);

    this.warmGlow = new THREE.PointLight(0xffe0a0, 0.3, 10);
    this.warmGlow.position.set(0, 0.4, 0);
    this.add(this.warmGlow);
  }

  private registerMaterial(m: THREE.MeshStandardMaterial): void {
    this.highlightables.push(m);
    this.baseEmissiveIntensities.push(m.emissiveIntensity ?? 0);
  }

  update(delta: number): void {
    this.sunlight.intensity =
      0.48 + Math.sin(performance.now() * 0.0009) * 0.04;
    this.warmGlow.intensity =
      0.28 + Math.sin(performance.now() * 0.0014 + 1.2) * 0.04;

    const arr = (this.pollenGeometry.attributes.position as THREE.BufferAttribute)
      .array as Float32Array;
    const t = performance.now() * 0.001;
    for (let i = 0; i < this.pollenVelocities.length; i++) {
      arr[i * 3 + 1] += this.pollenVelocities[i] * delta;
      arr[i * 3] += Math.sin(t + i) * 0.002;
      if (arr[i * 3 + 1] > 3.5) {
        arr[i * 3] = (Math.random() - 0.5) * 8;
        arr[i * 3 + 1] = 0.4;
        arr[i * 3 + 2] = (Math.random() - 0.5) * 8;
      }
    }
    (this.pollenGeometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;
  }

  setHighlight(active: boolean): void {
    this.highlightables.forEach((m, i) => {
      m.emissive.set(active ? '#88FF88' : '#000000');
      m.emissiveIntensity = active ? 0.15 : this.baseEmissiveIntensities[i] ?? 0;
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
