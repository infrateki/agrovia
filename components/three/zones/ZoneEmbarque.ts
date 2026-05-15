import * as THREE from 'three';
import type { ZoneConfig } from '@/lib/types';
import { disposeObject } from '@/lib/three-utils';

/**
 * Container Loading — full 40ft corrugated container with side ribs (vertex displacement),
 * one open + one half-open door with handles, loading ramp, forklift on ramp,
 * pallets inside (back) + on dock (front), reefer unit + fan grille, paperwork desk,
 * "MSCU-7842190" container ID stencil (CanvasTexture), yellow dock safety strips,
 * overhead I-beam crane track.
 * Target: 50+ meshes.
 */
export class ZoneEmbarque extends THREE.Group {
  readonly config: ZoneConfig;
  private highlightables: THREE.MeshStandardMaterial[] = [];
  private baseEmissiveIntensities: number[] = [];
  private reeferLightMat: THREE.MeshStandardMaterial;
  private stencilTexture?: THREE.CanvasTexture;

  constructor(config: ZoneConfig) {
    super();
    this.config = config;
    this.name = `zone:${config.id}`;
    this.userData = { zoneId: config.id };
    this.position.set(config.position.x, config.position.y, config.position.z);

    // ---- Concrete dock pad ----
    const padMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#5A5A5A'),
      roughness: 0.9,
      metalness: 0.05,
    });
    const pad = new THREE.Mesh(new THREE.PlaneGeometry(10, 6), padMat);
    pad.rotation.x = -Math.PI / 2;
    pad.receiveShadow = true;
    this.add(pad);
    this.registerMaterial(padMat);

    // ---- Yellow dock safety strips ----
    const yellowMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#D4A843'),
      emissive: new THREE.Color('#D4A843'),
      emissiveIntensity: 0.18,
      roughness: 0.95,
    });
    const stripGeo = new THREE.BoxGeometry(0.5, 0.005, 0.18);
    for (let i = 0; i < 12; i++) {
      const s = new THREE.Mesh(stripGeo, yellowMat);
      s.position.set(-4.5 + i * 0.85, 0.005, 2.5);
      this.add(s);
    }
    this.registerMaterial(yellowMat);

    // ---- Container body — corrugated walls via vertex displacement ----
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
      color: new THREE.Color('#8B4513'),
      roughness: 0.55,
      metalness: 0.6,
    });
    const container = new THREE.Mesh(containerGeo, containerMat);
    container.position.set(-1, 2, 0);
    container.castShadow = true;
    container.userData = { objectId: `${config.id}:container` };
    this.add(container);
    this.registerMaterial(containerMat);

    // ---- Container ID stencil "MSCU-7842190" via CanvasTexture ----
    if (typeof document !== 'undefined') {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 128;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = 'rgba(0,0,0,0)';
        ctx.clearRect(0, 0, 512, 128);
        ctx.fillStyle = '#E6EDF3';
        ctx.font = 'bold 64px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('MSCU-7842190', 256, 64);
      }
      this.stencilTexture = new THREE.CanvasTexture(canvas);
      this.stencilTexture.needsUpdate = true;
    }
    const stencilMat = new THREE.MeshStandardMaterial({
      map: this.stencilTexture ?? null,
      transparent: true,
      color: new THREE.Color('#FFFFFF'),
    });
    const stencil = new THREE.Mesh(
      new THREE.PlaneGeometry(3.6, 0.7),
      stencilMat,
    );
    stencil.position.set(-1, 2.3, 2.06);
    this.add(stencil);

    // ---- Container doors: one open 90°, one half-open 45° ----
    const doorMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#7A3A20'),
      side: THREE.DoubleSide,
      roughness: 0.55,
      metalness: 0.6,
    });
    const doorHandleMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#8A8A8A'),
      metalness: 0.85,
      roughness: 0.4,
    });
    const doorGeo = new THREE.PlaneGeometry(2, 3.8);
    const handleGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.3, 6);
    // Door A — open 90° (parallel to container side)
    const doorA = new THREE.Mesh(doorGeo, doorMat);
    doorA.position.set(4.0, 2, 2.0);
    doorA.rotation.y = -Math.PI / 2;
    this.add(doorA);
    const handleA = new THREE.Mesh(handleGeo, doorHandleMat);
    handleA.position.set(3.85, 2, 2.0);
    handleA.rotation.x = Math.PI / 2;
    this.add(handleA);
    // Door B — half-open 45°
    const doorB = new THREE.Mesh(doorGeo, doorMat);
    doorB.position.set(4.0, 2, -1.4);
    doorB.rotation.y = Math.PI / 4;
    this.add(doorB);
    const handleB = new THREE.Mesh(handleGeo, doorHandleMat);
    handleB.position.set(3.4, 2, -2.0);
    handleB.rotation.x = Math.PI / 2;
    this.add(handleB);
    this.registerMaterial(doorMat);
    this.registerMaterial(doorHandleMat);

    // ---- Reefer unit on container front ----
    const reeferMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#8A8A8A'),
      metalness: 0.8,
      roughness: 0.4,
    });
    const reefer = new THREE.Mesh(
      new THREE.BoxGeometry(2, 3, 0.5),
      reeferMat,
    );
    reefer.position.set(-6.25, 1.5, 0);
    reefer.userData = { objectId: `${config.id}:reefer` };
    this.add(reefer);
    this.registerMaterial(reeferMat);
    // Fan grille (CircleGeometry as wireframe)
    const grilleMat = new THREE.LineBasicMaterial({
      color: new THREE.Color('#444448'),
    });
    const grilleGeo = new THREE.CircleGeometry(0.55, 12);
    const grille = new THREE.LineSegments(
      new THREE.EdgesGeometry(grilleGeo),
      grilleMat,
    );
    grille.position.set(-6.5, 1.7, 0);
    grille.rotation.y = -Math.PI / 2;
    this.add(grille);
    // Reefer status light
    this.reeferLightMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#22DD66'),
      emissive: new THREE.Color('#22DD66'),
      emissiveIntensity: 1.2,
    });
    const reeferLight = new THREE.Mesh(
      new THREE.SphereGeometry(0.08, 8, 6),
      this.reeferLightMat,
    );
    reeferLight.position.set(-6.5, 2.85, 0);
    this.add(reeferLight);

    // ---- Loading ramp ----
    const rampMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#6B6B6B'),
      metalness: 0.75,
      roughness: 0.45,
    });
    const ramp = new THREE.Mesh(new THREE.BoxGeometry(3, 0.1, 2), rampMat);
    ramp.position.set(5.5, 0.4, 0.3);
    ramp.rotation.z = -Math.PI / 12;
    ramp.castShadow = true;
    this.add(ramp);
    this.registerMaterial(rampMat);

    // ---- Pallets inside container (back half, 4) ----
    const palletMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#6E4C2A'),
      roughness: 0.9,
      metalness: 0.0,
    });
    const innerBoxMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#B8860B'),
      roughness: 0.9,
      metalness: 0.0,
    });
    const palletGeo = new THREE.BoxGeometry(0.9, 0.12, 0.9);
    const innerBoxGeo = new THREE.BoxGeometry(0.78, 0.5, 0.78);
    const insidePos: Array<[number, number]> = [
      [-4.5, -1.0],
      [-4.5, 1.0],
      [-3.0, -1.0],
      [-3.0, 1.0],
    ];
    insidePos.forEach((p, i) => {
      const pl = new THREE.Mesh(palletGeo, palletMat);
      pl.position.set(p[0], 0.08, p[1]);
      pl.castShadow = true;
      pl.userData = { objectId: `${config.id}:inside-pallet-${i}` };
      this.add(pl);
      const box = new THREE.Mesh(innerBoxGeo, innerBoxMat);
      box.position.set(p[0], 0.4, p[1]);
      box.castShadow = true;
      this.add(box);
    });
    // Dock pallets (2)
    [
      [3.5, 2.0],
      [4.5, 2.0],
    ].forEach((p, i) => {
      const pl = new THREE.Mesh(palletGeo, palletMat);
      pl.position.set(p[0], 0.08, p[1]);
      pl.castShadow = true;
      pl.userData = { objectId: `${config.id}:dock-pallet-${i}` };
      this.add(pl);
      const box = new THREE.Mesh(innerBoxGeo, innerBoxMat);
      box.position.set(p[0], 0.4, p[1]);
      box.castShadow = true;
      this.add(box);
    });
    this.registerMaterial(palletMat);
    this.registerMaterial(innerBoxMat);

    // ---- Forklift on the ramp carrying a pallet ----
    const forkBodyMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#FF8800'),
      roughness: 0.5,
      metalness: 0.4,
    });
    const forkBody = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.6, 0.7),
      forkBodyMat,
    );
    forkBody.position.set(5.7, 0.95, -0.5);
    forkBody.rotation.z = -Math.PI / 12;
    forkBody.castShadow = true;
    forkBody.userData = { objectId: `${config.id}:forklift` };
    this.add(forkBody);
    this.registerMaterial(forkBodyMat);
    const wheelMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#1A1A1A'),
      roughness: 0.95,
      metalness: 0.0,
    });
    const wheelGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.13, 10);
    [
      [-0.45, 0.32],
      [0.45, 0.32],
      [-0.45, -0.32],
      [0.45, -0.32],
    ].forEach((p) => {
      const wheel = new THREE.Mesh(wheelGeo, wheelMat);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(5.7 + p[0], 0.7, -0.5 + p[1]);
      this.add(wheel);
    });
    this.registerMaterial(wheelMat);
    // Forks carrying a pallet
    const forkTineMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#8A8A8A'),
      metalness: 0.85,
      roughness: 0.35,
    });
    [-0.18, 0.18].forEach((fz) => {
      const tine = new THREE.Mesh(
        new THREE.BoxGeometry(0.7, 0.05, 0.06),
        forkTineMat,
      );
      tine.position.set(5.0, 0.6, -0.5 + fz);
      tine.rotation.z = -Math.PI / 12;
      this.add(tine);
    });
    this.registerMaterial(forkTineMat);
    const carriedPallet = new THREE.Mesh(palletGeo, palletMat);
    carriedPallet.position.set(4.6, 0.7, -0.5);
    carriedPallet.rotation.z = -Math.PI / 12;
    carriedPallet.castShadow = true;
    this.add(carriedPallet);

    // ---- Paperwork station (desk + papers + stamp + pen) ----
    const deskMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#8B6F47'),
      roughness: 0.9,
      metalness: 0.0,
    });
    const desk = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.7, 0.6), deskMat);
    desk.position.set(2.8, 0.35, -2.5);
    desk.castShadow = true;
    desk.userData = { objectId: `${config.id}:paperwork` };
    this.add(desk);
    this.registerMaterial(deskMat);
    const paperMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#FFFFFF'),
      roughness: 0.95,
    });
    for (let i = 0; i < 3; i++) {
      const paper = new THREE.Mesh(
        new THREE.BoxGeometry(0.35, 0.012, 0.5),
        paperMat,
      );
      paper.position.set(2.7 + i * 0.05, 0.71 + i * 0.012, -2.5);
      paper.rotation.y = (Math.random() - 0.5) * 0.2;
      this.add(paper);
    }
    this.registerMaterial(paperMat);
    const stampMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#5C2222'),
      roughness: 0.6,
    });
    const stamp = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, 0.12, 8),
      stampMat,
    );
    stamp.position.set(3.1, 0.78, -2.6);
    this.add(stamp);
    this.registerMaterial(stampMat);
    const penMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#1A1A20'),
      roughness: 0.5,
      metalness: 0.4,
    });
    const pen = new THREE.Mesh(
      new THREE.CylinderGeometry(0.012, 0.012, 0.18, 6),
      penMat,
    );
    pen.position.set(3.0, 0.72, -2.4);
    pen.rotation.z = Math.PI / 3;
    this.add(pen);
    this.registerMaterial(penMat);

    // ---- Overhead I-beam crane track (2 parallel beams) ----
    const beamMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#D4A843'),
      metalness: 0.7,
      roughness: 0.5,
    });
    [-2.5, 2.5].forEach((bz) => {
      const flangeTop = new THREE.Mesh(
        new THREE.BoxGeometry(10, 0.08, 0.4),
        beamMat,
      );
      flangeTop.position.set(0, 5.4, bz);
      this.add(flangeTop);
      const web = new THREE.Mesh(
        new THREE.BoxGeometry(10, 0.5, 0.06),
        beamMat,
      );
      web.position.set(0, 5.1, bz);
      this.add(web);
      const flangeBot = new THREE.Mesh(
        new THREE.BoxGeometry(10, 0.08, 0.4),
        beamMat,
      );
      flangeBot.position.set(0, 4.85, bz);
      this.add(flangeBot);
    });
    this.registerMaterial(beamMat);

    // ---- Stack of clipboards (kept from original) ----
    const clipMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#E8DCC4'),
      roughness: 0.9,
    });
    const clipGeo = new THREE.BoxGeometry(0.4, 0.04, 0.55);
    for (let i = 0; i < 4; i++) {
      const clip = new THREE.Mesh(clipGeo, clipMat);
      clip.position.set(2.2, 0.74 + i * 0.05, -2.0);
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
    // Reefer status light pulses softly (always-on)
    this.reeferLightMat.emissiveIntensity =
      1.0 + 0.3 * Math.sin(performance.now() * 0.002);
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
    if (this.stencilTexture) this.stencilTexture.dispose();
    disposeObject(this);
  }
}
