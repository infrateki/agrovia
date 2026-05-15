import * as THREE from 'three';

const VERT = /* glsl */ `
  attribute float aSize;
  attribute float aAlpha;
  attribute vec3 aColor;
  varying vec3 vColor;
  varying float vAlpha;
  uniform float uTime;
  uniform float uPixelRatio;

  void main() {
    vColor = aColor;
    vAlpha = aAlpha;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    float pulse = 0.85 + 0.15 * sin(uTime * 4.0 + position.x * 0.5);
    gl_PointSize = aSize * pulse * uPixelRatio * (250.0 / -mvPosition.z);
  }
`;

const FRAG = /* glsl */ `
  precision highp float;
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vec2 uv = gl_PointCoord - vec2(0.5);
    float d = length(uv);
    if (d > 0.5) discard;
    float a = smoothstep(0.5, 0.05, d) * vAlpha;
    gl_FragColor = vec4(vColor, a);
  }
`;

export interface ParticleFlowUniforms {
  uTime: { value: number };
  uPixelRatio: { value: number };
}

export function createParticleFlowMaterial(pixelRatio: number): THREE.ShaderMaterial {
  const uniforms: ParticleFlowUniforms = {
    uTime: { value: 0 },
    uPixelRatio: { value: pixelRatio },
  };
  return new THREE.ShaderMaterial({
    uniforms: uniforms as unknown as { [u: string]: THREE.IUniform },
    vertexShader: VERT,
    fragmentShader: FRAG,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
}
