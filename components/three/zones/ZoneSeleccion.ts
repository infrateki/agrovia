import * as THREE from 'three';
import type { ZoneConfig } from '@/lib/types';
import { disposeObject } from '@/lib/three-utils';

/**
 * The Sorting Line — conveyor with rollers, 3 sorting stations (table+screen+arm+chute),
 * reject bin with rejected fruit, ceiling frame + overhead lights, camera inspection,
 * safety railing, scattered berries on floor, fruit moving along the belt.
 * Target: 45+ meshes.
 */
export class ZoneSeleccion extends THREE.Group {
  readonly config: ZoneConfig;
  private highlightables: THREE.MeshStandardMaterial[] = [];
  private baseEmissiveIntensities: number[] = [];
  private beltMat: THREE.MeshStandardMaterial;
  private screenMaterials: THREE.MeshStandardMaterial[] = [];
  private fruitOnBelt: THREE.InstancedMesh;
  private fruitDummy = new THREE.Object3D();
  private fruitOffsets: Float32Array;
  private fruitMoveT = 0;
  private readonly fruitCount = 14;

  constructor(config: ZoneConfig) {
    super();
    this.config = config;
    this.name = `zone:${config.id}`;
    this.userData = { zoneId: config.id };
    this.position.set(config.position.x, config.position.y, config.position.z);

    // ---- Floor pad ----
    const padMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#2C2C32'),
      roughness: 0.9,
    });
    const pad = new THREE.Mesh(new THREE.PlaneGeometry(8, 6), padMat);
    pad.rotation.x = -Math.PI / 2;
    pad.receiveShadow = true;
    this.add(pad);
    this.registerMaterial(padMat);

    // ---- Conveyor belt (rubber) ----
    this.beltMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#1A1A1A'),
      roughness: 0.95,
      metalness: 0.0,
    });
    const belt = new THREE.Mesh(
      new THREE.BoxGeometry(8, 0.15, 1.8),
      this.beltMat,
    );
    belt.position.set(0, 0.85, 0);
    belt.castShadow = true;
    belt.userData = { objectId: `${config.id}:belt` };
    this.add(belt);
    this.registerMaterial(this.beltMat);

    // 8 rollers (InstancedMesh)
    const rollerMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#8A8A8A'),
      metalness: 0.85,
      roughness: 0.35,
    });
    const rollerGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.8, 10);
    const rollers = new THREE.InstancedMesh(rollerGeo, rollerMat, 8);
    const rd = new THREE.Object3D();
    for (let i = 0; i < 8; i++) {
      rd.position.set(-3.5 + i * 1.0, 0.65, 0);
      rd.rotation.set(Math.PI / 2, 0, 0);
      rd.updateMatrix();
      rollers.setMatrixAt(i, rd.matrix);
    }
    rollers.instanceMatrix.needsUpdate = true;
    this.add(rollers);
    this.registerMaterial(rollerMat);

    // Side rails on belt
    const railMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#8A8A8A'),
      metalness: 0.8,
      roughness: 0.4,
    });
    [-0.95, 0.95].forEach((zo) => {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(8, 0.4, 0.08), railMat);
      rail.position.set(0, 1.1, zo);
      this.add(rail);
    });
    this.registerMaterial(railMat);

    // ---- Sorting stations (3) ----
    const stationMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#6B6B6B'),
      roughness: 0.45,
      metalness: 0.75,
    });
    const armMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#6B6B6B'),
      metalness: 0.85,
      roughness: 0.4,
    });
    const chuteMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#46393B'),
      roughness: 0.7,
    });
    const tableGeo = new THREE.BoxGeometry(1.2, 0.6, 0.8);
    const screenGeo = new THREE.PlaneGeometry(0.4, 0.28);
    const armGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.7, 6);
    const armEndGeo = new THREE.BoxGeometry(0.18, 0.08, 0.18);
    const chuteGeo = new THREE.BoxGeometry(0.18, 0.04, 0.6);
    [-2.5, 0, 2.5].forEach((sx, i) => {
      const table = new THREE.Mesh(tableGeo, stationMat);
      table.position.set(sx, 0.3, -1.7);
      table.castShadow = true;
      table.userData = { objectId: `${config.id}:station-${i}` };
      this.add(table);

      const screenMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color('#0A1A2A'),
        emissive: new THREE.Color('#4488FF'),
        emissiveIntensity: 0.8,
        roughness: 0.3,
      });
      const screen = new THREE.Mesh(screenGeo, screenMat);
      screen.position.set(sx, 0.85, -1.3);
      screen.rotation.x = -0.18;
      this.add(screen);
      this.screenMaterials.push(screenMat);

      const arm = new THREE.Mesh(armGeo, armMat);
      arm.position.set(sx, 1.05, -1.7);
      this.add(arm);
      const armEnd = new THREE.Mesh(armEndGeo, armMat);
      armEnd.position.set(sx, 1.4, -1.7);
      this.add(armEnd);

      const chute = new THREE.Mesh(chuteGeo, chuteMat);
      chute.position.set(sx, 0.5, -2.4);
      chute.rotation.x = -0.45;
      this.add(chute);
    });
    this.registerMaterial(stationMat);
    this.registerMaterial(armMat);
    this.registerMaterial(chuteMat);

    // ---- Reject bin (open-top behind chutes) ----
    const rejectBinMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#3E1A1A'),
      roughness: 0.85,
    });
    const rejectBin = new THREE.Mesh(
      new THREE.BoxGeometry(7.5, 0.3, 0.5),
      rejectBinMat,
    );
    rejectBin.position.set(0, 0.15, -2.85);
    rejectBin.userData = { objectId: `${config.id}:reject-bin` };
    this.add(rejectBin);
    this.registerMaterial(rejectBinMat);
    const rejectBerryMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#5A1A2A'),
      roughness: 0.5,
    });
    const rejectBerryGeo = new THREE.SphereGeometry(0.05, 6, 5);
    const rejectBerries = new THREE.InstancedMesh(rejectBerryGeo, rejectBerryMat, 24);
    const rbd = new THREE.Object3D();
    for (let i = 0; i < 24; i++) {
      rbd.position.set(
        -3.5 + Math.random() * 7,
        0.32 + Math.random() * 0.05,
        -2.85 + (Math.random() - 0.5) * 0.4,
      );
      rbd.updateMatrix();
      rejectBerries.setMatrixAt(i, rbd.matrix);
    }
    rejectBerries.instanceMatrix.needsUpdate = true;
    this.add(rejectBerries);
    this.registerMaterial(rejectBerryMat);

    // ---- Ceiling frame (wireframe edges) ----
    const frameGeo = new THREE.BoxGeometry(8, 3, 6);
    const frameEdges = new THREE.EdgesGeometry(frameGeo);
    const frameLines = new THREE.LineSegments(
      frameEdges,
      new THREE.LineBasicMaterial({
        color: new THREE.Color('#444448'),
        transparent: true,
        opacity: 0.4,
      }),
    );
    frameLines.position.y = 1.5;
    this.add(frameLines);

    // ---- Overhead industrial lights (4) ----
    const lampMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#FFFFFF'),
      emissive: new THREE.Color('#FFE9C4'),
      emissiveIntensity: 1.0,
    });
    const stemMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#6B6B6B'),
      metalness: 0.8,
      roughness: 0.4,
    });
    const stemGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.4, 5);
    const lampGeo = new THREE.BoxGeometry(0.6, 0.05, 0.15);
    [-2.4, -0.8, 0.8, 2.4].forEach((lx) => {
      const stem = new THREE.Mesh(stemGeo, stemMat);
      stem.position.set(lx, 2.8, 0);
      this.add(stem);
      const lamp = new THREE.Mesh(lampGeo, lampMat);
      lamp.position.set(lx, 2.6, 0);
      this.add(lamp);
    });
    this.registerMaterial(stemMat);
    // lamp material intentionally NOT registered — keep it always emissive

    // ---- Camera inspection station ----
    const camPoleMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#6B6B6B'),
      metalness: 0.8,
      roughness: 0.4,
    });
    const camPole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, 2.2, 6),
      camPoleMat,
    );
    camPole.position.set(0, 1.1, 1.8);
    this.add(camPole);
    this.registerMaterial(camPoleMat);
    const camHeadMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#1A1A1F'),
      metalness: 0.7,
      roughness: 0.45,
    });
    const camHead = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 0.2, 0.4),
      camHeadMat,
    );
    camHead.position.set(0, 2.2, 1.6);
    camHead.userData = { objectId: `${config.id}:camera-inspection` };
    this.add(camHead);
    this.registerMaterial(camHeadMat);
    // LED kept always-on
    const camLedMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#FF4444'),
      emissive: new THREE.Color('#FF4444'),
      emissiveIntensity: 1.5,
    });
    const camLed = new THREE.Mesh(
      new THREE.SphereGeometry(0.03, 6, 5),
      camLedMat,
    );
    camLed.position.set(0.12, 2.18, 1.42);
    this.add(camLed);

    // ---- Safety railing (U-shape on dock side) ----
    const railTubeMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#D4A843'),
      metalness: 0.6,
      roughness: 0.4,
    });
    const railVertGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.0, 6);
    const railHorizGeo = new THREE.CylinderGeometry(0.04, 0.04, 7.2, 6);
    [-3.6, 3.6].forEach((vx) => {
      const v = new THREE.Mesh(railVertGeo, railTubeMat);
      v.position.set(vx, 0.5, 2.6);
      this.add(v);
    });
    const horiz = new THREE.Mesh(railHorizGeo, railTubeMat);
    horiz.position.set(0, 1.0, 2.6);
    horiz.rotation.z = Math.PI / 2;
    this.add(horiz);
    this.registerMaterial(railTubeMat);

    // ---- Scattered berries on floor ----
    const floorBerryMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#4A0E78'),
      roughness: 0.35,
      metalness: 0.0,
    });
    const floorBerryGeo = new THREE.SphereGeometry(0.04, 6, 5);
    const floorBerries = new THREE.InstancedMesh(floorBerryGeo, floorBerryMat, 10);
    const fbd = new THREE.Object3D();
    for (let i = 0; i < 10; i++) {
      fbd.position.set(
        -3 + Math.random() * 6,
        0.04,
        -1.2 + (Math.random() - 0.5) * 0.4,
      );
      fbd.updateMatrix();
      floorBerries.setMatrixAt(i, fbd.matrix);
    }
    floorBerries.instanceMatrix.needsUpdate = true;
    this.add(floorBerries);
    this.registerMaterial(floorBerryMat);

    // ---- Fruit on belt (animated, 14 instances) ----
    const beltFruitMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#4A0E78'),
      roughness: 0.35,
      metalness: 0.0,
    });
    const beltFruitGeo = new THREE.SphereGeometry(0.07, 8, 6);
    this.fruitOnBelt = new THREE.InstancedMesh(
      beltFruitGeo,
      beltFruitMat,
      this.fruitCount,
    );
    this.fruitOffsets = new Float32Array(this.fruitCount);
    for (let i = 0; i < this.fruitCount; i++) {
      this.fruitOffsets[i] = i / this.fruitCount;
    }
    this.updateFruitOnBelt(0);
    this.add(this.fruitOnBelt);
    this.registerMaterial(beltFruitMat);
  }

  private updateFruitOnBelt(t: number): void {
    for (let i = 0; i < this.fruitCount; i++) {
      const u = (this.fruitOffsets[i] + t) % 1;
      const x = -3.6 + u * 7.2;
      const z = ((i % 3) - 1) * 0.4;
      this.fruitDummy.position.set(x, 0.97, z);
      this.fruitDummy.updateMatrix();
      this.fruitOnBelt.setMatrixAt(i, this.fruitDummy.matrix);
    }
    this.fruitOnBelt.instanceMatrix.needsUpdate = true;
  }

  private registerMaterial(m: THREE.MeshStandardMaterial): void {
    this.highlightables.push(m);
    this.baseEmissiveIntensities.push(m.emissiveIntensity ?? 0);
  }

  update(delta: number): void {
    const map = this.beltMat.map;
    if (map) map.offset.x += delta * 0.6;
    this.beltMat.emissiveIntensity =
      0.04 + 0.025 * Math.sin(performance.now() * 0.003);

    const t = performance.now() * 0.003;
    this.screenMaterials.forEach((sm, i) => {
      sm.emissiveIntensity = 0.6 + 0.25 * Math.sin(t + i * 1.7);
    });

    this.fruitMoveT += delta * 0.18;
    if (this.fruitMoveT > 1) this.fruitMoveT -= 1;
    this.updateFruitOnBelt(this.fruitMoveT);
  }

  setHighlight(active: boolean): void {
    this.highlightables.forEach((m, i) => {
      m.emissive.set(active ? '#D4A843' : '#000000');
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
