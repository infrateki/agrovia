import * as THREE from 'three';
import { ZONE_CONFIGS } from '@/lib/constants';
import type { PipelineZone } from '@/lib/types';
import { createRiskGlowMaterial } from '../shaders/riskGlow';

interface ZoneGlow {
  zoneId: PipelineZone;
  mesh: THREE.Mesh;
  material: THREE.ShaderMaterial;
}

/**
 * Adds a per-zone fresnel "risk glow" envelope. Each zone gets a slightly
 * inflated invisible-when-zero shell whose intensity is driven by the
 * pipeline-store's per-zone risk value (set externally via setRisk).
 */
export class RiskGlow extends THREE.Group {
  private glows: Map<PipelineZone, ZoneGlow> = new Map();

  constructor() {
    super();
    this.name = 'risk-glow-group';

    for (const config of ZONE_CONFIGS) {
      const geo = new THREE.BoxGeometry(
        config.size.w * 1.05,
        config.size.h * 1.1,
        config.size.d * 1.05,
      );
      const mat = createRiskGlowMaterial(config.accentColor, 0);
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(
        config.position.x,
        config.position.y + config.size.h / 2,
        config.position.z,
      );
      mesh.renderOrder = 2;
      this.add(mesh);
      this.glows.set(config.id, { zoneId: config.id, mesh, material: mat });
    }
  }

  setRisk(zoneId: PipelineZone, level: number): void {
    const glow = this.glows.get(zoneId);
    if (!glow) return;
    (glow.material.uniforms.uRiskLevel.value as number) = Math.max(0, Math.min(1, level));
  }

  setAllRisks(perZone: Partial<Record<PipelineZone, number>>): void {
    for (const [zid, level] of Object.entries(perZone) as Array<[PipelineZone, number]>) {
      this.setRisk(zid, level);
    }
  }

  update(delta: number): void {
    const t = performance.now() * 0.001;
    for (const glow of this.glows.values()) {
      (glow.material.uniforms.uTime.value as number) = t;
    }
    void delta;
  }

  setVisible(v: boolean): void {
    this.visible = v;
  }

  dispose(): void {
    for (const glow of this.glows.values()) {
      glow.mesh.geometry.dispose();
      glow.material.dispose();
      this.remove(glow.mesh);
    }
    this.glows.clear();
  }
}
