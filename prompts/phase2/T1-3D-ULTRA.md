Read COMMS.md and CLAUDE.md. You are T1 — 3D Ultra-Detail owner for Phase 2.

ultrathink

Your job is to dramatically upgrade ALL 7 zone classes from basic procedural geometry (~15 meshes each) to richly detailed environments (~40-60 meshes each) with environmental effects, ambient particles, and per-frame animations. Think JET STREAM turbofan simulator level of detail — every zone should make people lean forward.

This is a Peruvian agroexport postharvest pipeline. The zones represent real physical spaces that these professionals walk through every day. Make them RECOGNIZABLE.

### What you're upgrading

You are MODIFYING the existing zone files in `components/three/zones/`. Keep the same class structure (extends THREE.Group, constructor, update, setHighlight, setRiskLevel, dispose, getBoundingBox) but replace the geometry with dramatically richer content.

Also update SceneManager.ts to add global environmental effects.

### Zone-by-zone specifications:

**ZoneCosecha.ts — The Field (40+ meshes)**
Current: flat terrain, 6 cone trees, 3 bins. Upgrade to:
- Rolling terrain with PlaneGeometry(10, 10, 24, 24) and Perlin-like vertex displacement (use sin/cos combinations for natural hills)
- 8-10 trees of 2 types: (a) fruit trees with SphereGeometry canopy + CylinderGeometry trunk + tiny SphereGeometry(0.04) berries scattered on canopy, (b) tall palms with bent CylinderGeometry trunk + flat ConeGeometry fronds
- Berry bushes: low SphereGeometry(0.3) with green material + 15-20 tiny purple/blue sphere berries (0.03 radius) scattered on surface
- 4 harvest bins (wooden BoxGeometry with slat detail — thin boxes stacked) OVERFLOWING with colored spheres (berries)
- Dirt path: a darker brown BoxGeometry(0.3, 0.02, 8) snaking through the terrain
- 2-3 worker figures: simple capsule body (CylinderGeometry) + sphere head + thin cylinder arms holding a basket
- Ambient pollen/firefly particles: 40 tiny yellow sprites floating upward slowly
- Warm sunlight: increase PointLight intensity to 0.5, add a second warm PointLight(0xFFE0A0) low on the ground
- Ground cover: scatter 20-30 tiny flat PlaneGeometry(0.1, 0.1) as fallen leaves, random green/brown

**ZoneSeleccion.ts — The Sorting Line (45+ meshes)**
Current: conveyor belt box, 3 stations, camera poles. Upgrade to:
- Main conveyor belt: BoxGeometry(8, 0.15, 1.8) with dark rubber material. Add roller cylinders underneath (8 CylinderGeometry(0.08, 0.08, 1.8) evenly spaced). Animate the belt UV offset in update() for movement.
- 3 sorting stations with detail: each has a BoxGeometry table (1.2x0.8x0.6), a small screen (PlaneGeometry with emissive blue material), arm mechanism (cylinders), and a reject chute (angled BoxGeometry going to side bin)
- Reject bin: open-top BoxGeometry with red-tinted berries inside
- 4 overhead industrial lights: BoxGeometry(0.6, 0.05, 0.15) with emissive white, mounted on thin CylinderGeometry poles from ceiling frame
- Ceiling frame: wireframe BoxGeometry spanning the zone
- Camera inspection station: CylinderGeometry pole + BoxGeometry camera head + small red LED (emissive SphereGeometry(0.03))
- Scattered berries on floor (10 tiny spheres near the conveyor edges — visual storytelling of the sorting process)
- Safety railing: thin CylinderGeometry tubes forming a U-shape barrier
- Fruit flowing on belt: 12-15 small colored spheres sitting ON the conveyor surface, repositioned in update() to simulate movement

**ZonePacking.ts — The Packing House (50+ meshes)**
Current: 4 tables, stacked boxes, 2 pallets, label machine. Upgrade to:
- 2 packing lines (not just tables): each line has a short conveyor (BoxGeometry + rollers), a scale station (flat BoxGeometry with digital display), and a clamshell closer
- Clamshell containers: open-top BoxGeometry(0.15, 0.08, 0.1) — 30+ scattered along the lines, some open (with berries inside), some closed
- Label printer: BoxGeometry machine with a small extruded label (PlaneGeometry with white material sticking out)
- Palletizer area: 3 pallets with perfectly stacked boxes (4 high, 3x3 grid per layer = 36 boxes per pallet, but use InstancedMesh for performance!)
- Shrink wrap station: transparent CylinderGeometry around one pallet
- Quality check desk: BoxGeometry desk + PlaneGeometry clipboard + SphereGeometry magnifying glass lens
- Workers: 3 figures at stations
- Stacking area with finished pallets wrapped and labeled, ready for frío
- Fluorescent ceiling lights: 3 long TubeGeometry lights

**ZoneFrio.ts — The Cold Chamber (FLAGSHIP, 55+ meshes)**
Current: glass walls, 6 pallets, sensors, frost particles. This is already the best zone. Enhance:
- Add evaporator/condenser unit on ceiling: BoxGeometry(3, 0.4, 1.5) with fan cylinders + pipes (CylinderGeometry tubes running along ceiling)
- Digital temperature readout INSIDE the chamber: PlaneGeometry screen showing "-0.5°C" as a texture or emissive material with CanvasTexture
- Forklift inside: simple model (body BoxGeometry, mast CylinderGeometry, forks as 2 thin BoxGeometry, wheels as CylinderGeometry)
- Ice crystal effect on glass walls: tiny PlaneGeometry sprites (20) on inner wall surfaces, white/blue, slight sparkle via emissive pulse in update()
- MORE pallets: increase to 9 (3x3 grid) with boxes
- Thermometer object near door: thin CylinderGeometry with red fill section
- "ZONA DE FRÍO" text: use a PlaneGeometry with a CanvasTexture rendering the text (or just a flat sign)
- Visible breath/mist effect: 30 more frost particles, some larger (0.15 radius), with slower drift and higher opacity
- Strip curtain at entrance: 5-6 thin PlaneGeometry strips hanging from top, slightly transparent blue, swaying gently in update()
- Emergency button: small red CylinderGeometry on wall

**ZoneEmbarque.ts — Container Loading (50+ meshes)**
Current: container box, crane, forklift, clipboard. Upgrade to:
- Full 40ft container: BoxGeometry(10, 4, 4) but with CORRUGATED walls — create this by adding 20 thin BoxGeometry ribs (0.03 thick, 3.8 tall) along each side wall. Or use a single BoxGeometry and displace vertices for ribbing.
- Container doors: 2 PlaneGeometry doors, one open (rotated 90°), one half-open (rotated 45°), with door handles (small CylinderGeometry)
- Loading ramp: BoxGeometry(3, 0.1, 2) angled up to container floor
- Forklift loading: positioned on the ramp, carrying a pallet INTO the container
- 4 pallets already loaded inside the container (back half)
- 2 pallets waiting on dock (front)
- Reefer unit: BoxGeometry(2, 3, 0.5) on the front of the container with fan grille (CircleGeometry with wireframe)
- Paperwork station: desk with documents, stamp, pen (tiny cylinders)
- Container ID stencil: CanvasTexture on container side with "MSCU-7842190" text
- Dock markings: yellow-painted BoxGeometry strips on the ground (safety lines)
- Overhead crane track: 2 IBeam shapes (BoxGeometry) running parallel above

**ZoneTransito.ts — Ocean Transit (45+ meshes)**
Current: ship hull, ocean plane, route line, data logger. Upgrade to:
- Detailed ship: ExtrudeGeometry hull (wider at bottom, narrower at top) with bow and stern shape. Add: bridge tower (stacked BoxGeometry), deck with container stacks (InstancedMesh for 8-12 containers of varying colors), railing, mast, antenna
- Animated ocean: PlaneGeometry(14, 10, 30, 30) with vertex animation in update() — apply sin waves of multiple frequencies for realistic ocean. Deep blue material with slight transparency.
- Ship wake: 2 white PlaneGeometry triangles trailing behind the ship, semi-transparent, with UV animation
- Cloud particles: 8-10 large semi-transparent SphereGeometry(1-2) floating above at y=8-12, drifting slowly
- GPS marker: small pulsing SphereGeometry(0.15) on the ship with rings (TorusGeometry) expanding outward in update()
- Satellite: tiny box at y=15 with solar panel wings (thin PlaneGeometry)
- Data stream: particles flowing from ship UP to satellite (15 small glowing dots rising)
- Route line upgrade: CatmullRomCurve3 with TubeGeometry(0.03) instead of dashed line, animated opacity gradient showing progress
- Horizon line: subtle gradient PlaneGeometry at far z
- Navigation buoys: 3 small CylinderGeometry with blinking red lights at intervals along route

**ZoneLlegada.ts — Port Arrival & Retail (50+ meshes)**
Current: dock, inspection table, clipboard, retail shelf. Upgrade to:
- Port dock: large BoxGeometry platform with bollard cylinders and mooring lines
- Container crane: large structure — vertical tower (BoxGeometry), horizontal boom (BoxGeometry), trolley, hanging cables (thin CylinderGeometry)
- Customs/inspection booth: small building (BoxGeometry walls + PlaneGeometry roof) with window and desk inside
- Quality inspector figure with clipboard and magnifying glass
- Opened container: same corrugated style as ZoneEmbarque but doors wide open, pallets being unloaded
- Fork lift on dock
- TRANSITION to retail: at the far right of this zone, show a miniature supermarket shelf:
  - Shelf unit: BoxGeometry frame with 3 shelf levels
  - Products: 15-20 small colored BoxGeometry(0.08, 0.1, 0.05) representing clamshells on shelves
  - Price tags: tiny PlaneGeometry
  - Customer figure: simple capsule + sphere
  - Shopping cart: wireframe BoxGeometry on small cylinder wheels
- "LLEGADA" sign: PlaneGeometry with CanvasTexture
- Document/claim icon: floating PlaneGeometry with clipboard texture above inspection area, slight bob animation

### SceneManager.ts Updates

Add to SceneManager:
- Global ambient particles: 100 tiny dust motes (Points) floating slowly throughout the entire scene, very subtle, white, opacity 0.15
- Animated connector lines between zones: instead of static dashed lines, make the dash animation move in update() by updating lineDashOffset
- Add hemisphere light: THREE.HemisphereLight(skyColor: 0x8899AA, groundColor: 0x1A1A2E, intensity: 0.15) for more natural lighting
- Optional: ground plane with subtle grid texture instead of plain color (use CanvasTexture with drawn grid)

### Performance rules

- Use InstancedMesh for repeated identical objects (pallet boxes, container stacks, berries, shelf products). One draw call for dozens of instances.
- Keep individual geometry segments LOW (no SphereGeometry with more than 12 segments, no CylinderGeometry with more than 10 segments)
- Total target: < 50,000 triangles for all 7 zones combined
- CanvasTexture: create once in constructor, don't recreate per frame
- Particle systems: reuse BufferGeometry, update positions via attribute.needsUpdate

### Files you own (ONLY modify these)
- components/three/zones/ZoneCosecha.ts
- components/three/zones/ZoneSeleccion.ts
- components/three/zones/ZonePacking.ts
- components/three/zones/ZoneFrio.ts
- components/three/zones/ZoneEmbarque.ts
- components/three/zones/ZoneTransito.ts
- components/three/zones/ZoneLlegada.ts
- components/three/zones/index.ts (if needed)
- components/three/SceneManager.ts (environmental additions only)

### Files you must NOT touch
- components/three/PipelineCanvas.tsx (working, don't break it)
- components/three/systems/* (camera, particles, selection, labels — all working)
- components/three/shaders/* (working)
- components/layout/* (T4 phase 2)
- components/panels/* (T2 phase 2)
- lib/* (T2 phase 2 may add types)
- app/* (T5 phase 2)

### When done
1. `npx tsc --noEmit` — must pass
2. `npm run build` — must pass
3. Update COMMS.md: mark T1-Phase2 as ✅ DONE
4. Note total mesh count per zone in COMMS.md log
