Read COMMS.md and CLAUDE.md. You are T1 — Quick Material & Environment Polish.

This is a fast polish pass. Do NOT restructure or add new meshes. Only upgrade MATERIALS and ENVIRONMENT for visual realism.

### Task 1: PBR Material Upgrades in ALL zone files

Open each zone file and upgrade MeshStandardMaterial instances with realistic PBR values:

**Metal surfaces** (conveyor frames, crane, container walls, inspection tables, machinery):
- metalness: 0.7–0.9, roughness: 0.3–0.5, color: #8A8A8A or #6B6B6B
- For corrugated container: metalness: 0.6, roughness: 0.55, color: #8B4513 (rusty brown-orange)

**Wood** (pallets, bins, tables, crates):
- metalness: 0.0, roughness: 0.85–0.95, color: #6E4C2A to #8B6F47
- For old/weathered wood: roughness: 1.0, darker color

**Concrete/dock** (floors in Packing, Embarque, Llegada):
- metalness: 0.05, roughness: 0.9, color: #5A5A5A to #707070

**Rubber** (conveyor belt):
- metalness: 0.0, roughness: 0.95, color: #1A1A1A

**Cardboard boxes**:
- metalness: 0.0, roughness: 0.9, color: #B8860B to #C8A77A

**Fruit/berries**:
- metalness: 0.0, roughness: 0.3–0.4 (slightly glossy like real fruit), color: purple #4A0E78 for blueberries, green #2D6B30 for grapes, dark green #2E4A1E for avocado

**Plastic/shrink wrap**:
- metalness: 0.1, roughness: 0.15, transparent: true, opacity: 0.4, color: #FFFFFF

**Glass** (cold chamber — already done but check):
- Verify transmission: 0.85, roughness: 0.1

**Water/ocean** (Tránsito):
- metalness: 0.2, roughness: 0.1, color: #0A2A4A, transparent: true, opacity: 0.85

For each zone, find every `new THREE.MeshStandardMaterial({...})` and update the metalness/roughness/color values. Don't change geometry, positions, or structure.

### Task 2: Environment & Background in SceneManager.ts

Replace the solid black background with a subtle gradient environment:

```typescript
// Replace: this.scene.background = new THREE.Color('#0A0E14');
// With a gradient sky using a large SphereGeometry:

const skyGeo = new THREE.SphereGeometry(200, 32, 32);
const skyMat = new THREE.ShaderMaterial({
  uniforms: {
    topColor: { value: new THREE.Color('#0D1B2A') },    // dark navy top
    bottomColor: { value: new THREE.Color('#1B2838') },  // slightly lighter bottom
    horizonColor: { value: new THREE.Color('#162030') }, // mid horizon
    offset: { value: 10 },
    exponent: { value: 0.4 },
  },
  vertexShader: `
    varying vec3 vWorldPosition;
    void main() {
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPosition.xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform vec3 topColor;
    uniform vec3 bottomColor;
    uniform vec3 horizonColor;
    uniform float offset;
    uniform float exponent;
    varying vec3 vWorldPosition;
    void main() {
      float h = normalize(vWorldPosition + offset).y;
      float t = max(pow(max(h, 0.0), exponent), 0.0);
      vec3 color = mix(horizonColor, topColor, t);
      color = mix(bottomColor, color, smoothstep(-0.1, 0.2, h));
      gl_FragColor = vec4(color, 1.0);
    }
  `,
  side: THREE.BackSide,
  depthWrite: false,
});
const sky = new THREE.Mesh(skyGeo, skyMat);
this.scene.add(sky);
// Keep scene.background as null or remove it
```

Also upgrade the ground plane:
```typescript
// Make ground slightly reflective with a subtle industrial floor look
const groundMat = new THREE.MeshStandardMaterial({
  color: new THREE.Color('#0F1923'),
  roughness: 0.85,
  metalness: 0.15,  // slight reflection
  envMapIntensity: 0.3,
});
```

Upgrade the grid helper opacity to 0.2 (subtler) and color to #1A2530.

Add a subtle rim light from the back to create depth:
```typescript
const rimLight = new THREE.DirectionalLight(0x4488FF, 0.15);
rimLight.position.set(-30, 10, -20);
this.scene.add(rimLight);
```

### Task 3: Fog adjustment

Current fog is FogExp2 with density 0.008. Reduce to 0.005 for more visibility at distance but keep the depth feeling:
```typescript
this.scene.fog = new THREE.FogExp2(0x0D1B2A, 0.005);  // match sky color
```

### Files to modify
- components/three/zones/ZoneCosecha.ts (materials only)
- components/three/zones/ZoneSeleccion.ts (materials only)
- components/three/zones/ZonePacking.ts (materials only)
- components/three/zones/ZoneFrio.ts (materials only)
- components/three/zones/ZoneEmbarque.ts (materials only)
- components/three/zones/ZoneTransito.ts (materials only)
- components/three/zones/ZoneLlegada.ts (materials only)
- components/three/SceneManager.ts (sky, ground, fog, rim light)

### Constraints
- Do NOT add or remove meshes — materials and lighting only
- Do NOT change positions or sizes
- Do NOT touch any files outside the zones and SceneManager
- Keep triangle count the same

### When done
1. `npx tsc --noEmit` — must pass
2. `npm run build` — must pass
3. Update COMMS.md T1 log: "Phase 2 material polish complete — PBR metals, gradient sky, rim lighting"
