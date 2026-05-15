import * as THREE from 'three';
import type { PipelineZone } from '@/lib/types';
import { useSelectionStore } from '@/lib/stores/selection-store';
import { useUiStore } from '@/lib/stores/ui-store';
import type { AnyZone } from '../zones';
import type { CameraSystem } from './CameraSystem';
import { ZONE_CONFIGS } from '@/lib/constants';

interface HoveredState {
  mesh: THREE.Mesh;
  originalEmissive: THREE.Color;
  originalIntensity: number;
}

export class SelectionSystem {
  private raycaster = new THREE.Raycaster();
  private pointer = new THREE.Vector2();
  private domElement: HTMLElement;
  private zones: AnyZone[];
  private cameraSystem: CameraSystem;
  private hovered: HoveredState | null = null;
  private mouseDownPos: { x: number; y: number } | null = null;
  private lastClickTime = 0;

  constructor(
    domElement: HTMLElement,
    zones: AnyZone[],
    cameraSystem: CameraSystem,
  ) {
    this.domElement = domElement;
    this.zones = zones;
    this.cameraSystem = cameraSystem;

    this.onPointerDown = this.onPointerDown.bind(this);
    this.onPointerUp = this.onPointerUp.bind(this);
    this.onPointerMove = this.onPointerMove.bind(this);

    this.domElement.addEventListener('pointerdown', this.onPointerDown);
    this.domElement.addEventListener('pointerup', this.onPointerUp);
    this.domElement.addEventListener('pointermove', this.onPointerMove);
  }

  private updatePointer(ev: PointerEvent): void {
    const rect = this.domElement.getBoundingClientRect();
    this.pointer.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;
  }

  private intersectZones(): THREE.Intersection[] {
    this.raycaster.setFromCamera(this.pointer, this.cameraSystem.camera);
    return this.raycaster.intersectObjects(this.zones, true);
  }

  private resolveZoneId(obj: THREE.Object3D): PipelineZone | null {
    let cur: THREE.Object3D | null = obj;
    while (cur) {
      const zid = (cur.userData as { zoneId?: PipelineZone }).zoneId;
      if (zid) return zid;
      cur = cur.parent;
    }
    return null;
  }

  private resolveObjectId(obj: THREE.Object3D): string | null {
    let cur: THREE.Object3D | null = obj;
    while (cur) {
      const oid = (cur.userData as { objectId?: string }).objectId;
      if (oid) return oid;
      cur = cur.parent;
    }
    return null;
  }

  private onPointerDown(ev: PointerEvent): void {
    this.mouseDownPos = { x: ev.clientX, y: ev.clientY };
  }

  private onPointerUp(ev: PointerEvent): void {
    if (!this.mouseDownPos) return;
    const dx = ev.clientX - this.mouseDownPos.x;
    const dy = ev.clientY - this.mouseDownPos.y;
    this.mouseDownPos = null;
    // Treat as click only if pointer didn't drag much
    if (Math.hypot(dx, dy) > 6) return;

    this.updatePointer(ev);
    const hits = this.intersectZones();
    if (hits.length === 0) return;
    const hit = hits[0];
    const zid = this.resolveZoneId(hit.object);
    const oid = this.resolveObjectId(hit.object);

    const now = performance.now();
    const isDouble = now - this.lastClickTime < 300;
    this.lastClickTime = now;

    if (zid) {
      useSelectionStore.getState().setSelectedZone(zid);
    }
    if (oid) {
      useSelectionStore.getState().setSelectedObjectId(oid);
    }

    if (isDouble && zid) {
      const cfg = ZONE_CONFIGS.find((z) => z.id === zid);
      if (cfg) {
        useUiStore.getState().setViewMode('object');
        this.cameraSystem.transitionToPosition(
          {
            x: cfg.position.x + 3,
            y: cfg.position.y + cfg.size.h + 1,
            z: cfg.position.z + 5,
          },
          {
            x: cfg.position.x,
            y: cfg.position.y + cfg.size.h / 2,
            z: cfg.position.z,
          },
          0.8,
        );
      }
    }
  }

  private onPointerMove(ev: PointerEvent): void {
    this.updatePointer(ev);
    const hits = this.intersectZones();

    // Clear previous hover highlight if it's no longer hovered
    if (this.hovered) {
      const top = hits[0]?.object;
      if (!top || top !== this.hovered.mesh) {
        const m = this.hovered.mesh.material as
          | THREE.MeshStandardMaterial
          | THREE.MeshStandardMaterial[];
        if (!Array.isArray(m) && 'emissive' in m) {
          m.emissive.copy(this.hovered.originalEmissive);
          m.emissiveIntensity = this.hovered.originalIntensity;
        }
        this.hovered = null;
      }
    }

    if (hits.length === 0) {
      useSelectionStore.getState().setHoveredObjectId(null);
      this.domElement.style.cursor = 'default';
      return;
    }

    const hit = hits[0];
    const oid = this.resolveObjectId(hit.object);
    if (oid) {
      useSelectionStore.getState().setHoveredObjectId(oid);
    }
    this.domElement.style.cursor = 'pointer';

    // Apply hover highlight on mesh (StandardMaterial only)
    if (
      hit.object instanceof THREE.Mesh &&
      !Array.isArray(hit.object.material) &&
      hit.object.material instanceof THREE.MeshStandardMaterial &&
      hit.object !== this.hovered?.mesh
    ) {
      const mat = hit.object.material;
      this.hovered = {
        mesh: hit.object,
        originalEmissive: mat.emissive.clone(),
        originalIntensity: mat.emissiveIntensity,
      };
      mat.emissive.set('#FFFFFF');
      mat.emissiveIntensity = Math.max(0.2, mat.emissiveIntensity);
    }
  }

  update(): void {
    // hover handled via events; reserved for future per-frame work
  }

  dispose(): void {
    this.domElement.removeEventListener('pointerdown', this.onPointerDown);
    this.domElement.removeEventListener('pointerup', this.onPointerUp);
    this.domElement.removeEventListener('pointermove', this.onPointerMove);
    if (this.hovered) {
      const mat = this.hovered.mesh.material as THREE.MeshStandardMaterial;
      if ('emissive' in mat) {
        mat.emissive.copy(this.hovered.originalEmissive);
        mat.emissiveIntensity = this.hovered.originalIntensity;
      }
      this.hovered = null;
    }
    this.domElement.style.cursor = 'default';
  }
}
