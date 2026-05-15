import * as THREE from 'three';
import type { ZoneConfig } from '@/lib/types';
import { disposeObject } from '@/lib/three-utils';

export class ZoneLlegada extends THREE.Group {
  readonly config: ZoneConfig;
  private highlightables: THREE.MeshStandardMaterial[] = [];
  private baseEmissiveIntensities: number[] = [];

  constructor(config: ZoneConfig) {
    super();
    this.config = config;
    this.name = `zone:${config.id}`;
    this.userData = { zoneId: config.id };
    this.position.set(config.position.x, config.position.y, config.position.z);

    // Dock platform
    const dockGeo = new THREE.BoxGeometry(8, 0.3, 6);
    const dockMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#7A7E83'),
      roughness: 0.85,
    });
    const dock = new THREE.Mesh(dockGeo, dockMat);
    dock.position.y = 0.15;
    dock.receiveShadow = true;
    dock.userData = { objectId: `${config.id}:dock` };
    this.add(dock);
    this.registerMaterial(dockMat);

    // Inspection table
    const tableGeo = new THREE.BoxGeometry(2, 0.8, 1);
    const tableMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#8B7B5A'),
      roughness: 0.75,
    });
    const table = new THREE.Mesh(tableGeo, tableMat);
    table.position.set(-2.2, 0.7, -1.5);
    table.castShadow = true;
    table.userData = { objectId: `${config.id}:inspection-table` };
    this.add(table);
    this.registerMaterial(tableMat);

    // Clipboard on table
    const clipGeo = new THREE.BoxGeometry(0.4, 0.04, 0.55);
    const clipMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#E8DCC4'),
      emissive: new THREE.Color('#D4A843'),
      emissiveIntensity: 0.15,
      roughness: 0.9,
    });
    const clip = new THREE.Mesh(clipGeo, clipMat);
    clip.position.set(-2.2, 1.12, -1.5);
    this.add(clip);
    this.registerMaterial(clipMat);

    // Retail shelf with colored product boxes
    const shelfGeo = new THREE.BoxGeometry(2, 1.5, 0.5);
    const shelfMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#4A4448'),
      metalness: 0.4,
      roughness: 0.5,
    });
    const shelf = new THREE.Mesh(shelfGeo, shelfMat);
    shelf.position.set(2.2, 1.05, -1.8);
    shelf.castShadow = true;
    shelf.userData = { objectId: `${config.id}:retail-shelf` };
    this.add(shelf);
    this.registerMaterial(shelfMat);

    // Small product boxes
    const productColors = ['#FF4444', '#D4A843', '#1A5C3A', '#4488FF', '#6B5CE7'];
    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 3; col++) {
        const pGeo = new THREE.BoxGeometry(0.45, 0.45, 0.3);
        const pMat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(productColors[(row * 3 + col) % productColors.length]),
          roughness: 0.6,
        });
        const product = new THREE.Mesh(pGeo, pMat);
        product.position.set(1.5 + col * 0.5, 0.6 + row * 0.5, -1.7);
        product.castShadow = true;
        this.add(product);
        this.registerMaterial(pMat);
      }
    }

    // Client profile sprite — billboard
    const canvas = typeof document !== 'undefined' ? document.createElement('canvas') : null;
    let clientMat: THREE.SpriteMaterial;
    if (canvas) {
      canvas.width = 128;
      canvas.height = 128;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = 'rgba(26,92,58,0.95)';
        ctx.beginPath();
        ctx.arc(64, 64, 60, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#E6EDF3';
        ctx.beginPath();
        ctx.arc(64, 50, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(64, 95, 30, 20, 0, Math.PI, Math.PI * 2);
        ctx.fill();
      }
      const tex = new THREE.CanvasTexture(canvas);
      tex.needsUpdate = true;
      clientMat = new THREE.SpriteMaterial({ map: tex, transparent: true });
    } else {
      clientMat = new THREE.SpriteMaterial({ color: new THREE.Color('#1A5C3A') });
    }
    const clientSprite = new THREE.Sprite(clientMat);
    clientSprite.scale.set(1.3, 1.3, 1);
    clientSprite.position.set(0, 2.5, 1.8);
    clientSprite.userData = { objectId: `${config.id}:client-icon` };
    this.add(clientSprite);
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
    disposeObject(this);
  }
}
