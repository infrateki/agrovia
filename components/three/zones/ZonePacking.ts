import * as THREE from 'three';
import type { ZoneConfig } from '@/lib/types';
import { disposeObject } from '@/lib/three-utils';

export class ZonePacking extends THREE.Group {
  readonly config: ZoneConfig;
  private highlightables: THREE.MeshStandardMaterial[] = [];
  private baseEmissiveIntensities: number[] = [];

  constructor(config: ZoneConfig) {
    super();
    this.config = config;
    this.name = `zone:${config.id}`;
    this.userData = { zoneId: config.id };
    this.position.set(config.position.x, config.position.y, config.position.z);

    // Floor pad
    const padGeo = new THREE.PlaneGeometry(8, 6);
    const padMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#2A2620'),
      roughness: 0.9,
    });
    const pad = new THREE.Mesh(padGeo, padMat);
    pad.rotation.x = -Math.PI / 2;
    pad.receiveShadow = true;
    this.add(pad);
    this.registerMaterial(padMat);

    // 4 packing tables in 2x2 layout
    const tablePositions: Array<[number, number]> = [
      [-2, -1.4],
      [2, -1.4],
      [-2, 1.4],
      [2, 1.4],
    ];
    tablePositions.forEach((p, i) => {
      const tableGeo = new THREE.BoxGeometry(1.5, 0.8, 1);
      const tableMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color('#A47B4E'),
        roughness: 0.75,
      });
      const table = new THREE.Mesh(tableGeo, tableMat);
      table.position.set(p[0], 0.4, p[1]);
      table.castShadow = true;
      table.userData = { objectId: `${config.id}:table-${i}` };
      this.add(table);
      this.registerMaterial(tableMat);
    });

    // 3x3 box stacks on two tables
    const boxStackOrigins: Array<[number, number]> = [
      [-2, -1.4],
      [2, 1.4],
    ];
    boxStackOrigins.forEach((origin, stackIdx) => {
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
          const boxGeo = new THREE.BoxGeometry(0.4, 0.3, 0.5);
          const boxMat = new THREE.MeshStandardMaterial({
            color: new THREE.Color('#C18F5C'),
            roughness: 0.85,
          });
          const box = new THREE.Mesh(boxGeo, boxMat);
          box.position.set(
            origin[0] - 0.45 + col * 0.45,
            0.95 + row * 0.32,
            origin[1] - 0.3 + ((row + col) % 2) * 0.05,
          );
          box.castShadow = true;
          box.userData = {
            objectId: `${config.id}:box-${stackIdx}-${row}-${col}`,
          };
          this.add(box);
          this.registerMaterial(boxMat);
        }
      }
    });

    // 2 pallets
    [-3, 3].forEach((x, i) => {
      const palletGeo = new THREE.BoxGeometry(1.2, 0.15, 1.0);
      const palletMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color('#6E4C2A'),
        roughness: 0.9,
      });
      const pallet = new THREE.Mesh(palletGeo, palletMat);
      pallet.position.set(x, 0.075, 0);
      pallet.castShadow = true;
      pallet.userData = { objectId: `${config.id}:pallet-${i}` };
      this.add(pallet);
      this.registerMaterial(palletMat);
    });

    // Labeling machine
    const baseGeo = new THREE.BoxGeometry(0.6, 0.5, 0.6);
    const baseMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#3A3A40'),
      metalness: 0.6,
      roughness: 0.4,
    });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.set(0, 0.25, -2.4);
    base.castShadow = true;
    this.add(base);
    this.registerMaterial(baseMat);

    const headGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.5, 12);
    const headMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#FF8800'),
      emissive: new THREE.Color('#FF8800'),
      emissiveIntensity: 0.25,
      metalness: 0.5,
    });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.set(0, 0.75, -2.4);
    head.userData = { objectId: `${config.id}:labeler` };
    this.add(head);
    this.registerMaterial(headMat);
  }

  private registerMaterial(m: THREE.MeshStandardMaterial): void {
    this.highlightables.push(m);
    this.baseEmissiveIntensities.push(m.emissiveIntensity ?? 0);
  }

  update(_delta: number): void {
    // no-op (static scene)
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
