import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { gsap } from 'gsap';
import type { ViewMode, ZoneConfig, Vec3 } from '@/lib/types';

export class CameraSystem {
  readonly camera: THREE.PerspectiveCamera;
  readonly controls: OrbitControls;
  private mode: ViewMode = 'pipeline';
  private activeTween: gsap.core.Tween | null = null;

  constructor(width: number, height: number, domElement: HTMLElement) {
    this.camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 500);
    this.camera.position.set(0, 35, 55);
    this.camera.lookAt(0, 0, 0);

    this.controls = new OrbitControls(this.camera, domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.target.set(0, 0, 0);

    this.applyModeConstraints('pipeline');
  }

  setMode(mode: ViewMode): void {
    this.mode = mode;
    this.applyModeConstraints(mode);
  }

  getMode(): ViewMode {
    return this.mode;
  }

  private applyModeConstraints(mode: ViewMode): void {
    switch (mode) {
      case 'pipeline':
        this.controls.enabled = true;
        this.controls.enableRotate = false;
        this.controls.enablePan = true;
        this.controls.enableZoom = true;
        this.controls.minDistance = 30;
        this.controls.maxDistance = 80;
        this.controls.minPolarAngle = Math.PI / 6;
        this.controls.maxPolarAngle = Math.PI / 6;
        break;
      case 'zone':
        this.controls.enabled = true;
        this.controls.enableRotate = true;
        this.controls.enablePan = true;
        this.controls.enableZoom = true;
        this.controls.minDistance = 8;
        this.controls.maxDistance = 25;
        this.controls.minPolarAngle = 0.3;
        this.controls.maxPolarAngle = 1.2;
        break;
      case 'object':
        this.controls.enabled = true;
        this.controls.enableRotate = true;
        this.controls.enablePan = true;
        this.controls.enableZoom = true;
        this.controls.minDistance = 2;
        this.controls.maxDistance = 12;
        this.controls.minPolarAngle = 0.1;
        this.controls.maxPolarAngle = Math.PI - 0.1;
        break;
    }
    this.controls.update();
  }

  transitionToZone(zoneConfig: ZoneConfig): void {
    const lookAt: Vec3 = {
      x: zoneConfig.position.x,
      y: zoneConfig.position.y + zoneConfig.size.h / 2,
      z: zoneConfig.position.z,
    };
    const camPos: Vec3 = {
      x: zoneConfig.position.x + 6,
      y: zoneConfig.position.y + zoneConfig.size.h + 6,
      z: zoneConfig.position.z + 14,
    };
    this.setMode('zone');
    this.tweenCameraAndTarget(camPos, lookAt, 1.2, 'power2.inOut');
  }

  transitionToPosition(pos: Vec3, lookAt: Vec3, duration = 0.8): void {
    this.tweenCameraAndTarget(pos, lookAt, duration, 'power2.inOut');
  }

  resetToOverview(): void {
    this.setMode('pipeline');
    this.tweenCameraAndTarget(
      { x: 0, y: 35, z: 55 },
      { x: 0, y: 0, z: 0 },
      1.2,
      'power2.inOut',
    );
  }

  private tweenCameraAndTarget(
    camTarget: Vec3,
    lookTarget: Vec3,
    duration: number,
    ease: string,
  ): void {
    if (this.activeTween) {
      this.activeTween.kill();
      this.activeTween = null;
    }
    const state = {
      cx: this.camera.position.x,
      cy: this.camera.position.y,
      cz: this.camera.position.z,
      tx: this.controls.target.x,
      ty: this.controls.target.y,
      tz: this.controls.target.z,
    };
    const camera = this.camera;
    const controls = this.controls;
    this.activeTween = gsap.to(state, {
      cx: camTarget.x,
      cy: camTarget.y,
      cz: camTarget.z,
      tx: lookTarget.x,
      ty: lookTarget.y,
      tz: lookTarget.z,
      duration,
      ease,
      onUpdate: () => {
        camera.position.set(state.cx, state.cy, state.cz);
        controls.target.set(state.tx, state.ty, state.tz);
        controls.update();
      },
    });
  }

  update(): void {
    this.controls.update();
  }

  resize(width: number, height: number): void {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  dispose(): void {
    if (this.activeTween) {
      this.activeTween.kill();
      this.activeTween = null;
    }
    this.controls.dispose();
  }
}
