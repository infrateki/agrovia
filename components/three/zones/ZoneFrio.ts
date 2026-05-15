import * as THREE from 'three';
import type { ZoneConfig } from '@/lib/types';
import { disposeObject } from '@/lib/three-utils';
import { createGlassMaterial } from '../shaders/glassShader';

/**
 * The Cold Chamber — flagship zone. Glass walls + edges, 9 pallets (3×3 InstancedMesh
 * stacks), corner sensors, evaporator/condenser unit on ceiling with fan + pipes,
 * digital temperature readout, forklift inside, ice crystals on glass, thermometer,
 * "ZONA DE FRÍO" sign, strip curtain at entrance (sways), emergency button,
 * dual frost particle systems (drift + breath/mist), cold-blue point light.
 * Target: 55+ meshes.
 */
export class ZoneFrio extends THREE.Group {
  readonly config: ZoneConfig;
  private highlightables: THREE.MeshStandardMaterial[] = [];
  private baseEmissiveIntensities: number[] = [];
  private frostGeometry: THREE.BufferGeometry;
  private frostPositions: Float32Array;
  private frostVelocities: Float32Array;
  private frostPoints: THREE.Points;
  private mistGeometry: THREE.BufferGeometry;
  private mistPositions: Float32Array;
  private mistVelocities: Float32Array;
  private mistPoints: THREE.Points;
  private coldLight: THREE.PointLight;
  private fanMesh: THREE.Mesh;
  private iceCrystalMats: THREE.MeshStandardMaterial[] = [];
  private curtainStrips: THREE.Mesh[] = [];
  private displayCanvas?: HTMLCanvasElement;
  private displayTexture?: THREE.CanvasTexture;

  constructor(config: ZoneConfig) {
    super();
    this.config = config;
    this.name = `zone:${config.id}`;
    this.userData = { zoneId: config.id };
    this.position.set(config.position.x, config.position.y, config.position.z);

    // ---- Reflective chamber floor (slick polished concrete) ----
    const floorMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#404A55'),
      metalness: 0.35,
      roughness: 0.45,
    });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(8, 8), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.add(floor);
    this.registerMaterial(floorMat);

    // ---- Glass chamber walls ----
    const wallGeo = new THREE.BoxGeometry(8, 5, 8);
    const wallMat = createGlassMaterial();
    const walls = new THREE.Mesh(wallGeo, wallMat);
    walls.position.y = 2.5;
    walls.userData = { objectId: `${config.id}:chamber` };
    this.add(walls);

    // Frame edges
    const edges = new THREE.EdgesGeometry(wallGeo);
    const edgeLines = new THREE.LineSegments(
      edges,
      new THREE.LineBasicMaterial({
        color: new THREE.Color('#88AADD'),
        transparent: true,
        opacity: 0.6,
      }),
    );
    edgeLines.position.y = 2.5;
    this.add(edgeLines);

    // ---- 9 pallets in 3×3 grid ----
    const palletMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#6E4C2A'),
      roughness: 0.9,
      metalness: 0.0,
    });
    const palletBoxMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#C8A77A'),
      roughness: 0.9,
      metalness: 0.0,
    });
    const palletGeo = new THREE.BoxGeometry(1.0, 0.12, 0.9);
    const palletBoxGeo = new THREE.BoxGeometry(0.42, 0.32, 0.38);
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        const px = -2.5 + col * 2.5;
        const pz = -2.5 + row * 2.5;
        const pallet = new THREE.Mesh(palletGeo, palletMat);
        pallet.position.set(px, 0.06, pz);
        pallet.castShadow = true;
        pallet.userData = { objectId: `${config.id}:pallet-${row}-${col}` };
        this.add(pallet);
        // 4 boxes per pallet (InstancedMesh)
        const stack = new THREE.InstancedMesh(palletBoxGeo, palletBoxMat, 4);
        const sd = new THREE.Object3D();
        let idx = 0;
        for (let bx = 0; bx < 2; bx++) {
          for (let bz = 0; bz < 2; bz++) {
            sd.position.set(
              px - 0.22 + bx * 0.44,
              0.28,
              pz - 0.2 + bz * 0.4,
            );
            sd.updateMatrix();
            stack.setMatrixAt(idx++, sd.matrix);
          }
        }
        stack.instanceMatrix.needsUpdate = true;
        this.add(stack);
      }
    }
    this.registerMaterial(palletMat);
    this.registerMaterial(palletBoxMat);

    // ---- Corner temperature sensors ----
    const sensorMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#FF4444'),
      emissive: new THREE.Color('#FF4444'),
      emissiveIntensity: 0.9,
    });
    const sensorGeo = new THREE.SphereGeometry(0.12, 8, 8);
    const corners: Array<[number, number]> = [
      [-3.6, -3.6],
      [3.6, -3.6],
      [-3.6, 3.6],
      [3.6, 3.6],
    ];
    corners.forEach((c, i) => {
      const sensor = new THREE.Mesh(sensorGeo, sensorMat);
      sensor.position.set(c[0], 4.6, c[1]);
      sensor.userData = { objectId: `${config.id}:sensor-${i}` };
      this.add(sensor);
    });
    // sensor mat NOT registered — always glows red

    // ---- Evaporator unit on ceiling ----
    const evapMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#8A8A8A'),
      metalness: 0.85,
      roughness: 0.4,
    });
    const evap = new THREE.Mesh(
      new THREE.BoxGeometry(3, 0.4, 1.5),
      evapMat,
    );
    evap.position.set(0, 4.6, 0);
    evap.userData = { objectId: `${config.id}:evaporator` };
    this.add(evap);
    this.registerMaterial(evapMat);
    // Twin fan grilles (cylinders)
    const fanRingMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#6B6B6B'),
      metalness: 0.85,
      roughness: 0.4,
    });
    [-0.8, 0.8].forEach((fx) => {
      const ring = new THREE.Mesh(
        new THREE.CylinderGeometry(0.4, 0.4, 0.06, 12),
        fanRingMat,
      );
      ring.position.set(fx, 4.4, 0);
      this.add(ring);
    });
    this.registerMaterial(fanRingMat);
    // One spinning fan blade for effect (single mesh, rotates in update)
    const bladeMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#8A8A8A'),
      metalness: 0.85,
      roughness: 0.35,
      side: THREE.DoubleSide,
    });
    this.fanMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.7, 0.02, 0.08),
      bladeMat,
    );
    this.fanMesh.position.set(0.8, 4.36, 0);
    this.add(this.fanMesh);
    this.registerMaterial(bladeMat);
    // Ceiling pipes (2 long cylinders along ceiling)
    const pipeMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#8A8A8A'),
      metalness: 0.85,
      roughness: 0.35,
    });
    const pipeGeo = new THREE.CylinderGeometry(0.08, 0.08, 7, 8);
    [-2.8, 2.8].forEach((pz) => {
      const pipe = new THREE.Mesh(pipeGeo, pipeMat);
      pipe.position.set(0, 4.85, pz);
      pipe.rotation.z = Math.PI / 2;
      this.add(pipe);
    });
    this.registerMaterial(pipeMat);

    // ---- Digital temperature readout (CanvasTexture) ----
    if (typeof document !== 'undefined') {
      this.displayCanvas = document.createElement('canvas');
      this.displayCanvas.width = 256;
      this.displayCanvas.height = 96;
      const ctx = this.displayCanvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#0A0E14';
        ctx.fillRect(0, 0, 256, 96);
        ctx.fillStyle = '#4488FF';
        ctx.font = 'bold 56px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('-0.5°C', 128, 52);
        ctx.fillStyle = '#8B949E';
        ctx.font = '12px monospace';
        ctx.fillText('CHAMBER · OK', 128, 86);
      }
      this.displayTexture = new THREE.CanvasTexture(this.displayCanvas);
      this.displayTexture.needsUpdate = true;
    }
    const displayMat = new THREE.MeshStandardMaterial({
      map: this.displayTexture ?? null,
      color: new THREE.Color('#FFFFFF'),
      emissive: new THREE.Color('#4488FF'),
      emissiveIntensity: 0.4,
      emissiveMap: this.displayTexture ?? null,
    });
    const display = new THREE.Mesh(
      new THREE.PlaneGeometry(0.9, 0.34),
      displayMat,
    );
    display.position.set(-3.95, 3.2, 0);
    display.rotation.y = Math.PI / 2;
    display.userData = { objectId: `${config.id}:display` };
    this.add(display);

    // ---- Forklift inside ----
    const forkBodyMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#FF8800'),
      roughness: 0.5,
      metalness: 0.4,
    });
    const forkBody = new THREE.Mesh(
      new THREE.BoxGeometry(0.9, 0.55, 0.6),
      forkBodyMat,
    );
    forkBody.position.set(2.8, 0.45, 3.2);
    forkBody.castShadow = true;
    forkBody.userData = { objectId: `${config.id}:forklift` };
    this.add(forkBody);
    this.registerMaterial(forkBodyMat);
    // Mast
    const mastMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#6B6B6B'),
      metalness: 0.85,
      roughness: 0.4,
    });
    const mast = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.06, 1.5, 6),
      mastMat,
    );
    mast.position.set(2.45, 1.0, 3.2);
    this.add(mast);
    this.registerMaterial(mastMat);
    // Forks (2)
    const forkTineMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#8A8A8A'),
      metalness: 0.85,
      roughness: 0.35,
    });
    [-0.12, 0.12].forEach((fz) => {
      const tine = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.04, 0.06),
        forkTineMat,
      );
      tine.position.set(2.15, 0.18, 3.2 + fz);
      this.add(tine);
    });
    this.registerMaterial(forkTineMat);
    // Wheels
    const wheelMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#1A1A1A'),
      roughness: 0.95,
      metalness: 0.0,
    });
    const wheelGeo = new THREE.CylinderGeometry(0.13, 0.13, 0.1, 10);
    const wOff: Array<[number, number]> = [
      [-0.35, 0.28],
      [0.35, 0.28],
      [-0.35, -0.28],
      [0.35, -0.28],
    ];
    wOff.forEach((p) => {
      const wheel = new THREE.Mesh(wheelGeo, wheelMat);
      wheel.position.set(2.8 + p[0], 0.13, 3.2 + p[1]);
      wheel.rotation.z = Math.PI / 2;
      this.add(wheel);
    });
    this.registerMaterial(wheelMat);

    // ---- Ice crystals on inner glass walls (sparkle in update) ----
    const iceCrystalGeo = new THREE.PlaneGeometry(0.18, 0.18);
    for (let i = 0; i < 20; i++) {
      const m = new THREE.MeshStandardMaterial({
        color: new THREE.Color('#E6F2FF'),
        emissive: new THREE.Color('#88AADD'),
        emissiveIntensity: 0.4 + Math.random() * 0.4,
        transparent: true,
        opacity: 0.45,
        side: THREE.DoubleSide,
      });
      const crystal = new THREE.Mesh(iceCrystalGeo, m);
      // Distribute across the 4 walls
      const wallChoice = i % 4;
      const u = (Math.random() - 0.5) * 6.5;
      const v = 0.6 + Math.random() * 3.4;
      if (wallChoice === 0) crystal.position.set(u, v, -3.95);
      else if (wallChoice === 1) {
        crystal.position.set(u, v, 3.95);
        crystal.rotation.y = Math.PI;
      } else if (wallChoice === 2) {
        crystal.position.set(-3.95, v, u);
        crystal.rotation.y = Math.PI / 2;
      } else {
        crystal.position.set(3.95, v, u);
        crystal.rotation.y = -Math.PI / 2;
      }
      this.add(crystal);
      this.iceCrystalMats.push(m);
    }

    // ---- Thermometer near door ----
    const thermBodyMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#E6EDF3'),
      roughness: 0.4,
    });
    const thermBody = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, 0.6, 8),
      thermBodyMat,
    );
    thermBody.position.set(-3.8, 0.7, 2.5);
    this.add(thermBody);
    this.registerMaterial(thermBodyMat);
    const mercuryMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#FF4444'),
      emissive: new THREE.Color('#FF4444'),
      emissiveIntensity: 0.5,
    });
    const mercury = new THREE.Mesh(
      new THREE.CylinderGeometry(0.025, 0.025, 0.18, 6),
      mercuryMat,
    );
    mercury.position.set(-3.8, 0.49, 2.5);
    this.add(mercury);
    // mercury kept always emissive — not registered

    // ---- "ZONA DE FRÍO" sign (CanvasTexture) ----
    if (typeof document !== 'undefined') {
      const signCanvas = document.createElement('canvas');
      signCanvas.width = 512;
      signCanvas.height = 128;
      const ctx = signCanvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#1A3A5C';
        ctx.fillRect(0, 0, 512, 128);
        ctx.strokeStyle = '#4488FF';
        ctx.lineWidth = 6;
        ctx.strokeRect(8, 8, 496, 112);
        ctx.fillStyle = '#E6F2FF';
        ctx.font = 'bold 56px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('ZONA DE FRÍO', 256, 64);
      }
      const signTex = new THREE.CanvasTexture(signCanvas);
      const signMat = new THREE.MeshStandardMaterial({
        map: signTex,
        emissive: new THREE.Color('#4488FF'),
        emissiveIntensity: 0.25,
        emissiveMap: signTex,
        transparent: true,
      });
      const sign = new THREE.Mesh(
        new THREE.PlaneGeometry(2.6, 0.65),
        signMat,
      );
      sign.position.set(0, 4.0, 3.95);
      sign.userData = { objectId: `${config.id}:sign` };
      this.add(sign);
    }

    // ---- Strip curtain at entrance (5 strips, sway in update) ----
    const stripMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#A0CCE0'),
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide,
      roughness: 0.2,
    });
    for (let s = 0; s < 5; s++) {
      const strip = new THREE.Mesh(
        new THREE.PlaneGeometry(0.4, 2.4),
        stripMat,
      );
      strip.position.set(-1.2 + s * 0.4, 1.4, 3.95);
      this.add(strip);
      this.curtainStrips.push(strip);
    }
    this.registerMaterial(stripMat);

    // ---- Emergency button on wall ----
    const buttonBaseMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#E6EDF3'),
      roughness: 0.5,
    });
    const buttonBase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 0.04, 12),
      buttonBaseMat,
    );
    buttonBase.position.set(3.92, 1.4, 2.0);
    buttonBase.rotation.z = Math.PI / 2;
    this.add(buttonBase);
    this.registerMaterial(buttonBaseMat);
    const buttonMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#FF1A1A'),
      emissive: new THREE.Color('#FF4444'),
      emissiveIntensity: 0.6,
      roughness: 0.4,
    });
    const button = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.06, 0.05, 12),
      buttonMat,
    );
    button.position.set(3.88, 1.4, 2.0);
    button.rotation.z = Math.PI / 2;
    this.add(button);
    // button kept always emissive

    // ---- Cold blue point light ----
    this.coldLight = new THREE.PointLight(0x4488ff, 0.7, 14);
    this.coldLight.position.set(0, 4, 0);
    this.add(this.coldLight);

    // ---- Frost particles (drift down) ----
    const FROST_COUNT = 80;
    this.frostPositions = new Float32Array(FROST_COUNT * 3);
    this.frostVelocities = new Float32Array(FROST_COUNT);
    for (let i = 0; i < FROST_COUNT; i++) {
      this.frostPositions[i * 3] = (Math.random() - 0.5) * 7;
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

    // ---- Visible breath/mist (bigger + slower) ----
    const MIST_COUNT = 30;
    this.mistPositions = new Float32Array(MIST_COUNT * 3);
    this.mistVelocities = new Float32Array(MIST_COUNT);
    for (let i = 0; i < MIST_COUNT; i++) {
      this.mistPositions[i * 3] = (Math.random() - 0.5) * 6.5;
      this.mistPositions[i * 3 + 1] = Math.random() * 4 + 0.2;
      this.mistPositions[i * 3 + 2] = (Math.random() - 0.5) * 6.5;
      this.mistVelocities[i] = 0.05 + Math.random() * 0.1;
    }
    this.mistGeometry = new THREE.BufferGeometry();
    this.mistGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(this.mistPositions, 3),
    );
    const mistMat = new THREE.PointsMaterial({
      color: new THREE.Color('#CCE0F0'),
      size: 0.22,
      transparent: true,
      opacity: 0.4,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    this.mistPoints = new THREE.Points(this.mistGeometry, mistMat);
    this.add(this.mistPoints);
  }

  private registerMaterial(m: THREE.MeshStandardMaterial): void {
    this.highlightables.push(m);
    this.baseEmissiveIntensities.push(m.emissiveIntensity ?? 0);
  }

  update(delta: number): void {
    // Frost particles
    const frostArr = (this.frostGeometry.attributes.position as THREE.BufferAttribute)
      .array as Float32Array;
    for (let i = 0; i < this.frostVelocities.length; i++) {
      frostArr[i * 3 + 1] -= this.frostVelocities[i] * delta;
      if (frostArr[i * 3 + 1] < 0.1) {
        frostArr[i * 3] = (Math.random() - 0.5) * 7;
        frostArr[i * 3 + 1] = 4.6;
        frostArr[i * 3 + 2] = (Math.random() - 0.5) * 7;
      }
    }
    (this.frostGeometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;

    // Mist particles (slower, also drift down)
    const mistArr = (this.mistGeometry.attributes.position as THREE.BufferAttribute)
      .array as Float32Array;
    const mt = performance.now() * 0.0006;
    for (let i = 0; i < this.mistVelocities.length; i++) {
      mistArr[i * 3 + 1] -= this.mistVelocities[i] * delta * 0.5;
      mistArr[i * 3] += Math.sin(mt + i) * 0.003;
      if (mistArr[i * 3 + 1] < 0.1) {
        mistArr[i * 3] = (Math.random() - 0.5) * 6.5;
        mistArr[i * 3 + 1] = 4.4;
        mistArr[i * 3 + 2] = (Math.random() - 0.5) * 6.5;
      }
    }
    (this.mistGeometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;

    // Cold light gentle pulse
    this.coldLight.intensity = 0.6 + 0.1 * Math.sin(performance.now() * 0.0012);

    // Spinning fan
    this.fanMesh.rotation.y += delta * 6;

    // Ice crystal sparkle pulse
    const t = performance.now() * 0.002;
    this.iceCrystalMats.forEach((m, i) => {
      m.emissiveIntensity = 0.3 + 0.35 * (0.5 + 0.5 * Math.sin(t + i * 0.7));
    });

    // Strip curtain gentle sway
    this.curtainStrips.forEach((s, i) => {
      s.rotation.y = 0.08 * Math.sin(performance.now() * 0.001 + i * 0.5);
    });
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
    if (this.displayTexture) this.displayTexture.dispose();
    disposeObject(this);
  }
}
