Read COMMS.md and CLAUDE.md. You are T3 — 3D Engine owner.

ultrathink

Your job is to build the complete Three.js 3D scene that visualizes the 7-zone postharvest pipeline with animated data flow particles, camera transitions, and interactive selection. This is the visual centerpiece of FRESCO — the thing that makes people say "wow."

Reference design: Think JET STREAM turbofan simulator — a horizontal cross-section model with labeled zones, animated particle flow, interactive tooltips, and readout panels. But instead of an engine, it's the fruit export pipeline.

### Tasks P8 + P9 + P10 + P11 + P12:

**P8: Scene Manager + 7 Zone Groups**

`components/three/PipelineCanvas.tsx` ('use client') — The root React component:
- On mount: creates WebGLRenderer, attaches to div#pipeline-canvas
- Creates Scene, initializes SceneManager, CameraSystem, ParticleFlow, SelectionSystem, LabelSystem
- Runs animation loop via requestAnimationFrame (store the ID for cleanup)
- On every frame: calls sceneManager.update(delta), particleFlow.update(delta), cameraSystem.update()
- On unmount: disposes EVERYTHING (renderer, scene traverse + dispose all geometries/materials/textures, cancel animation frame, remove resize listener)
- Reads layer visibility from useUiStore to show/hide particle layers
- Reads selectedZone from useSelectionStore to trigger camera transitions
- `renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))` for performance
- Resize handler: updates camera aspect + renderer size on window resize
- Export this component — T1's page.tsx will import it with `dynamic(() => import('@/components/three/PipelineCanvas'), { ssr: false })`

`components/three/PipelineCanvas.module.css` — Full-size container, position absolute, top 0, left 0.

`components/three/SceneManager.ts` — Class managing the full scene:
- Creates scene with background color #0A0E14 (THREE.Color)
- Adds FogExp2 (dark, density 0.008) for depth
- Adds ground plane: PlaneGeometry(120, 40), dark material (#0A0E14), rotated -90° on X, at y=-0.5, with subtle grid lines via a custom grid helper or lineSegments
- Instantiates all 7 zone classes and positions them per ZONE_CONFIGS from lib/constants.ts
- Lighting:
  - AmbientLight (0xffffff, 0.25) 
  - DirectionalLight (0xffffff, 0.8) from position (20, 30, 20), castShadow with 2048x2048 shadowMap
  - Per-zone PointLights using each zone's accentColor, positioned above each zone, intensity 0.4, distance 15
- Connector lines between zones: subtle dashed lines (LineDashedMaterial) connecting zone centers
- Methods: update(deltaTime), dispose(), getZoneGroup(zoneId), getAllZones()

**7 Zone classes** — Each extends THREE.Group. Each builds recognizable procedural geometry:

`components/three/zones/ZoneCosecha.ts`:
- Green terrain: PlaneGeometry(8, 8) with slight vertex displacement for hills
- 5-6 trees: ConeGeometry(0.6, 2, 6) green canopy + CylinderGeometry(0.15, 0.15, 1) brown trunk
- 3 harvest bins: BoxGeometry(0.6, 0.4, 0.6) wooden brown
- Small worker figures: simple CylinderGeometry + SphereGeometry combos (optional)
- Warm sunlight PointLight (0xFFE4B5, 0.3)

`components/three/zones/ZoneSeleccion.ts`:
- Conveyor belt: BoxGeometry(7, 0.1, 1.5) with dark rubber material, animated UV offset for movement effect
- 3 sorting stations: BoxGeometry(1, 1, 1) with metallic material
- Camera objects on poles: small CylinderGeometry poles + BoxGeometry camera heads
- Industrial overhead lights: small emissive rectangles above

`components/three/zones/ZonePacking.ts`:
- 4 packing tables: BoxGeometry(1.5, 0.8, 1) with light wood material
- Stacked boxes in rows: BoxGeometry(0.4, 0.3, 0.5) in 3x3 grids, cardboard brown
- 2 pallet bases: BoxGeometry(1.2, 0.15, 1.0) with slat pattern
- Labeling machine: CylinderGeometry + small box

`components/three/zones/ZoneFrio.ts` (THE SHOWCASE ZONE):
- Semi-transparent walls: BoxGeometry(8, 5, 8) with MeshPhysicalMaterial (transmission: 0.85, roughness: 0.1, metalness: 0.0, thickness: 0.5, color: 0xCCDDFF). Use backSide for inner walls visibility.
- 6 pallets stacked inside (2 rows of 3), each with small boxes on top
- Temperature sensors: small red SphereGeometry(0.1) at corners, with emissive red material
- Blue-tinted PointLight inside (0x4488FF, 0.6)
- Frost/cold particle effect: small white particles drifting slowly downward inside the chamber
- Floor: slightly reflective with MeshStandardMaterial (metalness: 0.3, roughness: 0.6, color: 0x334455)

`components/three/zones/ZoneEmbarque.ts`:
- Container: BoxGeometry(10, 4, 4) with corrugated ribbed look (use segments + slight position offsets, or a metallic dark material). Container doors open (one side has two rotated planes as open doors).
- Crane arm: 3 CylinderGeometry segments joined, positioned above
- Small forklift: simple box + cylinder wheels combo
- Stack of document clipboards: thin BoxGeometry near the entrance

`components/three/zones/ZoneTransito.ts`:
- Ship hull: Custom shape — use ExtrudeGeometry with a boat-hull Shape, or a simple tapered BoxGeometry (wider at bottom, narrower at top). Dark blue-gray material.
- Ocean plane: PlaneGeometry(12, 8) with animated MeshStandardMaterial, blue color, slight opacity. Animate vertex positions in update() for gentle wave motion.
- Route line: dashed TubeGeometry or Line3 from embarque to llegada, white dashed
- Data logger device on deck: small glowing box with green emissive

`components/three/zones/ZoneLlegada.ts`:
- Dock platform: BoxGeometry(8, 0.3, 6) concrete gray
- Inspection table: BoxGeometry(2, 0.8, 1) with clipboard objects on top
- Retail shelf: BoxGeometry(2, 1.5, 0.5) with small colored product boxes
- Client profile icon: Billboard/Sprite with a person silhouette or icon

Each zone class has:
- `constructor()` — builds all meshes, adds to this (the Group)
- `update(deltaTime: number)` — per-frame animations (conveyor belt UV, ocean waves, frost particles)
- `setHighlight(active: boolean)` — toggles a subtle emissive glow on all meshes
- `setRiskLevel(level: number)` — 0-1, changes emissive intensity proportionally
- `dispose()` — traverses children, disposes geometries and materials
- `getBoundingBox()` — returns world bounding box for camera framing

`components/three/zones/index.ts` — Named exports of all zone classes.

**P9: Camera System**

`components/three/systems/CameraSystem.ts`:
- PerspectiveCamera (fov: 50, near: 0.1, far: 500)
- OrbitControls (import from 'three/addons/controls/OrbitControls.js')
- 4 camera modes:

1. **Pipeline mode** (default): Position (0, 35, 55), lookAt (0, 0, 0). OrbitControls limited: enableRotate=false, enablePan=true (horizontal only), enableZoom=true, minDistance=30, maxDistance=80.

2. **Zone mode**: GSAP tween (1.2s, power2.inOut) to position facing selected zone at distance ~18, slightly above. OrbitControls enabled with polarAngle limits (0.3 to 1.2), maxDistance 25.

3. **Object mode**: GSAP tween (0.8s) close to object at distance ~6. Full orbit allowed.

4. **Cinematic mode**: Disabled orbit controls. GSAP timeline auto-flies through all zones (T5 implements the full timeline, but provide the interface here).

Methods:
- `setMode(mode: ViewMode)` — switches camera behavior
- `transitionToZone(zoneConfig: ZoneConfig)` — smooth camera move to zone
- `transitionToPosition(pos: {x,y,z}, lookAt: {x,y,z})` — generic smooth move
- `resetToOverview()` — return to pipeline mode
- `update()` — called per frame, updates OrbitControls
- `resize(width: number, height: number)` — update camera aspect
- `dispose()` — cleanup controls

**P10: Particle Data Flow System**

`components/three/systems/ParticleFlow.ts`:
- Creates a THREE.Points system with BufferGeometry
- ~800 particles total, distributed across 5 flow types
- Each particle attribute: position (Float32, 3), color (Float32, 3), size (Float32, 1), alpha (Float32, 1), progress (Float32, 1)
- Particles move along CatmullRomCurve3 paths connecting adjacent zone centers
- Each flow type has different behavior:
  - trazabilidad (green): steady flow left→right, small particles
  - temperatura (red): pulsing, larger particles, faster when there's an excursion
  - documentos (gold): square-ish (use sprite with square texture), moderate speed
  - senales (purple): wave motion (sine offset on Y axis)
  - reclamos (orange): REVERSE flow right→left
- Use ShaderMaterial with custom vertex/fragment for performance:

`components/three/shaders/particleFlow.ts`:
```glsl
// Vertex: read progress attribute, sample position along curve via uniform array of curve points, apply time offset, set gl_PointSize
// Fragment: soft circle with alpha falloff from center, multiply by vColor varying
```

- Visibility per type controlled by LayerVisibility (only flow toggle for Phase 0 — show all types when flow=true)
- Methods: update(deltaTime), setVisible(visible: boolean), dispose()

**P11: Custom Shaders**

`components/three/shaders/temperatureHeatmap.ts`:
- Export a function that creates ShaderMaterial
- Uniform: uTemperature (float, 0-1 normalized), uTime (float)
- Vertex: pass UV to fragment
- Fragment: map uTemperature to color gradient: 0.0=deep blue (#0044FF), 0.3=light blue (#44AAFF), 0.5=green (#44FF44), 0.7=yellow (#FFFF00), 1.0=red (#FF0000). Add subtle animated noise ripple using uTime.
- Transparent, blending: AdditiveBlending

`components/three/shaders/riskGlow.ts`:
- Fresnel-based glow effect
- Uniform: uRiskLevel (float, 0-1), uColor (vec3), uTime (float)
- Vertex: compute view direction and normal for Fresnel
- Fragment: Fresnel intensity = pow(1.0 - dot(viewDir, normal), 3.0) * uRiskLevel. Color shifts from green (0) to amber (0.5) to red (1.0). Pulsing via sin(uTime).
- AdditiveBlending, transparent, depthWrite false

`components/three/shaders/glassShader.ts`:
- Export a function that returns MeshPhysicalMaterial config for cold chamber glass:
```typescript
export const createGlassMaterial = () => new THREE.MeshPhysicalMaterial({
  transmission: 0.85,
  roughness: 0.1,
  metalness: 0.0,
  thickness: 0.5,
  ior: 1.5,
  color: new THREE.Color(0xCCDDFF),
  transparent: true,
  opacity: 0.3,
  side: THREE.DoubleSide,
});
```

**P12: Selection System + Labels**

`components/three/systems/SelectionSystem.ts`:
- Raycaster for mouse/touch
- Listen to mousedown/touchstart on the renderer's canvas
- On click: raycast against all zone groups
  - If hit a zone: dispatch useSelectionStore.setSelectedZone(zoneId)
  - If hit a specific object within a zone: dispatch setSelectedObjectId(objectId)
- On hover (mousemove): dispatch setHoveredObjectId, apply subtle highlight (emissive boost) to hovered mesh
- On double-click: set viewMode to 'object' and transition camera
- Methods: update() (for hover checks), dispose() (remove listeners)

`components/three/systems/LabelSystem.ts`:
- Import CSS2DRenderer, CSS2DObject from 'three/addons/renderers/CSS2DRenderer.js'
- Create CSS2DRenderer that overlays the WebGL canvas exactly (same size, position absolute, pointerEvents none)
- For each zone: create a CSS2DObject with an HTML div containing:
  - Zone label (Spanish name from ZONE_CONFIGS) in bold white
  - Small risk indicator dot (colored by zone's average risk)
- Position each label above the zone (y = zone height + 2)
- Labels hide when camera is in 'object' mode (too close)
- Must resize with window
- Methods: update(), resize(), dispose()

`lib/three-utils.ts` — Helper utilities:
- `disposeObject(obj: THREE.Object3D)` — recursively disposes geometries, materials, textures
- `createStandardMaterial(color: string, opts?)` — shortcut for MeshStandardMaterial
- `hexToThreeColor(hex: string)` — converts hex string to THREE.Color

### Files you own (ONLY modify these)
- components/three/PipelineCanvas.tsx + .module.css
- components/three/SceneManager.ts
- components/three/zones/ZoneCosecha.ts
- components/three/zones/ZoneSeleccion.ts
- components/three/zones/ZonePacking.ts
- components/three/zones/ZoneFrio.ts
- components/three/zones/ZoneEmbarque.ts
- components/three/zones/ZoneTransito.ts
- components/three/zones/ZoneLlegada.ts
- components/three/zones/index.ts
- components/three/systems/CameraSystem.ts
- components/three/systems/ParticleFlow.ts
- components/three/systems/RiskGlow.ts
- components/three/systems/SelectionSystem.ts
- components/three/systems/LabelSystem.ts
- components/three/shaders/temperatureHeatmap.ts
- components/three/shaders/riskGlow.ts
- components/three/shaders/particleFlow.ts
- components/three/shaders/glassShader.ts
- lib/three-utils.ts

### Files you must NOT touch
- app/* (T1) — import only
- components/layout/* (T1) — do not touch
- components/panels/* (T4) — do not touch
- lib/types.ts (T2) — import only
- lib/stores/* (T2) — import only
- lib/constants.ts (T2) — import only
- lib/data/* (T2) — do not touch

### Dependencies
- T1: div#pipeline-canvas must exist in the DOM
- T2: ZONE_CONFIGS, ZONE_POSITIONS, ZONE_COLORS must be importable from lib/constants
- T2: useUiStore, useSelectionStore must be importable from lib/stores/*
- Import Three.js from 'three'
- Import OrbitControls from 'three/addons/controls/OrbitControls.js'
- Import CSS2DRenderer from 'three/addons/renderers/CSS2DRenderer.js'
- Import gsap from 'gsap'

### Constraints
- PipelineCanvas.tsx MUST have 'use client' at the top line
- PipelineCanvas MUST be safe for dynamic import with { ssr: false } — no window/document access at module scope
- MUST dispose ALL geometries, materials, textures, renderers on unmount
- Use `renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))`
- requestAnimationFrame must be cancellable (cancelAnimationFrame on cleanup)
- CSS2DRenderer must overlay WebGLRenderer exactly (same size, pointer-events: none)
- All Three.js imports must work with Next.js — use the 'three/addons/' path, not 'three/examples/jsm/'
- Keep triangle count reasonable: no geometry should exceed 1000 vertices per zone
- Shadows only on main directional light, not on point lights

### When done
1. Run `npx tsc --noEmit` — must pass
2. Run `npm run build` — must pass
3. Update COMMS.md: mark P8, P9, P10, P11, P12 as ✅ DONE
4. Add to COMMS.md T3 log: "PipelineCanvas must be imported with: dynamic(() => import('@/components/three/PipelineCanvas').then(m => ({ default: m.PipelineCanvas })), { ssr: false })"
