import * as THREE from 'three';

export function createGlassMaterial(): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    transmission: 0.85,
    roughness: 0.1,
    metalness: 0.0,
    thickness: 0.5,
    ior: 1.5,
    color: new THREE.Color(0xccddff),
    transparent: true,
    opacity: 0.35,
    side: THREE.DoubleSide,
  });
}
