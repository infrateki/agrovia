import * as THREE from 'three';

const VERT = /* glsl */ `
  attribute float aSize;
  attribute float aAlpha;
  attribute float aZoneIntensity;  // 0..1 — per-particle heat at current zone
  attribute float aIsMacro;        // 0 micro/mid, 1 macro "named storm"
  varying float vAlpha;
  varying float vIntensity;
  varying float vIsMacro;
  uniform float uTime;
  uniform float uPixelRatio;

  void main() {
    vAlpha = aAlpha;
    vIntensity = aZoneIntensity;
    vIsMacro = aIsMacro;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // Slow breathing pulse + size grows with intensity:
    // hot zones are ~1.5× the screen size of cool zones.
    float pulse = 0.9 + 0.10 * sin(uTime * 1.4 + position.x * 0.35);
    float intensitySize = mix(0.85, 1.55, aZoneIntensity);
    gl_PointSize = aSize * pulse * intensitySize * uPixelRatio
                 * (150.0 / -mvPosition.z);
  }
`;

const FRAG = /* glsl */ `
  precision highp float;
  varying float vAlpha;
  varying float vIntensity;
  varying float vIsMacro;

  // Infrared / satellite-radar 5-stop ramp, sampled by intensity 0..1.
  // Calibrated from user reference image: deep cobalt → electric blue →
  // yellow-green flash → vibrant orange → saturated red core. No real
  // green band — palette transitions blue→yellow→red like real thermal
  // imaging.
  vec3 infraredRamp(float t) {
    vec3 c0 = vec3(0.094, 0.157, 0.847); // #182AD8 deep cobalt
    vec3 c1 = vec3(0.165, 0.420, 1.000); // #2A6BFF electric blue
    vec3 c2 = vec3(0.871, 0.922, 0.208); // #DEEB35 yellow-green flash
    vec3 c3 = vec3(1.000, 0.431, 0.000); // #FF6E00 vibrant orange
    vec3 c4 = vec3(1.000, 0.102, 0.055); // #FF1A0E saturated red

    if (t < 0.25) return mix(c0, c1, t / 0.25);
    if (t < 0.50) return mix(c1, c2, (t - 0.25) / 0.25);
    if (t < 0.75) return mix(c2, c3, (t - 0.50) / 0.25);
    return mix(c3, c4, clamp((t - 0.75) / 0.25, 0.0, 1.0));
  }

  void main() {
    vec2 uv = gl_PointCoord - vec2(0.5);
    float d = length(uv);
    if (d > 0.5) discard;

    // Soft circular falloff. Macro tier has a tighter, brighter core for
    // hurricane-eye readability.
    float coreSize = mix(0.5, 0.42, vIsMacro);
    float falloff = smoothstep(coreSize, 0.0, d);

    vec3 col = infraredRamp(vIntensity);

    // Brightness: micro/mid stay subtle (0.18 → 0.65 across cool→hot);
    // macro is intentionally lifted (0.45 → 1.55) so over hot zones it
    // crosses the bloom threshold (1.5 linear) and softly blooms — that
    // bloom IS the call-to-action: it only happens where attention is needed.
    float brightnessLow  = mix(0.18, 0.65, vIntensity);
    float brightnessHigh = mix(0.45, 1.55, vIntensity);
    float brightness = mix(brightnessLow, brightnessHigh, vIsMacro);

    gl_FragColor = vec4(col * brightness, falloff * vAlpha);
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
