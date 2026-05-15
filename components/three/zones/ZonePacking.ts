import * as THREE from 'three';
import type { ZoneConfig } from '@/lib/types';
import { disposeObject } from '@/lib/three-utils';

/**
 * The Packing House — 2 packing lines (mini conveyor + scale + clamshell closer),
 * scattered clamshells (open + closed), label printer, palletized stacks
 * (InstancedMesh), shrink-wrap, QC desk, fluorescent ceiling lights, workers.
 * Target: 50+ meshes.
 */
export class ZonePacking extends THREE.Group {
  readonly config: ZoneConfig;
  private highlightables: THREE.MeshStandardMaterial[] = [];
  private baseEmissiveIntensities: number[] = [];
  private displayMats: THREE.MeshStandardMaterial[] = [];

  constructor(config: ZoneConfig) {
    super();
    this.config = config;
    this.name = `zone:${config.id}`;
    this.userData = { zoneId: config.id };
    this.position.set(config.position.x, config.position.y, config.position.z);

    // ---- Floor (concrete) ----
    const padMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#5A5A5A'),
      roughness: 0.9,
      metalness: 0.05,
    });
    const pad = new THREE.Mesh(new THREE.PlaneGeometry(8, 6), padMat);
    pad.rotation.x = -Math.PI / 2;
    pad.receiveShadow = true;
    this.add(pad);
    this.registerMaterial(padMat);

    // ---- 2 packing lines (parallel along X axis) ----
    const lineZ = [-1.4, 1.4];
    const lineConvMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#1A1A1A'),
      roughness: 0.95,
      metalness: 0.0,
    });
    const lineRollerMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#8A8A8A'),
      metalness: 0.85,
      roughness: 0.35,
    });
    const scaleMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#6B6B6B'),
      metalness: 0.75,
      roughness: 0.45,
    });
    const closerMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#6E4C2A'),
      roughness: 0.9,
      metalness: 0.0,
    });
    const convGeo = new THREE.BoxGeometry(3.2, 0.12, 0.6);
    const rollerGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.6, 8);
    const scaleGeo = new THREE.BoxGeometry(0.5, 0.1, 0.5);
    const displayGeo = new THREE.PlaneGeometry(0.32, 0.16);
    const closerGeo = new THREE.BoxGeometry(0.5, 0.5, 0.6);
    lineZ.forEach((lz, li) => {
      // Mini conveyor
      const conv = new THREE.Mesh(convGeo, lineConvMat);
      conv.position.set(-1.5, 0.85, lz);
      conv.castShadow = true;
      conv.userData = { objectId: `${config.id}:line-${li}-conv` };
      this.add(conv);
      // 5 rollers
      for (let r = 0; r < 5; r++) {
        const ro = new THREE.Mesh(rollerGeo, lineRollerMat);
        ro.position.set(-2.9 + r * 0.7, 0.7, lz);
        ro.rotation.x = Math.PI / 2;
        this.add(ro);
      }
      // Scale station
      const scale = new THREE.Mesh(scaleGeo, scaleMat);
      scale.position.set(0.4, 0.85, lz);
      scale.castShadow = true;
      this.add(scale);
      // Digital display on scale
      const displayMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color('#0A1A2A'),
        emissive: new THREE.Color('#2DDD66'),
        emissiveIntensity: 0.9,
      });
      const display = new THREE.Mesh(displayGeo, displayMat);
      display.position.set(0.4, 0.96, lz + 0.27);
      display.rotation.x = -0.2;
      this.add(display);
      this.displayMats.push(displayMat);
      // Clamshell closer
      const closer = new THREE.Mesh(closerGeo, closerMat);
      closer.position.set(1.4, 1.05, lz);
      closer.castShadow = true;
      this.add(closer);
    });
    this.registerMaterial(lineConvMat);
    this.registerMaterial(lineRollerMat);
    this.registerMaterial(scaleMat);
    this.registerMaterial(closerMat);

    // ---- Clamshell containers scattered along lines (~32 total) ----
    const clamshellOpenMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#E0E4E8'),
      transparent: true,
      opacity: 0.55,
      roughness: 0.3,
    });
    const clamshellClosedMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#C8CDD4'),
      roughness: 0.4,
    });
    const clamGeo = new THREE.BoxGeometry(0.15, 0.08, 0.1);
    // Use InstancedMesh: 16 open + 16 closed
    const openClams = new THREE.InstancedMesh(clamGeo, clamshellOpenMat, 16);
    const closedClams = new THREE.InstancedMesh(clamGeo, clamshellClosedMat, 16);
    const cd = new THREE.Object3D();
    let oi = 0;
    let ci = 0;
    lineZ.forEach((lz) => {
      for (let i = 0; i < 16; i++) {
        const x = -2.8 + (i / 16) * 5.6 + (Math.random() - 0.5) * 0.05;
        const z = lz + (Math.random() - 0.5) * 0.3;
        cd.position.set(x, 0.95, z);
        cd.rotation.set(0, Math.random() * 0.2, 0);
        cd.updateMatrix();
        if (i % 2 === 0 && oi < 16) {
          openClams.setMatrixAt(oi++, cd.matrix);
        } else if (ci < 16) {
          closedClams.setMatrixAt(ci++, cd.matrix);
        }
      }
    });
    openClams.instanceMatrix.needsUpdate = true;
    closedClams.instanceMatrix.needsUpdate = true;
    this.add(openClams);
    this.add(closedClams);
    this.registerMaterial(clamshellOpenMat);
    this.registerMaterial(clamshellClosedMat);
    // Berries inside open clamshells (small instanced)
    const insideBerryMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#4A0E78'),
      roughness: 0.35,
      metalness: 0.0,
    });
    const insideBerryGeo = new THREE.SphereGeometry(0.018, 5, 4);
    const insideBerries = new THREE.InstancedMesh(insideBerryGeo, insideBerryMat, 64);
    const ib = new THREE.Object3D();
    for (let i = 0; i < 64; i++) {
      const sourceIdx = i % 16;
      const tmp = new THREE.Matrix4();
      openClams.getMatrixAt(sourceIdx, tmp);
      const pos = new THREE.Vector3().setFromMatrixPosition(tmp);
      ib.position.set(
        pos.x + (Math.random() - 0.5) * 0.1,
        pos.y + 0.04,
        pos.z + (Math.random() - 0.5) * 0.06,
      );
      ib.updateMatrix();
      insideBerries.setMatrixAt(i, ib.matrix);
    }
    insideBerries.instanceMatrix.needsUpdate = true;
    this.add(insideBerries);
    this.registerMaterial(insideBerryMat);

    // ---- Label printer ----
    const printerBodyMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#6B6B6B'),
      metalness: 0.75,
      roughness: 0.4,
    });
    const printerBody = new THREE.Mesh(
      new THREE.BoxGeometry(0.55, 0.45, 0.5),
      printerBodyMat,
    );
    printerBody.position.set(2.6, 0.95, 0);
    printerBody.castShadow = true;
    printerBody.userData = { objectId: `${config.id}:label-printer` };
    this.add(printerBody);
    this.registerMaterial(printerBodyMat);
    const labelMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#FFFFFF'),
      side: THREE.DoubleSide,
      roughness: 0.95,
    });
    const label = new THREE.Mesh(new THREE.PlaneGeometry(0.18, 0.1), labelMat);
    label.position.set(2.95, 0.95, 0);
    label.rotation.y = Math.PI / 2;
    this.add(label);
    this.registerMaterial(labelMat);

    // ---- Palletizer area: 3 pallets with stacked boxes (InstancedMesh per pallet) ----
    const palletMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#6E4C2A'),
      roughness: 0.9,
      metalness: 0.0,
    });
    const masterBoxMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#B8860B'),
      roughness: 0.9,
      metalness: 0.0,
    });
    const palletGeo = new THREE.BoxGeometry(1.0, 0.12, 0.8);
    const masterBoxGeo = new THREE.BoxGeometry(0.3, 0.22, 0.25);
    const palletXs = [-3.2, -2.0, -0.8];
    palletXs.forEach((px, pi) => {
      const pallet = new THREE.Mesh(palletGeo, palletMat);
      pallet.position.set(px, 0.06, 2.2);
      pallet.castShadow = true;
      pallet.userData = { objectId: `${config.id}:pallet-${pi}` };
      this.add(pallet);

      const layerCount = 4;
      const grid = 3;
      const total = layerCount * grid * grid;
      const stack = new THREE.InstancedMesh(masterBoxGeo, masterBoxMat, total);
      const sd = new THREE.Object3D();
      let idx = 0;
      for (let layer = 0; layer < layerCount; layer++) {
        for (let gx = 0; gx < grid; gx++) {
          for (let gz = 0; gz < grid; gz++) {
            sd.position.set(
              px - 0.32 + gx * 0.32,
              0.23 + layer * 0.22,
              2.2 - 0.27 + gz * 0.27,
            );
            sd.updateMatrix();
            stack.setMatrixAt(idx++, sd.matrix);
          }
        }
      }
      stack.instanceMatrix.needsUpdate = true;
      this.add(stack);
    });
    this.registerMaterial(palletMat);
    this.registerMaterial(masterBoxMat);

    // ---- Shrink-wrap cylinder around the rightmost pallet ----
    const wrapMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#FFFFFF'),
      transparent: true,
      opacity: 0.4,
      roughness: 0.15,
      metalness: 0.1,
    });
    const wrap = new THREE.Mesh(
      new THREE.CylinderGeometry(0.7, 0.7, 1.05, 12, 1, true),
      wrapMat,
    );
    wrap.position.set(-0.8, 0.65, 2.2);
    this.add(wrap);
    this.registerMaterial(wrapMat);

    // ---- Quality check desk ----
    const qcMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#8B6F47'),
      roughness: 0.9,
      metalness: 0.0,
    });
    const qc = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.7, 0.6), qcMat);
    qc.position.set(3.2, 0.35, -2.2);
    qc.castShadow = true;
    qc.userData = { objectId: `${config.id}:qc-desk` };
    this.add(qc);
    this.registerMaterial(qcMat);
    // Clipboard
    const clipMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#E8DCC4'),
      roughness: 0.9,
    });
    const clip = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.4), clipMat);
    clip.position.set(3.2, 0.71, -2.2);
    clip.rotation.x = -Math.PI / 2;
    this.add(clip);
    this.registerMaterial(clipMat);
    // Magnifying glass
    const lensRingMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#8A8A8A'),
      metalness: 0.85,
      roughness: 0.3,
    });
    const lens = new THREE.Mesh(
      new THREE.TorusGeometry(0.08, 0.015, 6, 16),
      lensRingMat,
    );
    lens.position.set(3.4, 0.77, -2.0);
    lens.rotation.x = Math.PI / 2;
    this.add(lens);
    const handle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.015, 0.015, 0.18, 6),
      lensRingMat,
    );
    handle.position.set(3.5, 0.77, -1.9);
    handle.rotation.z = Math.PI / 4;
    this.add(handle);
    this.registerMaterial(lensRingMat);

    // ---- Workers (3) ----
    const skinMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#D4A07A'),
      roughness: 0.9,
    });
    const shirtMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#D4A843'),
      roughness: 0.75,
    });
    const bodyGeo = new THREE.CylinderGeometry(0.15, 0.18, 0.5, 8);
    const headGeo = new THREE.SphereGeometry(0.12, 8, 6);
    const workerPositions: Array<[number, number]> = [
      [-1.5, -0.4],
      [0.8, 1.0],
      [3.2, -1.0],
    ];
    workerPositions.forEach(([wx, wz], i) => {
      const body = new THREE.Mesh(bodyGeo, shirtMat);
      body.position.set(wx, 0.45, wz);
      body.castShadow = true;
      body.userData = { objectId: `${config.id}:worker-${i}` };
      this.add(body);
      const head = new THREE.Mesh(headGeo, skinMat);
      head.position.set(wx, 0.85, wz);
      head.castShadow = true;
      this.add(head);
    });
    this.registerMaterial(skinMat);
    this.registerMaterial(shirtMat);

    // ---- Fluorescent ceiling lights (3 long) ----
    const tubeMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#FFFFFF'),
      emissive: new THREE.Color('#E6F0FF'),
      emissiveIntensity: 0.9,
    });
    const tubeGeo = new THREE.CylinderGeometry(0.06, 0.06, 4, 8);
    [-1.6, 0, 1.6].forEach((tz) => {
      const tube = new THREE.Mesh(tubeGeo, tubeMat);
      tube.position.set(0, 2.85, tz);
      tube.rotation.z = Math.PI / 2;
      this.add(tube);
    });
    // tubeMat NOT registered: keeps glowing
  }

  private registerMaterial(m: THREE.MeshStandardMaterial): void {
    this.highlightables.push(m);
    this.baseEmissiveIntensities.push(m.emissiveIntensity ?? 0);
  }

  update(_delta: number): void {
    const t = performance.now() * 0.003;
    this.displayMats.forEach((dm, i) => {
      dm.emissiveIntensity = 0.7 + 0.25 * Math.sin(t + i * 1.3);
    });
  }

  setHighlight(active: boolean): void {
    this.highlightables.forEach((m, i) => {
      m.emissive.set(active ? '#FF8800' : '#000000');
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
