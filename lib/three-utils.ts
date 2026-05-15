import * as THREE from 'three';

export function disposeObject(obj: THREE.Object3D): void {
  obj.traverse((child) => {
    const mesh = child as Partial<THREE.Mesh> & THREE.Object3D;
    const geom = (mesh as { geometry?: THREE.BufferGeometry }).geometry;
    if (geom && typeof geom.dispose === 'function') {
      geom.dispose();
    }
    const mat = (mesh as { material?: THREE.Material | THREE.Material[] }).material;
    if (mat) {
      if (Array.isArray(mat)) {
        for (const m of mat) disposeMaterial(m);
      } else {
        disposeMaterial(mat);
      }
    }
  });
}

function disposeMaterial(mat: THREE.Material): void {
  const m = mat as THREE.Material & Record<string, unknown>;
  for (const key of Object.keys(m)) {
    const val = m[key];
    if (val && typeof val === 'object' && val instanceof THREE.Texture) {
      val.dispose();
    }
  }
  mat.dispose();
}

export interface StandardMaterialOpts {
  metalness?: number;
  roughness?: number;
  emissive?: string;
  emissiveIntensity?: number;
  transparent?: boolean;
  opacity?: number;
  side?: THREE.Side;
}

export function createStandardMaterial(
  color: string,
  opts: StandardMaterialOpts = {},
): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: hexToThreeColor(color),
    metalness: opts.metalness ?? 0.1,
    roughness: opts.roughness ?? 0.7,
    emissive: opts.emissive ? hexToThreeColor(opts.emissive) : new THREE.Color(0x000000),
    emissiveIntensity: opts.emissiveIntensity ?? 0,
    transparent: opts.transparent ?? false,
    opacity: opts.opacity ?? 1,
    side: opts.side ?? THREE.FrontSide,
  });
}

export function hexToThreeColor(hex: string): THREE.Color {
  return new THREE.Color(hex);
}
