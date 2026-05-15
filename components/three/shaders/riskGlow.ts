import * as THREE from 'three';

const VERT = /* glsl */ `
  varying vec3 vNormalW;
  varying vec3 vViewDir;
  void main() {
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vNormalW = normalize(mat3(modelMatrix) * normal);
    vViewDir = normalize(cameraPosition - worldPos.xyz);
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

const FRAG = /* glsl */ `
  precision highp float;
  varying vec3 vNormalW;
  varying vec3 vViewDir;
  uniform float uRiskLevel;
  uniform float uTime;
  uniform vec3 uColor;

  void main() {
    float fresnel = pow(1.0 - clamp(dot(vViewDir, vNormalW), 0.0, 1.0), 3.0);
    float pulse = 0.75 + 0.25 * sin(uTime * 3.0);
    float intensity = fresnel * uRiskLevel * pulse;

    // Color shifts green -> amber -> red based on risk
    vec3 green = vec3(0.10, 0.85, 0.35);
    vec3 amber = vec3(1.00, 0.55, 0.10);
    vec3 red   = vec3(1.00, 0.20, 0.20);
    vec3 base;
    if (uRiskLevel < 0.5) {
      base = mix(green, amber, uRiskLevel / 0.5);
    } else {
      base = mix(amber, red, (uRiskLevel - 0.5) / 0.5);
    }
    vec3 finalCol = mix(base, uColor, 0.25);
    gl_FragColor = vec4(finalCol * intensity, intensity);
  }
`;

export interface RiskGlowUniforms {
  uRiskLevel: { value: number };
  uTime: { value: number };
  uColor: { value: THREE.Color };
}

export function createRiskGlowMaterial(
  color: string = '#FF4444',
  initialRisk = 0,
): THREE.ShaderMaterial {
  const uniforms: RiskGlowUniforms = {
    uRiskLevel: { value: initialRisk },
    uTime: { value: 0 },
    uColor: { value: new THREE.Color(color) },
  };
  return new THREE.ShaderMaterial({
    uniforms: uniforms as unknown as { [u: string]: THREE.IUniform },
    vertexShader: VERT,
    fragmentShader: FRAG,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.FrontSide,
  });
}
