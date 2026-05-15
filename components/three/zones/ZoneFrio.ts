import * as THREE from 'three';
import type { ZoneConfig } from '@/lib/types';
import { disposeObject } from '@/lib/three-utils';
import { createGlassMaterial } from '../shaders/glassShader';

export class ZoneFrio extends THREE.Group {
  readonly config: ZoneConfig;
  private highlightables: THREE.MeshStandardMaterial[] = [];
  private baseEmissiveIntensities: number[] = [];
  private frostGeometry: THREE.BufferGeometry;
  private frostPositions: Float32Array;
  private frostVelocities: Float32Array;
  private frostPoints: THREE.Points;
  private coldLight: THREE.PointLight;

  constructor(config: ZoneConfig) {
    super();
    this.config = config;
    this.name = `zone:${config.id}`;
    this.userData = { zoneId: config.id };
    this.position.set(config.position.x, config.position.y, config.position.z);

    // Reflective floor
    const floorGeo = new THREE.PlaneGeometry(8, 8);
    const floorMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#334455'),
      metalness: 0.3,
      roughness: 0.6,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.add(floor);
    this.registerMaterial(floorMat);

    // Glass chamber walls
    const wallGeo = new THREE.BoxGeometry(8, 5, 8);
    const wallMat = createGlassMaterial();
    const walls = new THREE.Mesh(wallGeo, wallMat);
    walls.position.y = 2.5;
    walls.userData = { objectId: `${config.id}:chamber` };
    this.add(walls);

    // Frame edges (wireframe-style)
    const edges = new THREE.EdgesGeometry(wallGeo);
    const edgeMat = new THREE.LineBasicMaterial({
      color: new THREE.Color('#88AADD'),
      transparent: true,
      opacity: 0.6,
    });
    const edgeLines = new THREE.LineSegments(edges, edgeMat);
    edgeLines.position.y = 2.5;
    this.add(edgeLines);

    // 6 pallets stacked (2 rows of 3)
    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 3; col++) {
        const palletGeo = new THREE.BoxGeometry(1.2, 0.15, 1.0);
        const palletMat = new THREE.MeshStandardMaterial({
          color: new THREE.Color('#6E4C2A'),
          roughness: 0.9,
        });
        const palletY = row === 0 ? 0.075 : 1.4;
        const palletX = -2.5 + col * 2.5;
        const pallet = new THREE.Mesh(palletGeo, palletMat);
        pallet.position.set(palletX, palletY, row === 0 ? -1.2 : 1.2);
        pallet.castShadow = true;
        pallet.userData = { objectId: `${config.id}:pallet-${row}-${col}` };
        this.add(pallet);
        this.registerMaterial(palletMat);

        // Boxes on each pallet
        for (let bx = 0; bx < 2; bx++) {
          for (let bz = 0; bz < 2; bz++) {
            const boxGeo = new THREE.BoxGeometry(0.45, 0.35, 0.4);
            const boxMat = new THREE.MeshStandardMaterial({
              color: new THREE.Color('#C8A77A'),
              roughness: 0.8,
            });
            const box = new THREE.Mesh(boxGeo, boxMat);
            box.position.set(
              palletX - 0.25 + bx * 0.5,
              palletY + 0.25,
              (row === 0 ? -1.2 : 1.2) - 0.22 + bz * 0.44,
            );
            box.castShadow = true;
            this.add(box);
            this.registerMaterial(boxMat);
          }
        }
      }
    }

    // Temperature sensors at corners (4)
    const sensorCorners: Array<[number, number]> = [
      [-3.6, -3.6],
      [3.6, -3.6],
      [-3.6, 3.6],
      [3.6, 3.6],
    ];
    sensorCorners.forEach((c, i) => {
      const sensorGeo = new THREE.SphereGeometry(0.12, 8, 8);
      const sensorMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color('#FF4444'),
        emissive: new THREE.Color('#FF4444'),
        emissiveIntensity: 0.9,
      });
      const sensor = new THREE.Mesh(sensorGeo, sensorMat);
      sensor.position.set(c[0], 4.6, c[1]);
      sensor.userData = { objectId: `${config.id}:sensor-${i}` };
      this.add(sensor);
      this.registerMaterial(sensorMat);
    });

    // Cold blue light inside
    this.coldLight = new THREE.PointLight(0x4488ff, 0.7, 14);
    this.coldLight.position.set(0, 4, 0);
    this.add(this.coldLight);

    // Frost particles drifting downward
    const FROST_COUNT = 80;
    this.frostPositions = new Float32Array(FROST_COUNT * 3);
    this.frostVelocities = new Float32Array(FROST_COUNT);
    for (let i = 0; i < FROST_COUNT; i++) {
      this.frostPositions[i * 3 + 0] = (Math.random() - 0.5) * 7;
      this.frostPositions[i * 3 + 1] = Math.random() * 4.5 + 0.2;
      this.frostPositions[i * 3 + 2] = (Math.random() - 0.5) * 7;
      this.frostVelocities[i] = 0.15 + Math.random() * 0.25;
    }
    this.frostGeometry = new THREE.BufferGeometry();
    this.frostGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(this.frostPositions, 3),
    );
    const frostMat = new THREE.PointsMaterial({
      color: new THREE.Color('#E6F2FF'),
      size: 0.08,
      transparent: true,
      opacity: 0.7,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    this.frostPoints = new THREE.Points(this.frostGeometry, frostMat);
    this.add(this.frostPoints);
  }

  private registerMaterial(m: THREE.MeshStandardMaterial): void {
    this.highlightables.push(m);
    this.baseEmissiveIntensities.push(m.emissiveIntensity ?? 0);
  }

  update(delta: number): void {
    // Drift frost particles down; recycle when below floor
    const posAttr = this.frostGeometry.attributes
      .position as THREE.BufferAttribute;
    const arr = posAttr.array as Float32Array;
    for (let i = 0; i < this.frostVelocities.length; i++) {
      arr[i * 3 + 1] -= this.frostVelocities[i] * delta;
      if (arr[i * 3 + 1] < 0.1) {
        arr[i * 3 + 0] = (Math.random() - 0.5) * 7;
        arr[i * 3 + 1] = 4.6;
        arr[i * 3 + 2] = (Math.random() - 0.5) * 7;
      }
    }
    posAttr.needsUpdate = true;

    // Cold light gentle pulse
    this.coldLight.intensity = 0.6 + 0.1 * Math.sin(performance.now() * 0.0012);
  }

  setHighlight(active: boolean): void {
    this.highlightables.forEach((m, i) => {
      m.emissive.set(active ? '#4488FF' : '#000000');
      m.emissiveIntensity = active ? 0.25 : this.baseEmissiveIntensities[i] ?? 0;
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
      m.emissiveIntensity = clamped * 0.45;
    });
  }

  getBoundingBox(): THREE.Box3 {
    return new THREE.Box3().setFromObject(this);
  }

  dispose(): void {
    disposeObject(this);
  }
}
