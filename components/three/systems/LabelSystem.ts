import * as THREE from 'three';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { ZONE_CONFIGS } from '@/lib/constants';
import type { PipelineZone, ViewMode } from '@/lib/types';

interface ZoneLabel {
  zoneId: PipelineZone;
  obj: CSS2DObject;
  el: HTMLDivElement;
  dot: HTMLSpanElement;
}

export class LabelSystem {
  readonly renderer: CSS2DRenderer;
  private labels: Map<PipelineZone, ZoneLabel> = new Map();
  private parent: HTMLElement;

  constructor(parent: HTMLElement, width: number, height: number) {
    this.parent = parent;
    this.renderer = new CSS2DRenderer();
    this.renderer.setSize(width, height);
    const dom = this.renderer.domElement;
    dom.style.position = 'absolute';
    dom.style.top = '0';
    dom.style.left = '0';
    dom.style.width = '100%';
    dom.style.height = '100%';
    dom.style.pointerEvents = 'none';
    parent.appendChild(dom);

    for (const config of ZONE_CONFIGS) {
      const el = document.createElement('div');
      el.style.display = 'flex';
      el.style.alignItems = 'center';
      el.style.gap = '6px';
      el.style.padding = '4px 10px';
      el.style.background = 'rgba(13,17,23,0.78)';
      el.style.border = '1px solid rgba(255,255,255,0.08)';
      el.style.borderRadius = '999px';
      el.style.color = '#E6EDF3';
      el.style.fontFamily = "'Inter', system-ui, sans-serif";
      el.style.fontWeight = '600';
      el.style.fontSize = '11px';
      el.style.letterSpacing = '0.04em';
      el.style.textTransform = 'uppercase';
      el.style.whiteSpace = 'nowrap';
      el.style.backdropFilter = 'blur(8px)';
      el.style.userSelect = 'none';

      const dot = document.createElement('span');
      dot.style.display = 'inline-block';
      dot.style.width = '8px';
      dot.style.height = '8px';
      dot.style.borderRadius = '50%';
      dot.style.background = config.accentColor;
      dot.style.boxShadow = `0 0 8px ${config.accentColor}`;

      const text = document.createElement('span');
      text.textContent = config.label;

      el.appendChild(dot);
      el.appendChild(text);

      const obj = new CSS2DObject(el);
      obj.position.set(
        config.position.x,
        config.position.y + config.size.h + 2,
        config.position.z,
      );
      obj.userData = { zoneId: config.id };

      this.labels.set(config.id, { zoneId: config.id, obj, el, dot });
    }
  }

  /** Add all label CSS2DObjects to the given scene. Call once after construction. */
  addToScene(scene: THREE.Scene): void {
    for (const lbl of this.labels.values()) {
      scene.add(lbl.obj);
    }
  }

  setViewMode(mode: ViewMode): void {
    const showLabels = mode !== 'object';
    for (const lbl of this.labels.values()) {
      lbl.el.style.opacity = showLabels ? '1' : '0';
    }
  }

  setRisk(zoneId: PipelineZone, level: number): void {
    const lbl = this.labels.get(zoneId);
    if (!lbl) return;
    const clamped = Math.max(0, Math.min(1, level));
    const color = clamped < 0.4 ? '#22DD66' : clamped < 0.7 ? '#FF8800' : '#FF4444';
    lbl.dot.style.background = color;
    lbl.dot.style.boxShadow = `0 0 8px ${color}`;
  }

  render(scene: THREE.Scene, camera: THREE.Camera): void {
    this.renderer.render(scene, camera);
  }

  resize(width: number, height: number): void {
    this.renderer.setSize(width, height);
  }

  dispose(): void {
    for (const lbl of this.labels.values()) {
      if (lbl.obj.parent) lbl.obj.parent.remove(lbl.obj);
      lbl.el.remove();
    }
    this.labels.clear();
    const dom = this.renderer.domElement;
    if (dom.parentElement === this.parent) {
      this.parent.removeChild(dom);
    }
  }
}
