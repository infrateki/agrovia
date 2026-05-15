import * as THREE from 'three';
import { ZONE_CONFIGS, ZONE_ORDER } from '@/lib/constants';
import { mockLotes } from '@/lib/data';
import type { PipelineZone } from '@/lib/types';
import { createParticleFlowMaterial } from '../shaders/particleFlow';

/**
 * Satellite-radar / infrared heatmap particle flow.
 *
 * Three hierarchical tiers of particles travel along a CatmullRomCurve3
 * through all 7 zone centers. Each particle carries an `aZoneIntensity`
 * attribute (0..1) baked from the heat of the zone it's currently above
 * (computed once at init from mockLotes — count + max riskScore per zone).
 * The fragment shader maps that intensity to an infrared color ramp
 * (deep cobalt → cyan → yellow → orange → red), and brightness + size
 * scale with intensity so hot zones literally glow + grow.
 *
 * Tiers:
 *   - Micro (~480, size 2-3) — background haze, ambient activity.
 *   - Mid   (~180, size 4-6) — notable flow, "weather front".
 *   - Macro (~12, size 10-14) — one marker per high-risk lote (riskScore
 *     ≥ 70). The "named storms"; intentionally bright enough to bloom
 *     softly only where they pass over hot zones.
 */

interface TierSpec {
  tier: 'micro' | 'mid' | 'macro';
  count: number;
  baseSize: number;
  sizeJitter: number;
  baseSpeed: number;
  speedJitter: number;
  yOffset: number;
  yJitter: number;
  alphaBase: number;
  alphaJitter: number;
  isMacro: 0 | 1;
}

const TIERS: TierSpec[] = [
  {
    tier: 'micro',
    count: 480,
    baseSize: 2.2,
    sizeJitter: 0.8,
    baseSpeed: 0.030,
    speedJitter: 0.020,
    yOffset: 1.6,
    yJitter: 1.0,
    alphaBase: 0.45,
    alphaJitter: 0.20,
    isMacro: 0,
  },
  {
    tier: 'mid',
    count: 180,
    baseSize: 4.5,
    sizeJitter: 1.5,
    baseSpeed: 0.025,
    speedJitter: 0.015,
    yOffset: 2.8,
    yJitter: 0.8,
    alphaBase: 0.55,
    alphaJitter: 0.20,
    isMacro: 0,
  },
  {
    tier: 'macro',
    count: 12, // overridden below by # of high-risk lotes
    baseSize: 11,
    sizeJitter: 3.0,
    baseSpeed: 0.018,
    speedJitter: 0.008,
    yOffset: 3.4,
    yJitter: 0.4,
    alphaBase: 0.85,
    alphaJitter: 0.10,
    isMacro: 1,
  },
];

// Derive per-zone heat from mockLotes:
//   intensity = 0.5 * normalizedCount + 0.5 * (maxRiskScore / 100)
// where normalizedCount = min(count / 4, 1).
function computeZoneIntensity(): Record<PipelineZone, number> {
  const counts = new Map<PipelineZone, number>();
  const maxRisk = new Map<PipelineZone, number>();
  for (const lote of mockLotes) {
    counts.set(lote.zone, (counts.get(lote.zone) ?? 0) + 1);
    maxRisk.set(lote.zone, Math.max(maxRisk.get(lote.zone) ?? 0, lote.riskScore));
  }
  const out = {} as Record<PipelineZone, number>;
  for (const z of ZONE_ORDER) {
    const c = counts.get(z) ?? 0;
    const r = maxRisk.get(z) ?? 0;
    out[z] = 0.5 * Math.min(c / 4, 1) + 0.5 * (r / 100);
  }
  return out;
}

// Curve parameter t (0..1) → zone index along ZONE_ORDER.
// 7 zones evenly spread: t in [k/7, (k+1)/7) → zone k.
function zoneAtT(t: number): PipelineZone {
  const clamped = Math.max(0, Math.min(0.9999, t));
  const idx = Math.min(ZONE_ORDER.length - 1, Math.floor(clamped * ZONE_ORDER.length));
  return ZONE_ORDER[idx];
}

export class ParticleFlow {
  readonly points: THREE.Points;
  private geometry: THREE.BufferGeometry;
  private material: THREE.ShaderMaterial;
  private curve: THREE.CatmullRomCurve3;
  private positions: Float32Array;
  private sizes: Float32Array;
  private alphas: Float32Array;
  private zoneIntensities: Float32Array;
  private isMacroFlags: Float32Array;
  private progress: Float32Array;
  private speeds: Float32Array;
  private yOffsets: Float32Array;
  private lastZoneIdx: Int8Array;
  private zoneHeat: Record<PipelineZone, number>;
  private total: number;
  private visible = true;

  constructor(pixelRatio: number) {
    // Curve through all 7 zone centers, lifted slightly so flow is overhead.
    const curvePoints = ZONE_CONFIGS.map(
      (z) => new THREE.Vector3(z.position.x, z.position.y + 2, z.position.z),
    );
    this.curve = new THREE.CatmullRomCurve3(curvePoints, false, 'catmullrom', 0.4);

    this.zoneHeat = computeZoneIntensity();

    // Identify high-risk lotes (riskScore ≥ 70) — these become macro markers.
    // One macro particle per qualifying lote; capped at 16.
    const highRiskLotes = mockLotes
      .filter((l) => l.riskScore >= 70)
      .slice(0, 16);
    const macroSpec = TIERS.find((t) => t.tier === 'macro')!;
    macroSpec.count = Math.max(highRiskLotes.length, 8);

    this.total = TIERS.reduce((acc, t) => acc + t.count, 0);
    this.positions = new Float32Array(this.total * 3);
    this.sizes = new Float32Array(this.total);
    this.alphas = new Float32Array(this.total);
    this.zoneIntensities = new Float32Array(this.total);
    this.isMacroFlags = new Float32Array(this.total);
    this.progress = new Float32Array(this.total);
    this.speeds = new Float32Array(this.total);
    this.yOffsets = new Float32Array(this.total);
    this.lastZoneIdx = new Int8Array(this.total).fill(-1);

    let idx = 0;
    for (const tier of TIERS) {
      for (let i = 0; i < tier.count; i++) {
        // Macro markers seed near the zone of their corresponding high-risk
        // lote so the eye lands on real "named storms"; micro/mid are random.
        let initialT: number;
        if (tier.isMacro && i < highRiskLotes.length) {
          const lote = highRiskLotes[i];
          const zoneIdx = ZONE_ORDER.indexOf(lote.zone);
          initialT = (zoneIdx + 0.5) / ZONE_ORDER.length;
        } else {
          initialT = Math.random();
        }
        this.progress[idx] = initialT;
        this.speeds[idx] =
          tier.baseSpeed + (Math.random() - 0.5) * 2 * tier.speedJitter;
        this.sizes[idx] = tier.baseSize + Math.random() * tier.sizeJitter;
        this.alphas[idx] = tier.alphaBase + Math.random() * tier.alphaJitter;
        this.yOffsets[idx] = tier.yOffset + (Math.random() - 0.5) * tier.yJitter;
        this.isMacroFlags[idx] = tier.isMacro;
        // Initial zone-intensity bake.
        const zone = zoneAtT(initialT);
        this.zoneIntensities[idx] = this.zoneHeat[zone];
        this.lastZoneIdx[idx] = ZONE_ORDER.indexOf(zone);
        idx++;
      }
    }

    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    this.geometry.setAttribute('aSize', new THREE.BufferAttribute(this.sizes, 1));
    this.geometry.setAttribute('aAlpha', new THREE.BufferAttribute(this.alphas, 1));
    this.geometry.setAttribute(
      'aZoneIntensity',
      new THREE.BufferAttribute(this.zoneIntensities, 1),
    );
    this.geometry.setAttribute(
      'aIsMacro',
      new THREE.BufferAttribute(this.isMacroFlags, 1),
    );

    this.material = createParticleFlowMaterial(pixelRatio);

    this.points = new THREE.Points(this.geometry, this.material);
    this.points.frustumCulled = false;
    this.points.name = 'particle-flow';

    this.recomputePositions(0);
  }

  private recomputePositions(time: number): void {
    const posAttr = this.geometry.attributes.position as THREE.BufferAttribute;
    const intAttr = this.geometry.attributes.aZoneIntensity as THREE.BufferAttribute;
    const arr = posAttr.array as Float32Array;
    const intArr = intAttr.array as Float32Array;
    const tmp = new THREE.Vector3();
    let intensityChanged = false;

    for (let i = 0; i < this.total; i++) {
      const p = this.progress[i];
      const clamped = ((p % 1) + 1) % 1;
      this.curve.getPointAt(clamped, tmp);

      // Gentle Y bob synced to particle index (no per-tier wave system needed).
      const yBob = Math.sin(time * 0.6 + i * 0.31) * 0.18;
      arr[i * 3 + 0] = tmp.x;
      arr[i * 3 + 1] = tmp.y + this.yOffsets[i] + yBob;
      arr[i * 3 + 2] = tmp.z;

      // Re-bake zone intensity only when crossing a zone boundary.
      const newZoneIdx = Math.min(
        ZONE_ORDER.length - 1,
        Math.floor(clamped * ZONE_ORDER.length),
      );
      if (newZoneIdx !== this.lastZoneIdx[i]) {
        this.lastZoneIdx[i] = newZoneIdx;
        intArr[i] = this.zoneHeat[ZONE_ORDER[newZoneIdx]];
        intensityChanged = true;
      }
    }
    posAttr.needsUpdate = true;
    if (intensityChanged) intAttr.needsUpdate = true;
  }

  update(delta: number): void {
    if (!this.visible) return;
    for (let i = 0; i < this.total; i++) {
      this.progress[i] += this.speeds[i] * delta;
    }
    const time = performance.now() * 0.001;
    (this.material.uniforms.uTime.value as number) = time;
    this.recomputePositions(time);
  }

  setVisible(visible: boolean): void {
    this.visible = visible;
    this.points.visible = visible;
  }

  setPixelRatio(pr: number): void {
    (this.material.uniforms.uPixelRatio.value as number) = pr;
  }

  dispose(): void {
    this.geometry.dispose();
    this.material.dispose();
  }
}
