import { gsap } from 'gsap';
import { ZONE_CONFIGS } from '@/lib/constants';
import { useUiStore } from '@/lib/stores/ui-store';
import type { PipelineZone, Vec3 } from '@/lib/types';
import type { CameraSystem } from './CameraSystem';

interface Waypoint {
  zone: PipelineZone | 'overview';
  cam: Vec3;
  look: Vec3;
  duration: number; // seconds for this leg
}

function zoneCenter(id: PipelineZone): Vec3 {
  const cfg = ZONE_CONFIGS.find((z) => z.id === id)!;
  return {
    x: cfg.position.x,
    y: cfg.position.y + cfg.size.h / 2,
    z: cfg.position.z,
  };
}

function camFor(id: PipelineZone, offset: Vec3): Vec3 {
  const cfg = ZONE_CONFIGS.find((z) => z.id === id)!;
  return {
    x: cfg.position.x + offset.x,
    y: cfg.position.y + cfg.size.h + offset.y,
    z: cfg.position.z + offset.z,
  };
}

// 60s tour: 7 zones + return to overview.
const WAYPOINTS: Waypoint[] = [
  { zone: 'cosecha',   cam: camFor('cosecha',   { x: -4, y: 6,  z: 12 }), look: zoneCenter('cosecha'),   duration: 8 },
  { zone: 'seleccion', cam: camFor('seleccion', { x: -2, y: 5,  z: 11 }), look: zoneCenter('seleccion'), duration: 8 },
  { zone: 'packing',   cam: camFor('packing',   { x: 2,  y: 5,  z: 10 }), look: zoneCenter('packing'),   duration: 8 },
  { zone: 'frio',      cam: camFor('frio',      { x: 0,  y: 4,  z: 13 }), look: zoneCenter('frio'),      duration: 8 },
  { zone: 'embarque',  cam: camFor('embarque',  { x: 3,  y: 6,  z: 12 }), look: zoneCenter('embarque'),  duration: 8 },
  { zone: 'transito',  cam: camFor('transito',  { x: 6,  y: 14, z: 22 }), look: zoneCenter('transito'),  duration: 10 }, // wider, dramatic
  { zone: 'llegada',   cam: camFor('llegada',   { x: 4,  y: 5,  z: 10 }), look: zoneCenter('llegada'),   duration: 8 },
  { zone: 'overview',  cam: { x: 0, y: 35, z: 55 }, look: { x: 0, y: 0, z: 0 },                          duration: 2 },
];

export class CinematicMode {
  private timeline: gsap.core.Timeline | null = null;
  private playing = false;
  private readonly cameraSystem: CameraSystem;

  constructor(cameraSystem: CameraSystem) {
    this.cameraSystem = cameraSystem;
  }

  isPlaying(): boolean {
    return this.playing;
  }

  start(): void {
    if (this.playing) return;
    this.playing = true;

    const ui = useUiStore.getState();
    ui.setCinematicMode(true);

    const cam = this.cameraSystem.camera;
    const controls = this.cameraSystem.controls;

    // Disable user input during cinematic
    controls.enabled = false;

    const state = {
      cx: cam.position.x,
      cy: cam.position.y,
      cz: cam.position.z,
      tx: controls.target.x,
      ty: controls.target.y,
      tz: controls.target.z,
    };

    this.timeline = gsap.timeline({
      onUpdate: () => {
        cam.position.set(state.cx, state.cy, state.cz);
        controls.target.set(state.tx, state.ty, state.tz);
        controls.update();
      },
      onComplete: () => {
        this.finish(false);
      },
    });

    for (const wp of WAYPOINTS) {
      this.timeline.to(state, {
        cx: wp.cam.x,
        cy: wp.cam.y,
        cz: wp.cam.z,
        tx: wp.look.x,
        ty: wp.look.y,
        tz: wp.look.z,
        duration: wp.duration,
        ease: 'power1.inOut',
      });
    }
  }

  stop(): void {
    if (!this.playing) return;
    this.finish(true);
  }

  private finish(killed: boolean): void {
    if (this.timeline) {
      if (killed) this.timeline.kill();
      this.timeline = null;
    }
    this.playing = false;
    useUiStore.getState().setCinematicMode(false);
    // Re-enable controls and snap back to overview state
    this.cameraSystem.resetToOverview();
  }

  dispose(): void {
    if (this.timeline) {
      this.timeline.kill();
      this.timeline = null;
    }
    this.playing = false;
  }
}
