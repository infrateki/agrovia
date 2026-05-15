import * as THREE from 'three';

const VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAG = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTemperature;
  uniform float uTime;

  vec3 ramp(float t) {
    // 0.0=deep blue, 0.3=light blue, 0.5=green, 0.7=yellow, 1.0=red
    vec3 c0 = vec3(0.000, 0.267, 1.000); // #0044FF
    vec3 c1 = vec3(0.267, 0.667, 1.000); // #44AAFF
    vec3 c2 = vec3(0.267, 1.000, 0.267); // #44FF44
    vec3 c3 = vec3(1.000, 1.000, 0.000); // #FFFF00
    vec3 c4 = vec3(1.000, 0.000, 0.000); // #FF0000
    if (t < 0.3)      return mix(c0, c1, t / 0.3);
    else if (t < 0.5) return mix(c1, c2, (t - 0.3) / 0.2);
    else if (t < 0.7) return mix(c2, c3, (t - 0.5) / 0.2);
    else              return mix(c3, c4, clamp((t - 0.7) / 0.3, 0.0, 1.0));
  }

  // Simple value-noise ripple
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  void main() {
    float t = clamp(uTemperature, 0.0, 1.0);
    float ripple = sin((vUv.x + vUv.y) * 8.0 + uTime * 1.5) * 0.05;
    float n = hash(floor(vUv * 12.0)) * 0.05;
    vec3 col = ramp(clamp(t + ripple + n, 0.0, 1.0));
    float alpha = 0.55 + 0.25 * sin(uTime * 2.0);
    gl_FragColor = vec4(col, alpha);
  }
`;

export interface TempHeatmapUniforms {
  uTemperature: { value: number };
  uTime: { value: number };
}

export function createTemperatureHeatmapMaterial(
  initialTemp = 0.5,
): THREE.ShaderMaterial {
  const uniforms: TempHeatmapUniforms = {
    uTemperature: { value: initialTemp },
    uTime: { value: 0 },
  };
  return new THREE.ShaderMaterial({
    uniforms: uniforms as unknown as { [u: string]: THREE.IUniform },
    vertexShader: VERT,
    fragmentShader: FRAG,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
}
