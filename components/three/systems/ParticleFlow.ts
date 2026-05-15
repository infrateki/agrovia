import * as THREE from 'three';
import { ZONE_CONFIGS, PARTICLE_COLORS } from '@/lib/constants';
import type { DataFlowType } from '@/lib/types';
import { createParticleFlowMaterial } from '../shaders/particleFlow';

interface FlowSpec {
  type: DataFlowType;
  color: THREE.Color;
  count: number;
  size: number;
  speed: number; // progress per second
  reverse: boolean;
  yOffset: number;
  wavy: boolean;
}

const FLOW_SPECS: FlowSpec[] = [
  {
    type: 'trazabilidad',
    color: new THREE.Color(PARTICLE_COLORS.trazabilidad),
    count: 200,
    size: 6,
    speed: 0.08,
    reverse: false,
    yOffset: 1.5,
    wavy: false,
  },
  {
    type: 'temperatura',
    color: new THREE.Color(PARTICLE_COLORS.temperatura),
    count: 180,
    size: 10,
    speed: 0.11,
    reverse: false,
    yOffset: 2.5,
    wavy: false,
  },
  {
    type: 'documentos',
    color: new THREE.Color(PARTICLE_COLORS.documentos),
    count: 140,
    size: 8,
    speed: 0.07,
    reverse: false,
    yOffset: 3.5,
    wavy: false,
  },
  {
    type: 'senales',
    color: new THREE.Color(PARTICLE_COLORS.senales),
    count: 160,
    size: 7,
    speed: 0.09,
    reverse: false,
    yOffset: 4.5,
    wavy: true,
  },
  {
    type: 'reclamos',
    color: new THREE.Color(PARTICLE_COLORS.reclamos),
    count: 120,
    size: 8,
    speed: 0.06,
    reverse: true,
    yOffset: 2.0,
    wavy: false,
  },
];

export class ParticleFlow {
  readonly points: THREE.Points;
  private geometry: THREE.BufferGeometry;
  private material: THREE.ShaderMaterial;
  private curve: THREE.CatmullRomCurve3;
  private positions: Float32Array;
  private colors: Float32Array;
  private sizes: Float32Array;
  private alphas: Float32Array;
  private progress: Float32Array;
  private speeds: Float32Array;
  private waveAmps: Float32Array;
  private yOffsets: Float32Array;
  private total: number;
  private visible = true;

  constructor(pixelRatio: number) {
    // Build a smooth curve through all zone centers
    const curvePoints = ZONE_CONFIGS.map(
      (z) => new THREE.Vector3(z.position.x, z.position.y + 2, z.position.z),
    );
    this.curve = new THREE.CatmullRomCurve3(curvePoints, false, 'catmullrom', 0.4);

    this.total = FLOW_SPECS.reduce((acc, s) => acc + s.count, 0);
    this.positions = new Float32Array(this.total * 3);
    this.colors = new Float32Array(this.total * 3);
    this.sizes = new Float32Array(this.total);
    this.alphas = new Float32Array(this.total);
    this.progress = new Float32Array(this.total);
    this.speeds = new Float32Array(this.total);
    this.waveAmps = new Float32Array(this.total);
    this.yOffsets = new Float32Array(this.total);

    let idx = 0;
    for (const spec of FLOW_SPECS) {
      for (let i = 0; i < spec.count; i++) {
        this.progress[idx] = Math.random();
        const sign = spec.reverse ? -1 : 1;
        this.speeds[idx] = sign * (spec.speed * (0.7 + Math.random() * 0.6));
        this.colors[idx * 3 + 0] = spec.color.r;
        this.colors[idx * 3 + 1] = spec.color.g;
        this.colors[idx * 3 + 2] = spec.color.b;
        this.sizes[idx] = spec.size * (0.8 + Math.random() * 0.4);
        this.alphas[idx] = 0.65 + Math.random() * 0.3;
        this.yOffsets[idx] = spec.yOffset + (Math.random() - 0.5) * 0.6;
        this.waveAmps[idx] = spec.wavy ? 0.6 + Math.random() * 0.4 : 0;
        idx++;
      }
    }

    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    this.geometry.setAttribute('aColor', new THREE.BufferAttribute(this.colors, 3));
    this.geometry.setAttribute('aSize', new THREE.BufferAttribute(this.sizes, 1));
    this.geometry.setAttribute('aAlpha', new THREE.BufferAttribute(this.alphas, 1));

    this.material = createParticleFlowMaterial(pixelRatio);

    this.points = new THREE.Points(this.geometry, this.material);
    this.points.frustumCulled = false;
    this.points.name = 'particle-flow';

    // Populate initial positions
    this.recomputePositions(0);
  }

  private recomputePositions(time: number): void {
    const posAttr = this.geometry.attributes.position as THREE.BufferAttribute;
    const arr = posAttr.array as Float32Array;
    const tmp = new THREE.Vector3();
    for (let i = 0; i < this.total; i++) {
      const p = this.progress[i];
      const clamped = ((p % 1) + 1) % 1;
      this.curve.getPointAt(clamped, tmp);
      const yWave = this.waveAmps[i] > 0
        ? Math.sin(time * 2.0 + i * 0.3) * this.waveAmps[i]
        : 0;
      arr[i * 3 + 0] = tmp.x;
      arr[i * 3 + 1] = tmp.y + this.yOffsets[i] + yWave;
      arr[i * 3 + 2] = tmp.z;
    }
    posAttr.needsUpdate = true;
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
