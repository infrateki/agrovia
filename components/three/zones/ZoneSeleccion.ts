import * as THREE from 'three';
import type { ZoneConfig } from '@/lib/types';
import { disposeObject } from '@/lib/three-utils';

export class ZoneSeleccion extends THREE.Group {
  readonly config: ZoneConfig;
  private highlightables: THREE.MeshStandardMaterial[] = [];
  private baseEmissiveIntensities: number[] = [];
  private beltMat: THREE.MeshStandardMaterial;

  constructor(config: ZoneConfig) {
    super();
    this.config = config;
    this.name = `zone:${config.id}`;
    this.userData = { zoneId: config.id };
    this.position.set(config.position.x, config.position.y, config.position.z);

    // Ground pad
    const padGeo = new THREE.PlaneGeometry(8, 6);
    const padMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#2C2C32'),
      roughness: 0.9,
    });
    const pad = new THREE.Mesh(padGeo, padMat);
    pad.rotation.x = -Math.PI / 2;
    pad.receiveShadow = true;
    this.add(pad);
    this.registerMaterial(padMat);

    // Conveyor belt
    const beltGeo = new THREE.BoxGeometry(7, 0.1, 1.5);
    this.beltMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#1A1A20'),
      roughness: 0.6,
      metalness: 0.2,
    });
    const belt = new THREE.Mesh(beltGeo, this.beltMat);
    belt.position.set(0, 0.8, 0);
    belt.castShadow = true;
    belt.userData = { objectId: `${config.id}:belt` };
    this.add(belt);
    this.registerMaterial(this.beltMat);

    // Conveyor side rails
    const railGeo = new THREE.BoxGeometry(7, 0.5, 0.1);
    const railMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#888A92'),
      metalness: 0.7,
      roughness: 0.35,
    });
    const railA = new THREE.Mesh(railGeo, railMat);
    railA.position.set(0, 1.0, 0.8);
    this.add(railA);
    const railB = new THREE.Mesh(railGeo, railMat);
    railB.position.set(0, 1.0, -0.8);
    this.add(railB);
    this.registerMaterial(railMat);

    // 3 sorting stations
    const stationXs = [-2.4, 0, 2.4];
    stationXs.forEach((x, i) => {
      const stationGeo = new THREE.BoxGeometry(1, 1, 1);
      const stationMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color('#5D4E37'),
        roughness: 0.5,
        metalness: 0.4,
      });
      const station = new THREE.Mesh(stationGeo, stationMat);
      station.position.set(x, 0.5, -1.8);
      station.castShadow = true;
      station.userData = { objectId: `${config.id}:station-${i}` };
      this.add(station);
      this.registerMaterial(stationMat);
    });

    // Camera poles
    [-2, 2].forEach((x, i) => {
      const poleGeo = new THREE.CylinderGeometry(0.05, 0.05, 2.2, 6);
      const poleMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color('#444448'),
        metalness: 0.6,
      });
      const pole = new THREE.Mesh(poleGeo, poleMat);
      pole.position.set(x, 1.1, 1.8);
      this.add(pole);
      this.registerMaterial(poleMat);

      const camGeo = new THREE.BoxGeometry(0.3, 0.2, 0.4);
      const camMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color('#1A1A1F'),
        emissive: new THREE.Color('#D4A843'),
        emissiveIntensity: 0.2,
        metalness: 0.5,
      });
      const cam = new THREE.Mesh(camGeo, camMat);
      cam.position.set(x, 2.2, 1.6);
      cam.userData = { objectId: `${config.id}:camera-${i}` };
      this.add(cam);
      this.registerMaterial(camMat);
    });

    // Overhead emissive lights
    [-1.5, 1.5].forEach((x) => {
      const lightGeo = new THREE.BoxGeometry(1.2, 0.05, 0.3);
      const lightMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color('#FFFFFF'),
        emissive: new THREE.Color('#FFE9C4'),
        emissiveIntensity: 0.9,
      });
      const lightMesh = new THREE.Mesh(lightGeo, lightMat);
      lightMesh.position.set(x, 2.8, 0);
      this.add(lightMesh);
      this.registerMaterial(lightMat);
    });
  }

  private registerMaterial(m: THREE.MeshStandardMaterial): void {
    this.highlightables.push(m);
    this.baseEmissiveIntensities.push(m.emissiveIntensity ?? 0);
  }

  update(delta: number): void {
    // Animate conveyor belt UV
    const map = this.beltMat.map;
    if (map) {
      map.offset.x += delta * 0.6;
    }
    // Fallback: animate by shifting color slightly for visual cue
    this.beltMat.emissiveIntensity = 0.05 + 0.03 * Math.sin(performance.now() * 0.003);
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
