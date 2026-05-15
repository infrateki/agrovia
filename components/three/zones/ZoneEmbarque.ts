import * as THREE from 'three';
import type { ZoneConfig } from '@/lib/types';
import { disposeObject } from '@/lib/three-utils';

export class ZoneEmbarque extends THREE.Group {
  readonly config: ZoneConfig;
  private highlightables: THREE.MeshStandardMaterial[] = [];
  private baseEmissiveIntensities: number[] = [];

  constructor(config: ZoneConfig) {
    super();
    this.config = config;
    this.name = `zone:${config.id}`;
    this.userData = { zoneId: config.id };
    this.position.set(config.position.x, config.position.y, config.position.z);

    // Ground pad (concrete)
    const padGeo = new THREE.PlaneGeometry(10, 6);
    const padMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#3A3A40'),
      roughness: 0.9,
    });
    const pad = new THREE.Mesh(padGeo, padMat);
    pad.rotation.x = -Math.PI / 2;
    pad.receiveShadow = true;
    this.add(pad);
    this.registerMaterial(padMat);

    // Container body — corrugated ribs via segmented box
    const containerGeo = new THREE.BoxGeometry(10, 4, 4, 30, 1, 1);
    const cposAttr = containerGeo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < cposAttr.count; i++) {
      const x = cposAttr.getX(i);
      const z = cposAttr.getZ(i);
      if (Math.abs(z) > 1.9) {
        const rib = Math.sin(x * 4.0) * 0.04;
        cposAttr.setZ(i, z + Math.sign(z) * rib);
      }
    }
    containerGeo.computeVertexNormals();
    const containerMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#7A2E2E'),
      roughness: 0.7,
      metalness: 0.35,
    });
    const container = new THREE.Mesh(containerGeo, containerMat);
    container.position.set(-1, 2, 0);
    container.castShadow = true;
    container.userData = { objectId: `${config.id}:container` };
    this.add(container);
    this.registerMaterial(containerMat);

    // Open doors on one end (right side)
    const doorGeo = new THREE.PlaneGeometry(2, 3.8);
    const doorMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#5C2222'),
      side: THREE.DoubleSide,
      roughness: 0.7,
    });
    const doorA = new THREE.Mesh(doorGeo, doorMat);
    doorA.position.set(4.4, 2, 2.2);
    doorA.rotation.y = -Math.PI / 4;
    this.add(doorA);
    const doorB = new THREE.Mesh(doorGeo, doorMat);
    doorB.position.set(4.4, 2, -2.2);
    doorB.rotation.y = Math.PI / 4;
    this.add(doorB);
    this.registerMaterial(doorMat);

    // Crane arm: 3 cylinder segments
    const craneBaseGeo = new THREE.CylinderGeometry(0.3, 0.35, 6, 8);
    const craneMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#D4A843'),
      metalness: 0.5,
      roughness: 0.5,
    });
    const craneBase = new THREE.Mesh(craneBaseGeo, craneMat);
    craneBase.position.set(-4, 3, -2.5);
    craneBase.castShadow = true;
    this.add(craneBase);
    this.registerMaterial(craneMat);

    const craneArmGeo = new THREE.CylinderGeometry(0.2, 0.2, 5, 8);
    const craneArm = new THREE.Mesh(craneArmGeo, craneMat);
    craneArm.position.set(-2, 5.8, -2.5);
    craneArm.rotation.z = Math.PI / 2.2;
    this.add(craneArm);

    const craneHookGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.5, 6);
    const craneHook = new THREE.Mesh(craneHookGeo, craneMat);
    craneHook.position.set(0, 4.5, -2.5);
    this.add(craneHook);

    // Small forklift body + cylinder wheels
    const forkBodyGeo = new THREE.BoxGeometry(1.2, 0.7, 0.8);
    const forkMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#FF8800'),
      roughness: 0.5,
      metalness: 0.4,
    });
    const forkBody = new THREE.Mesh(forkBodyGeo, forkMat);
    forkBody.position.set(3, 0.5, 2.6);
    forkBody.castShadow = true;
    forkBody.userData = { objectId: `${config.id}:forklift` };
    this.add(forkBody);
    this.registerMaterial(forkMat);

    const wheelGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.15, 10);
    const wheelMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#1A1A20'),
      roughness: 0.9,
    });
    const wheelOffsets: Array<[number, number]> = [
      [-0.5, 0.3],
      [0.5, 0.3],
      [-0.5, -0.3],
      [0.5, -0.3],
    ];
    wheelOffsets.forEach((p) => {
      const wheel = new THREE.Mesh(wheelGeo, wheelMat);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(3 + p[0], 0.2, 2.6 + p[1]);
      this.add(wheel);
    });
    this.registerMaterial(wheelMat);

    // Stack of clipboards near container entrance
    const clipGeo = new THREE.BoxGeometry(0.4, 0.04, 0.55);
    const clipMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#E8DCC4'),
      roughness: 0.9,
    });
    for (let i = 0; i < 4; i++) {
      const clip = new THREE.Mesh(clipGeo, clipMat);
      clip.position.set(4.5, 0.05 + i * 0.05, 0);
      clip.rotation.y = i * 0.06;
      this.add(clip);
    }
    this.registerMaterial(clipMat);
  }

  private registerMaterial(m: THREE.MeshStandardMaterial): void {
    this.highlightables.push(m);
    this.baseEmissiveIntensities.push(m.emissiveIntensity ?? 0);
  }

  update(_delta: number): void {
    // no-op
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
