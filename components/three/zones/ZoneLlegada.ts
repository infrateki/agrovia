import * as THREE from 'three';
import type { ZoneConfig } from '@/lib/types';
import { disposeObject } from '@/lib/three-utils';

/**
 * Port Arrival & Retail — port dock with bollards + mooring lines, container crane
 * (tower + boom + trolley + cables), customs/inspection booth, inspector figure,
 * opened container being unloaded, dock forklift, mini supermarket retail (shelf,
 * 18 product clamshells via InstancedMesh, price tags, customer + shopping cart),
 * "LLEGADA" sign (CanvasTexture), floating clipboard icon (bobs).
 * Target: 50+ meshes.
 */
export class ZoneLlegada extends THREE.Group {
  readonly config: ZoneConfig;
  private highlightables: THREE.MeshStandardMaterial[] = [];
  private baseEmissiveIntensities: number[] = [];
  private floatingClipboard: THREE.Mesh;
  private floatingClipboardBaseY: number;
  private signTexture?: THREE.CanvasTexture;
  private clipTexture?: THREE.CanvasTexture;

  constructor(config: ZoneConfig) {
    super();
    this.config = config;
    this.name = `zone:${config.id}`;
    this.userData = { zoneId: config.id };
    this.position.set(config.position.x, config.position.y, config.position.z);

    // ---- Port dock platform ----
    const dockMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#707070'),
      roughness: 0.9,
      metalness: 0.05,
    });
    const dock = new THREE.Mesh(new THREE.BoxGeometry(8, 0.3, 6), dockMat);
    dock.position.y = 0.15;
    dock.receiveShadow = true;
    dock.userData = { objectId: `${config.id}:dock` };
    this.add(dock);
    this.registerMaterial(dockMat);

    // Bollards (4)
    const bollardMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#6B6B6B'),
      metalness: 0.75,
      roughness: 0.5,
    });
    const bollardGeo = new THREE.CylinderGeometry(0.18, 0.22, 0.55, 10);
    const bollardPositions: Array<[number, number]> = [
      [-3.5, 2.6],
      [-1.2, 2.8],
      [1.2, 2.8],
      [3.5, 2.6],
    ];
    bollardPositions.forEach((p) => {
      const b = new THREE.Mesh(bollardGeo, bollardMat);
      b.position.set(p[0], 0.575, p[1]);
      b.castShadow = true;
      this.add(b);
    });
    this.registerMaterial(bollardMat);
    // Mooring lines (3 cylinders going from bollards into water)
    const ropeMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#A89070'),
      roughness: 1.0,
    });
    const ropeGeo = new THREE.CylinderGeometry(0.025, 0.025, 1.6, 5);
    [
      [-3.5, 2.6],
      [-1.2, 2.8],
      [1.2, 2.8],
    ].forEach((p) => {
      const r = new THREE.Mesh(ropeGeo, ropeMat);
      r.position.set(p[0], 0.5, p[1] + 0.7);
      r.rotation.x = -0.5;
      this.add(r);
    });
    this.registerMaterial(ropeMat);

    // ---- Container crane ----
    const craneMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#D4A843'),
      metalness: 0.7,
      roughness: 0.5,
    });
    const tower = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 4.5, 0.3),
      craneMat,
    );
    tower.position.set(-3.0, 2.55, -1.8);
    tower.castShadow = true;
    tower.userData = { objectId: `${config.id}:crane` };
    this.add(tower);
    const tower2 = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 4.5, 0.3),
      craneMat,
    );
    tower2.position.set(-3.0, 2.55, 1.8);
    tower2.castShadow = true;
    this.add(tower2);
    // Horizontal boom across both towers
    const boom = new THREE.Mesh(
      new THREE.BoxGeometry(0.25, 0.25, 4.5),
      craneMat,
    );
    boom.position.set(-3.0, 4.7, 0);
    this.add(boom);
    // Trolley
    const trolley = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.2, 0.6),
      craneMat,
    );
    trolley.position.set(-3.0, 4.45, 0.5);
    this.add(trolley);
    this.registerMaterial(craneMat);
    // Cables (2 thin cylinders) from trolley down to a small spreader
    const cableMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#1A1A1A'),
      roughness: 0.5,
      metalness: 0.7,
    });
    [-0.18, 0.18].forEach((cx) => {
      const cable = new THREE.Mesh(
        new THREE.CylinderGeometry(0.015, 0.015, 1.6, 5),
        cableMat,
      );
      cable.position.set(-3.0 + cx, 3.55, 0.5);
      this.add(cable);
    });
    this.registerMaterial(cableMat);
    // Spreader bar
    const spreader = new THREE.Mesh(
      new THREE.BoxGeometry(0.6, 0.06, 1.4),
      craneMat,
    );
    spreader.position.set(-3.0, 2.7, 0.5);
    this.add(spreader);

    // ---- Customs/inspection booth ----
    const boothMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#3A4A5C'),
      roughness: 0.7,
    });
    const boothGeo = new THREE.BoxGeometry(1.2, 1.4, 1.2);
    const booth = new THREE.Mesh(boothGeo, boothMat);
    booth.position.set(-1.5, 1.0, -2.0);
    booth.castShadow = true;
    booth.userData = { objectId: `${config.id}:booth` };
    this.add(booth);
    this.registerMaterial(boothMat);
    // Window
    const windowMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#0A1A2A'),
      emissive: new THREE.Color('#88AAFF'),
      emissiveIntensity: 0.6,
      metalness: 0.3,
      roughness: 0.2,
    });
    const window = new THREE.Mesh(
      new THREE.PlaneGeometry(0.5, 0.4),
      windowMat,
    );
    window.position.set(-0.89, 1.2, -2.0);
    window.rotation.y = Math.PI / 2;
    this.add(window);
    // Roof
    const roofMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#5C2222'),
      roughness: 0.85,
    });
    const roof = new THREE.Mesh(
      new THREE.PlaneGeometry(1.4, 1.4),
      roofMat,
    );
    roof.position.set(-1.5, 1.71, -2.0);
    roof.rotation.x = -Math.PI / 2;
    this.add(roof);
    this.registerMaterial(roofMat);

    // ---- Inspector figure (with clipboard + magnifying glass) ----
    const skinMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#D4A07A'),
      roughness: 0.9,
    });
    const shirtMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#E6F2FF'),
      roughness: 0.7,
    });
    const inspectorBody = new THREE.Mesh(
      new THREE.CylinderGeometry(0.16, 0.18, 0.55, 8),
      shirtMat,
    );
    inspectorBody.position.set(-0.5, 0.78, -1.0);
    inspectorBody.castShadow = true;
    inspectorBody.userData = { objectId: `${config.id}:inspector` };
    this.add(inspectorBody);
    const inspectorHead = new THREE.Mesh(
      new THREE.SphereGeometry(0.13, 8, 6),
      skinMat,
    );
    inspectorHead.position.set(-0.5, 1.18, -1.0);
    inspectorHead.castShadow = true;
    this.add(inspectorHead);
    // Clipboard in hand
    const clipMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#E8DCC4'),
      roughness: 0.9,
    });
    const clip = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.02, 0.24), clipMat);
    clip.position.set(-0.32, 0.75, -1.0);
    clip.rotation.z = -0.2;
    this.add(clip);
    this.registerMaterial(skinMat);
    this.registerMaterial(shirtMat);
    this.registerMaterial(clipMat);

    // ---- Opened container being unloaded ----
    const containerMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#8B4513'),
      roughness: 0.55,
      metalness: 0.6,
    });
    const containerGeo = new THREE.BoxGeometry(3, 1.6, 1.6, 14, 1, 1);
    const cposAttr = containerGeo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < cposAttr.count; i++) {
      const x = cposAttr.getX(i);
      const z = cposAttr.getZ(i);
      if (Math.abs(z) > 0.75) {
        const rib = Math.sin(x * 5.0) * 0.03;
        cposAttr.setZ(i, z + Math.sign(z) * rib);
      }
    }
    containerGeo.computeVertexNormals();
    const openContainer = new THREE.Mesh(containerGeo, containerMat);
    openContainer.position.set(-3.0, 1.1, 0.5);
    openContainer.castShadow = true;
    openContainer.userData = { objectId: `${config.id}:open-container` };
    this.add(openContainer);
    this.registerMaterial(containerMat);
    // Open doors
    const doorMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#7A3A20'),
      side: THREE.DoubleSide,
      roughness: 0.55,
      metalness: 0.6,
    });
    const doorGeo = new THREE.PlaneGeometry(0.8, 1.5);
    const doorL = new THREE.Mesh(doorGeo, doorMat);
    doorL.position.set(-1.5, 1.1, 0.9);
    doorL.rotation.y = -Math.PI / 2;
    this.add(doorL);
    const doorR = new THREE.Mesh(doorGeo, doorMat);
    doorR.position.set(-1.5, 1.1, 0.1);
    doorR.rotation.y = Math.PI / 2;
    this.add(doorR);
    this.registerMaterial(doorMat);

    // ---- Dock forklift ----
    const forkBodyMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#FF8800'),
      roughness: 0.5,
      metalness: 0.4,
    });
    const forkBody = new THREE.Mesh(
      new THREE.BoxGeometry(0.9, 0.5, 0.6),
      forkBodyMat,
    );
    forkBody.position.set(-0.2, 0.55, 0.5);
    forkBody.castShadow = true;
    forkBody.userData = { objectId: `${config.id}:forklift` };
    this.add(forkBody);
    this.registerMaterial(forkBodyMat);
    const wheelMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#1A1A1A'),
      roughness: 0.95,
      metalness: 0.0,
    });
    const wheelGeo = new THREE.CylinderGeometry(0.13, 0.13, 0.1, 10);
    [
      [-0.32, 0.28],
      [0.32, 0.28],
      [-0.32, -0.28],
      [0.32, -0.28],
    ].forEach((p) => {
      const w = new THREE.Mesh(wheelGeo, wheelMat);
      w.rotation.z = Math.PI / 2;
      w.position.set(-0.2 + p[0], 0.43, 0.5 + p[1]);
      this.add(w);
    });
    this.registerMaterial(wheelMat);

    // ---- Retail: supermarket shelf ----
    const shelfFrameMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#6B6B6B'),
      metalness: 0.75,
      roughness: 0.45,
    });
    // Frame (back panel + 3 shelves)
    const back = new THREE.Mesh(
      new THREE.BoxGeometry(2.0, 1.5, 0.05),
      shelfFrameMat,
    );
    back.position.set(2.8, 1.05, -2.4);
    this.add(back);
    [0.4, 0.85, 1.3].forEach((sy) => {
      const shelf = new THREE.Mesh(
        new THREE.BoxGeometry(2.0, 0.04, 0.45),
        shelfFrameMat,
      );
      shelf.position.set(2.8, sy, -2.18);
      shelf.castShadow = true;
      this.add(shelf);
    });
    this.registerMaterial(shelfFrameMat);

    // Products on shelves (InstancedMesh, 18 clamshells)
    const productMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#4A0E78'),
      roughness: 0.35,
      metalness: 0.0,
    });
    const productGeo = new THREE.BoxGeometry(0.18, 0.16, 0.12);
    const products = new THREE.InstancedMesh(productGeo, productMat, 18);
    const pd = new THREE.Object3D();
    let pi = 0;
    [0.5, 0.95, 1.4].forEach((sy) => {
      for (let c = 0; c < 6; c++) {
        pd.position.set(2.0 + c * 0.32, sy, -2.18);
        pd.updateMatrix();
        products.setMatrixAt(pi++, pd.matrix);
      }
    });
    products.instanceMatrix.needsUpdate = true;
    products.userData = { objectId: `${config.id}:retail-products` };
    this.add(products);
    this.registerMaterial(productMat);

    // Price tags (3 small white planes)
    const priceMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#FFFFFF'),
      side: THREE.DoubleSide,
      roughness: 0.9,
    });
    [0.5, 0.95, 1.4].forEach((sy) => {
      const tag = new THREE.Mesh(
        new THREE.PlaneGeometry(0.12, 0.06),
        priceMat,
      );
      tag.position.set(3.7, sy + 0.06, -2.05);
      this.add(tag);
    });
    this.registerMaterial(priceMat);

    // ---- Customer figure ----
    const customerShirtMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#FF4444'),
      roughness: 0.75,
    });
    const customer = new THREE.Mesh(
      new THREE.CylinderGeometry(0.16, 0.18, 0.55, 8),
      customerShirtMat,
    );
    customer.position.set(2.5, 0.78, -1.2);
    customer.castShadow = true;
    customer.userData = { objectId: `${config.id}:customer` };
    this.add(customer);
    const customerHead = new THREE.Mesh(
      new THREE.SphereGeometry(0.13, 8, 6),
      skinMat,
    );
    customerHead.position.set(2.5, 1.18, -1.2);
    this.add(customerHead);
    this.registerMaterial(customerShirtMat);

    // ---- Shopping cart (wireframe-ish) ----
    const cartMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#8A8A8A'),
      metalness: 0.85,
      roughness: 0.4,
    });
    const cartFrameGeo = new THREE.BoxGeometry(0.5, 0.35, 0.4);
    const cartEdges = new THREE.EdgesGeometry(cartFrameGeo);
    const cartFrame = new THREE.LineSegments(
      cartEdges,
      new THREE.LineBasicMaterial({ color: new THREE.Color('#A0A4B0') }),
    );
    cartFrame.position.set(2.9, 0.55, -1.2);
    this.add(cartFrame);
    // Cart wheels
    const cartWheelGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.04, 8);
    [
      [-0.18, 0.14],
      [0.18, 0.14],
      [-0.18, -0.14],
      [0.18, -0.14],
    ].forEach((p) => {
      const w = new THREE.Mesh(cartWheelGeo, cartMat);
      w.rotation.x = Math.PI / 2;
      w.position.set(2.9 + p[0], 0.35, -1.2 + p[1]);
      this.add(w);
    });
    this.registerMaterial(cartMat);

    // ---- "LLEGADA" sign ----
    if (typeof document !== 'undefined') {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 128;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#1A5C3A';
        ctx.fillRect(0, 0, 512, 128);
        ctx.strokeStyle = '#2D8B5E';
        ctx.lineWidth = 6;
        ctx.strokeRect(8, 8, 496, 112);
        ctx.fillStyle = '#F0F4EC';
        ctx.font = 'bold 64px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('LLEGADA · DESTINO', 256, 64);
      }
      this.signTexture = new THREE.CanvasTexture(canvas);
    }
    const signMat = new THREE.MeshStandardMaterial({
      map: this.signTexture ?? null,
      emissive: new THREE.Color('#2D8B5E'),
      emissiveIntensity: 0.25,
      emissiveMap: this.signTexture ?? null,
      transparent: true,
    });
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.6), signMat);
    sign.position.set(0, 2.8, 2.95);
    sign.userData = { objectId: `${config.id}:sign` };
    this.add(sign);

    // ---- Floating clipboard / claim icon (bobs in update) ----
    if (typeof document !== 'undefined') {
      const canvas = document.createElement('canvas');
      canvas.width = 128;
      canvas.height = 160;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#E8DCC4';
        ctx.fillRect(8, 8, 112, 144);
        ctx.fillStyle = '#3A3A40';
        ctx.fillRect(48, 0, 32, 18);
        ctx.strokeStyle = '#5D4E37';
        ctx.lineWidth = 2;
        for (let i = 0; i < 6; i++) {
          ctx.beginPath();
          ctx.moveTo(20, 30 + i * 20);
          ctx.lineTo(108, 30 + i * 20);
          ctx.stroke();
        }
        ctx.fillStyle = '#D4A843';
        ctx.font = 'bold 16px sans-serif';
        ctx.fillText('RECLAMO', 28, 145);
      }
      this.clipTexture = new THREE.CanvasTexture(canvas);
    }
    const floatClipMat = new THREE.MeshStandardMaterial({
      map: this.clipTexture ?? null,
      transparent: true,
      side: THREE.DoubleSide,
      emissive: new THREE.Color('#D4A843'),
      emissiveIntensity: 0.3,
      emissiveMap: this.clipTexture ?? null,
    });
    this.floatingClipboardBaseY = 2.4;
    this.floatingClipboard = new THREE.Mesh(
      new THREE.PlaneGeometry(0.55, 0.7),
      floatClipMat,
    );
    this.floatingClipboard.position.set(-1.5, this.floatingClipboardBaseY, -1.0);
    this.floatingClipboard.userData = {
      objectId: `${config.id}:claim-icon`,
    };
    this.add(this.floatingClipboard);
  }

  private registerMaterial(m: THREE.MeshStandardMaterial): void {
    this.highlightables.push(m);
    this.baseEmissiveIntensities.push(m.emissiveIntensity ?? 0);
  }

  update(_delta: number): void {
    const t = performance.now() * 0.0015;
    this.floatingClipboard.position.y = this.floatingClipboardBaseY + Math.sin(t) * 0.15;
    this.floatingClipboard.rotation.y = Math.sin(t * 0.7) * 0.25;
  }

  setHighlight(active: boolean): void {
    this.highlightables.forEach((m, i) => {
      m.emissive.set(active ? '#2D8B5E' : '#000000');
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
    if (this.signTexture) this.signTexture.dispose();
    if (this.clipTexture) this.clipTexture.dispose();
    disposeObject(this);
  }
}
