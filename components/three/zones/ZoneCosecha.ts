import * as THREE from 'three';
import type { ZoneConfig } from '@/lib/types';
import { disposeObject } from '@/lib/three-utils';

export class ZoneCosecha extends THREE.Group {
  readonly config: ZoneConfig;
  private highlightables: THREE.MeshStandardMaterial[] = [];
  private baseEmissiveIntensities: number[] = [];
  private sunlight: THREE.PointLight;

  constructor(config: ZoneConfig) {
    super();
    this.config = config;
    this.name = `zone:${config.id}`;
    this.userData = { zoneId: config.id };
    this.position.set(config.position.x, config.position.y, config.position.z);

    // Green terrain with slight hills
    const terrainGeo = new THREE.PlaneGeometry(8, 8, 12, 12);
    const posAttr = terrainGeo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i);
      const y = posAttr.getY(i);
      const z = Math.sin(x * 0.6) * 0.15 + Math.cos(y * 0.5) * 0.12;
      posAttr.setZ(i, z);
    }
    terrainGeo.computeVertexNormals();
    const terrainMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#2D5A1E'),
      roughness: 0.95,
      metalness: 0.0,
    });
    const terrain = new THREE.Mesh(terrainGeo, terrainMat);
    terrain.rotation.x = -Math.PI / 2;
    terrain.receiveShadow = true;
    terrain.userData = { objectId: `${config.id}:terrain` };
    this.add(terrain);
    this.registerMaterial(terrainMat);

    // 6 trees in scattered grid
    const treePositions: Array<[number, number]> = [
      [-2.5, -2.0],
      [-1.0, 1.5],
      [1.5, -1.0],
      [2.8, 1.8],
      [0.2, -2.6],
      [-2.8, 2.4],
    ];
    treePositions.forEach((p, i) => {
      const tree = this.makeTree(`tree-${i}`);
      tree.position.set(p[0], 0, p[1]);
      this.add(tree);
    });

    // 3 harvest bins
    const binPositions: Array<[number, number]> = [
      [0, 3.2],
      [1.5, 3.4],
      [-1.5, 3.0],
    ];
    binPositions.forEach((p, i) => {
      const binGeo = new THREE.BoxGeometry(0.6, 0.4, 0.6);
      const binMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color('#6B4423'),
        roughness: 0.85,
        metalness: 0.05,
      });
      const bin = new THREE.Mesh(binGeo, binMat);
      bin.position.set(p[0], 0.2, p[1]);
      bin.castShadow = true;
      bin.userData = { objectId: `${config.id}:bin-${i}` };
      this.add(bin);
      this.registerMaterial(binMat);
    });

    // Warm sunlight point light
    this.sunlight = new THREE.PointLight(0xffe4b5, 0.35, 14);
    this.sunlight.position.set(0, 5, 0);
    this.add(this.sunlight);
  }

  private makeTree(idSuffix: string): THREE.Group {
    const tree = new THREE.Group();
    const trunkGeo = new THREE.CylinderGeometry(0.12, 0.18, 1.0, 6);
    const trunkMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#5D3A1A'),
      roughness: 0.9,
    });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 0.5;
    trunk.castShadow = true;
    tree.add(trunk);
    this.registerMaterial(trunkMat);

    const canopyGeo = new THREE.ConeGeometry(0.7, 2.0, 7);
    const canopyMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#3A7B2D'),
      roughness: 0.8,
    });
    const canopy = new THREE.Mesh(canopyGeo, canopyMat);
    canopy.position.y = 1.8;
    canopy.castShadow = true;
    tree.add(canopy);
    this.registerMaterial(canopyMat);
    tree.userData = { objectId: `${this.config.id}:${idSuffix}` };
    return tree;
  }

  private registerMaterial(m: THREE.MeshStandardMaterial): void {
    this.highlightables.push(m);
    this.baseEmissiveIntensities.push(m.emissiveIntensity ?? 0);
  }

  update(_delta: number): void {
    // Subtle sunlight flicker
    this.sunlight.intensity = 0.32 + Math.sin(performance.now() * 0.0009) * 0.03;
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
