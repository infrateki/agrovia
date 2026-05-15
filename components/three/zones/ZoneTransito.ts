import * as THREE from 'three';
import type { ZoneConfig } from '@/lib/types';
import { disposeObject } from '@/lib/three-utils';

export class ZoneTransito extends THREE.Group {
  readonly config: ZoneConfig;
  private highlightables: THREE.MeshStandardMaterial[] = [];
  private baseEmissiveIntensities: number[] = [];
  private oceanGeometry: THREE.PlaneGeometry;
  private oceanInitialZ: Float32Array;

  constructor(config: ZoneConfig) {
    super();
    this.config = config;
    this.name = `zone:${config.id}`;
    this.userData = { zoneId: config.id };
    this.position.set(config.position.x, config.position.y, config.position.z);

    // Ocean plane
    this.oceanGeometry = new THREE.PlaneGeometry(12, 8, 36, 24);
    const posAttr = this.oceanGeometry.attributes.position as THREE.BufferAttribute;
    this.oceanInitialZ = new Float32Array(posAttr.count);
    for (let i = 0; i < posAttr.count; i++) {
      this.oceanInitialZ[i] = posAttr.getZ(i);
    }
    const oceanMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#1B3A4B'),
      roughness: 0.4,
      metalness: 0.5,
      transparent: true,
      opacity: 0.92,
    });
    const ocean = new THREE.Mesh(this.oceanGeometry, oceanMat);
    ocean.rotation.x = -Math.PI / 2;
    ocean.position.y = 0;
    ocean.receiveShadow = true;
    this.add(ocean);
    this.registerMaterial(oceanMat);

    // Ship hull — tapered box
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
      color: new THREE.Color('#2C3A4A'),
      roughness: 0.5,
      metalness: 0.5,
    });
    const hull = new THREE.Mesh(hullGeo, hullMat);
    hull.position.set(0, 0.8, 0);
    hull.castShadow = true;
    hull.userData = { objectId: `${config.id}:ship-hull` };
    this.add(hull);
    this.registerMaterial(hullMat);

    // Ship superstructure
    const superGeo = new THREE.BoxGeometry(1.5, 1.5, 1.5);
    const superMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#E6EDF3'),
      roughness: 0.6,
    });
    const superstructure = new THREE.Mesh(superGeo, superMat);
    superstructure.position.set(-1.5, 2.15, 0);
    superstructure.castShadow = true;
    this.add(superstructure);
    this.registerMaterial(superMat);

    // Stacked containers on deck
    const containerColors = ['#FF8800', '#4488FF', '#D4A843', '#2D8B5E'];
    for (let i = 0; i < 4; i++) {
      const cGeo = new THREE.BoxGeometry(1.4, 0.7, 1.5);
      const cMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(containerColors[i % 4]),
        roughness: 0.65,
        metalness: 0.25,
      });
      const c = new THREE.Mesh(cGeo, cMat);
      c.position.set(1.2 + i * 0.1, 1.85, -0.3 + (i % 2) * 0.6);
      c.castShadow = true;
      c.userData = { objectId: `${config.id}:deck-container-${i}` };
      this.add(c);
      this.registerMaterial(cMat);
    }

    // Data logger device — small glowing green box on deck
    const loggerGeo = new THREE.BoxGeometry(0.25, 0.1, 0.25);
    const loggerMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#1A1F1A'),
      emissive: new THREE.Color('#2DDD66'),
      emissiveIntensity: 1.2,
    });
    const logger = new THREE.Mesh(loggerGeo, loggerMat);
    logger.position.set(-1.5, 3.0, 0);
    logger.userData = { objectId: `${config.id}:data-logger` };
    this.add(logger);
    this.registerMaterial(loggerMat);

    // Route line — dashed from left edge to right edge along ocean
    const routePoints = [
      new THREE.Vector3(-6, 0.05, 0),
      new THREE.Vector3(-3, 0.05, 0.3),
      new THREE.Vector3(0, 0.05, -0.2),
      new THREE.Vector3(3, 0.05, 0.1),
      new THREE.Vector3(6, 0.05, 0),
    ];
    const routeGeo = new THREE.BufferGeometry().setFromPoints(routePoints);
    const routeMat = new THREE.LineDashedMaterial({
      color: new THREE.Color('#FFFFFF'),
      dashSize: 0.4,
      gapSize: 0.25,
      transparent: true,
      opacity: 0.7,
    });
    const routeLine = new THREE.Line(routeGeo, routeMat);
    routeLine.computeLineDistances();
    this.add(routeLine);
  }

  private registerMaterial(m: THREE.MeshStandardMaterial): void {
    this.highlightables.push(m);
    this.baseEmissiveIntensities.push(m.emissiveIntensity ?? 0);
  }

  update(_delta: number): void {
    // Animate ocean waves
    const posAttr = this.oceanGeometry.attributes.position as THREE.BufferAttribute;
    const t = performance.now() * 0.001;
    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i);
      const y = posAttr.getY(i);
      const wave = Math.sin(x * 0.4 + t) * 0.12 + Math.cos(y * 0.5 + t * 0.7) * 0.08;
      posAttr.setZ(i, this.oceanInitialZ[i] + wave);
    }
    posAttr.needsUpdate = true;
    this.oceanGeometry.computeVertexNormals();
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
