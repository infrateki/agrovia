# COMMS.md — Terminal Orchestration Board
## FRESCO 3D Pipeline Intelligence

**Last updated:** 2026-05-15 · by T3 (Phase 6.5 — Graph Edge Polish + Element Modal)
**Status:** 🟢 DEPLOYED v6.5 (agrovia.infratek.ai) · Bezier+fanned edges, horizontal HTML labels, animated dashflow, centered <dialog> modal for nodes & edges
**Repo:** https://github.com/infrateki/agrovia.git
**Deploy:** agrovia.infratek.ai (Vercel)

---

## HOW TO USE THIS FILE

Each Claude Code terminal MUST:
1. **READ this file** at the start of every task
2. **UPDATE your section** when you start/finish work
3. **CHECK blockers** before modifying shared files
4. **NEVER modify another terminal's owned files** without updating this file first
5. **When done with a task**, change its status to ✅ and add a timestamp

---

## PROJECT STATUS

| Component | Terminal | Status | Last Update | Notes |
|---|---|---|---|---|
| Foundation & Layout | T1 | ✅ DONE | 2026-05-14 17:25 | App shell, design system, sidebar, bottom bar |
| 3D Ultra-Detail (Phase 2) | T1 | ✅ DONE | 2026-05-15 | All 7 zones upgraded to 40-60 mesh richness; SceneManager hemisphere+dust |
| Live Claude Operator (Phase 2) | T3 | ✅ DONE | 2026-05-15 | /api/chat SSE → text streaming, system prompt grounded in mock data, demo fallback, brief + defense generators, quick-asks |
| Data Layer & Stores | T2 | ✅ DONE | 2026-05-14 18:05 | Types, mock data, Zustand stores, constants — tsc + build green |
| Decision Intelligence Layer (Phase 2) | T2 | ✅ DONE | 2026-05-15 | FichaOperativa + TrazabilidadTimeline + TemperaturaCurve + DataSourceBadge + CausaAccionCard + ImpactoEconomico; RightPanel/KpiCards/DashboardView upgraded; mock-fichas + mock-decisiones; tsc + build green |
| 3D Pipeline Engine | T3 | ✅ DONE | 2026-05-14 | 7 zones, camera (4 modes + GSAP), particles, shaders, raycaster selection, CSS2D labels |
| Features UI | T4 | ✅ DONE | 2026-05-14 | Dashboard, chat, signals, claims, right panel, config toggles, graph placeholder |
| Cinematic Story Mode (Phase 2) | T4 | ✅ DONE | 2026-05-15 | 5-scene 90s guided demo, Presentation Mode, teleprompter, FAB, URL params |
| Deploy & Polish | T5 | ✅ DONE | 2026-05-14 | Vercel deployed, mobile responsive, cinematic mode, integration green |
| Integration & Import (Phase 2) | T5 | ✅ DONE | 2026-05-15 | CinematicProvider wired, CSV import (/import), PDF/HTML export route, AgroVIA naming, DataSourceBanner, v2 deployed → agrovia.infratek.ai |
| Widget Library & Dashboard Routing (Phase 3) | T1 | ✅ DONE | 2026-05-15 | 9-widget library (CircularGauge/StatCard/DataTable/TrendSparkline/AlertBanner/MiniGauge/VarietySelector/SectionHeader/DashboardShell), Phase-3 types, page.tsx dashboard overlay routing for comando/calidad/frio activeViews — tsc + build green |
| Graph Edge Polish + Element Modal (Phase 6.5) | T3 | ✅ DEPLOYED v6.5 | 2026-05-15 | GRAFO-tab quality pass against eight specific regressions from the Phase 5.1 screenshot. **Edges**: switched from straight lines to bezier curves (base curvature 0.25), added deterministic parallel-edge fan-out so duplicates between the same (source,target) pair spread evenly across [-0.45,+0.45] (the three CONTAINS from a Shipment now fan instead of stack), HTML labels via `EdgeLabelRenderer` with translate-only transform (never rotated — labels always horizontal regardless of edge angle), lighter pill (`var(--color-bg-main)` background + 14 px canvas-color halo so the chip dissolves into the grain), default stroke bumped to 1.5 px `rgba(245,240,232,0.50)` and highlighted to 2.5 px warm gold, ArrowClosed marker enlarged to 22 × 22 (was 14 × 14), highlighted edges animate `strokeDasharray 8 4` via an `edgeFlow` keyframe for the "data is flowing" cue, labels are clickable (and Enter/Space-activatable) and open the modal. **Modal** (new `components/graph/GraphElementModal.{tsx,module.css}`): native `<dialog>` using `showModal()` for built-in focus trap + ESC, frosted glass surface, 580 px × 80vh max, scrollable body, backdrop `dialog::backdrop` with `blur(8px)` + rgba dim, 220 ms ease-out open animation. Two content modes — node mode renders Propiedades / Relaciones (with → ← direction arrows, target label + kind chip, click-to-navigate) / Documentos adjuntos (when applicable) / Fuente; edge mode renders Propiedades placeholder + two clickable Origen/Destino summary cards + Fuente. Closes on X / backdrop / ESC. Navigation by clicking a relation row or node summary swaps `graphModalTarget` in the store without dismounting. **Store**: added `graphModalTarget` union + `openGraphModal` / `closeGraphModal`. The Phase-5 bridge from Shipment-node click to the global `ShipmentDetailPanel` is removed for GRAFO; modal supersedes it. `NodeDetailPanel` and `ShipmentDetailPanel` both remain in the codebase for any other-tab future use. Light + dark themes both render edges and modal cleanly via Phase 4 tokens. Production: `agrovia-3488teoid-infratekis-projects.vercel.app` → `agrovia.infratek.ai`. Commit `b1db70a`. (Note: a parallel `vercel --prod` upload of the local working tree failed because untracked WIP SchemaView files were swept in; the git-triggered build from main was clean and is the one currently aliased.) |
| Ontology Knowledge Graph (Phase 5) | T3 | ✅ DEPLOYED v5.1 | 2026-05-15 | New `grafo` tab: @xyflow/react Neo4j-Browser-style canvas of the Agrovia ontology (12 node kinds, 14 edge kinds), three layers (Ontología / Instancia / Híbrido) via toolbar segmented control + 12 chip filters + substring search + Re-layout. ~35 instance nodes around S-8842 (Walmart blueberries with +5.8°C excursion). EntityNode = filled accent circles 80–120 px with label INSIDE (no icon), accent at 65% opacity over canvas so grain bleeds through, gold outer ring + 24 px glow on selection. RelationshipEdge = straight line with UPPERCASE glass-pill label, rotated to follow steep edges. d3-force simulation (forceLink 180 / forceManyBody -800 / forceCenter / forceCollide r+24, 300 sync ticks) for Instancia + Híbrido; dagre LR retained for the abstract Ontología schema. Shipment-node click bridges to existing ShipmentDetailPanel; all other kinds open NodeDetailPanel (kv list + variant-specific footer). Frosted re-skin of every React Flow chrome surface (Background / MiniMap / Controls / attribution) so the library default look never leaks through. tsc clean, build green, deployed: https://agrovia.infratek.ai (commit 379a07b). |
| Phase 5.1 Recovery — SIM + Graph visuals | T3 | ✅ DEPLOYED v5.1 | 2026-05-15 | Two regressions from initial Phase 5 fixed in a single follow-up commit (before the v5 first-deploy ever shipped): (A) the 3D plant scene was overwritten in `GraphIntelligenceView.tsx` when re-purposing the Grafo tab — recovered from `git show HEAD:components/dashboards/GraphIntelligenceView.tsx` as the new `components/dashboards/OperationsSimView.tsx`, wrapped with `BottomBar` mounted inside the view (Mode/Sim/Readout/Config), wired to a new `'sim'` NavViewId between Social and Grafo with tooltip "Simulación de planta · Cosecha → Llegada". DetailMount now suppresses `ShipmentDetailPanel` on BOTH `sim` and `grafo`. (B) Graph was rendering as a vertical dagre stack — replaced layout with d3-force for instance/hybrid, swapped EntityNode to chunky filled circles with labels inside, made RelationshipEdge actually visible (1.5 px stroke + rotated UPPERCASE pill labels), saturated the 12 accent colors +~15%, set fitView padding 0.15 / minZoom 0.4 / maxZoom 1.5 / defaultZoom 0.85. Single commit `379a07b`, deployed `https://agrovia.infratek.ai` (alias) + `https://agrovia-1qxrf32ql-infratekis-projects.vercel.app` (build). |
| Theme — Dark/Light Toggle (Phase 5) | T3 | ✅ DEPLOYED v5.1 | 2026-05-15 | Pill toggle in TopNavBar (between Bell and Avatar), `aria-checked` switch with sliding knob (right=dark, left=light, matches user mock). FOUC-prevention `<script>` in `<head>` reads `localStorage['agrovia.theme']` and applies `data-theme` to `<html>` before paint. Full hand-tuned light palette: warm cream canvas (#f5f0e8), deeper gold accent (#a8843e), ink-on-paper text (#2a2418), paper-frosted glass tokens. `globals.css` adds `:root[data-theme='light']` overrides for every Phase-1 and Phase-4 token so all dashboards, charts (Recharts axes/grid re-colored via CSS vars), and React Flow chrome stay legible in both modes. ui-store gains `theme`, `setTheme`, `toggleTheme`, plus a `hydrateThemeFromDom()` sync helper. |
| Quality Control Dashboard (Phase 3) | T3 | ✅ DONE | 2026-05-15 | Full QualityDashboard: VarietySelector filters everything · 4 dynamic CircularGauges per variety (Palta→Materia Seca, Cítricos→Acidez) · 6 StatCards · Calibre BarChart + Defectos PieChart · Brix & Firmeza/Acidez 7-day LineCharts with ReferenceArea optimal bands · 12-row searchable Inspecciones DataTable with variety-color chips + MiniGauge cells · Benchmarks reference table (5 varieties, SENASA/APHIS specs). mock-quality.ts (gauge configs + stats + 12 QC inspecciones + 5 benchmarks + 7d trends + calibre/defect distributions). tsc clean, npm run build ✅ green. |
| Cold Chain Dashboard (Phase 3) | T4 | ✅ DONE | 2026-05-15 | Full ColdChainDashboard: critical AlertBanner (S-8842), 4 CircularGauges, 6 StatCards, hero 24h Recharts LineChart (6 chambers, green band [−1,+1], red threshold +4°C, CF-04 palta drift visible in last 4h, CF-06 pre-cool exponential curve), Cámaras DataTable (click → 3D zone frio), Embarques tránsito DataTable (click → zone transito), Excursion history DataTable. mock-coldchain.ts (48-pt temp curve generator + 6 cámaras + 8 embarques + 5 excursions). tsc clean for own files (only pre-existing T3 QualityDashboard error remains), npm run build ✅ green. |
| Navigation Redesign & Deploy v4 (Phase 4) | T5 | ✅ DONE | 2026-05-15 | Frosted-glass TopNavBar replaces Sidebar (moved to components/_deprecated/), GrainOverlay, ShipmentDetailPanel (store-controlled, floating card, X wired), GraphIntelligenceView (full-bleed 3D, no overlay), EmptyView for cuentas/social, all 9 views routed via activeView, NavViewId 'senales'→'radar' migration, ui-store extended with detailPanelOpen/selectedShipmentId/openDetail/closeDetail, cinematic StoryMode wired to openDetail('S-8842')/closeDetail. NOTE: Spec assumed Tailwind+shadcn; project per CLAUDE.md is vanilla CSS Modules / no component libs / no new deps — design intent (frosted glass, warm gold #d4b88a, hairline borders, pills) translated to CSS Module equivalents with new tokens in globals.css. tsc + build green; v4 deployed to agrovia.infratek.ai |
| Integration & Deploy v3 (Phase 3) | T5 | ✅ DONE | 2026-05-15 | tsc + build green; v3 deployed to agrovia.infratek.ai with PackingDashboard / QualityDashboard / ColdChainDashboard overlays wired through activeView routing |
| Packing Operations Dashboard (Phase 3) | T2 | ✅ DONE | 2026-05-15 | Full PackingDashboard: warning AlertBanner (Línea 2 detenida — cambio uva→arándano, 25 min ETA), 4 CircularGauges (Cajas/h 487 vs 500, Rendimiento 87.3% vs 90, Velocidad 12.5 m/min vs 14, Descarte 8.2% vs 5), 6 StatCards (Cajas Hoy 3,847 +12% w/sparkline, Kg Procesados 12,450, Kg Empacados 10,840, Líneas Activas 3 de 4, Turno Día 06:00-18:00, Eficiencia Turno 91.5% w/sparkline), Recharts BarChart 8h producción con ReferenceLine meta=500 + Cells coloreados por % meta + footer "ayer 3,200 cajas +20.2%", DataTable líneas (4 filas, custom mini-gauges cajas/h y rendimiento, marca lateral roja para detenida, badges variedad/turno/estado), DataTable lotes (8 filas, click loteId o row → useSelectionStore.setSelectedObjectId, mini-gauges rendimiento + descarte invertido, lista de defectos). NEW: components/dashboards/PackingDashboard.{tsx,module.css}, lib/data/mock-packing.ts (MOCK_PACKING_LINES + MOCK_PACKING_LOTES + MOCK_HOURLY_PRODUCTION + HourlyProduction). lib/data/index.ts: añadidos 3 exports + 1 type export. tsc clean, npm run build ✅ green. NOTA técnica: CircularGauge.colorZones interpreta cutoffs en orden ascendente (chequea green[1] primero); invertZones=true hace que greenStop=red y redStop=green. Para "alto=bueno" (Cajas/h, Rendimiento, Velocidad) usamos invertZones=true con bandas { green:[0,low], amber:[low,mid], red:[mid,100] }. Descarte sin invertZones porque la lógica default ya da verde a valores bajos. |

---

## TASK BOARD

| # | Task | Owner | Status | File(s) |
|---|---|---|---|---|
| P1 | Project init (create-next-app, install ALL deps) | T1 | ✅ DONE | package.json, tsconfig.json |
| P2 | Design system (CSS variables, glassmorphism, typography) | T1 | ✅ DONE | globals.css |
| P3 | App shell layout (sidebar + canvas + bottom bar + right panel) | T1 | ✅ DONE | layout.tsx, AppShell, Sidebar, BottomBar |
| P4 | TypeScript interfaces for all domain entities | T2 | ✅ DONE 2026-05-14 18:05 | lib/types.ts |
| P5 | Mock data for all entities (lotes, embarques, clientes, etc.) | T2 | ✅ DONE 2026-05-14 18:05 | lib/data/* |
| P6 | Zustand stores (pipeline, ui, selection) | T2 | ✅ DONE 2026-05-14 18:05 | lib/stores/* |
| P7 | Constants and design tokens in TS | T2 | ✅ DONE 2026-05-14 18:05 | lib/constants.ts |
| P8 | Three.js scene manager + 7 zone groups | T3 | ✅ DONE 2026-05-14 | components/three/* |
| P9 | Camera system (4 modes + GSAP transitions) | T3 | ✅ DONE 2026-05-14 | systems/CameraSystem.ts |
| P10 | Particle data flow system | T3 | ✅ DONE 2026-05-14 | systems/ParticleFlow.ts |
| P11 | Custom shaders (temperature, risk glow) | T3 | ✅ DONE 2026-05-14 | shaders/* |
| P12 | Object selection with Raycaster + labels | T3 | ✅ DONE 2026-05-14 | systems/SelectionSystem.ts, LabelSystem.ts |
| P13 | Executive dashboard KPI cards + charts | T4 | ✅ DONE 2026-05-14 | components/panels/KpiCards, DashboardView |
| P14 | Operator chat UI (mock conversation) | T4 | ✅ DONE 2026-05-14 | components/panels/OperatorChat |
| P15 | Signal radar queue list | T4 | ✅ DONE 2026-05-14 | components/panels/SignalQueue |
| P16 | Claims defense folder UI | T4 | ✅ DONE 2026-05-14 | components/panels/ClaimsDefense |
| P17 | Right panel (contextual detail on 3D selection) | T4 | ✅ DONE 2026-05-14 | components/panels/RightPanel |
| P18 | CONFIG toggles (layers: flow, temp, risk, docs, signals) | T4 | ✅ DONE 2026-05-14 | components/panels/ConfigToggles + GraphView |
| P19 | Vercel config + agrovia.infratek.ai domain | T5 | ✅ DONE 2026-05-14 | vercel.json, .vercelignore, .env.example, app/api/health, layout OG meta |
| P20 | Mobile responsive (< 768px: static overview, no 3D) | T5 | ✅ DONE 2026-05-14 | responsive @media in all layout/panel CSS modules + MobileHero |
| P21 | Cinematic mode (auto-fly 60s pipeline tour) | T5 | ✅ DONE 2026-05-14 | CinematicMode.ts (GSAP timeline) wired through cinematicMode store flag |
| P22 | Performance optimization (LOD, dispose, lazy load) | T5 | ✅ DONE 2026-05-14 | renderer.info dev logging; canvas already lazy via dynamic ssr:false |
| P23 | Integration test (full build, all imports resolve) | T5 | ✅ DONE 2026-05-14 | npx tsc clean, npm run build green, vercel deploy succeeded |

---

## FILE OWNERSHIP

Terminals MUST respect file ownership. To modify a file owned by another terminal, update COMMS.md first.

```
T1 owns:
  - app/layout.tsx
  - app/page.tsx
  - app/globals.css
  - components/layout/AppShell.tsx
  - components/layout/AppShell.module.css
  - components/layout/Sidebar.tsx
  - components/layout/Sidebar.module.css
  - components/layout/BottomBar.tsx
  - components/layout/BottomBar.module.css
  - components/layout/TopBar.tsx
  - components/layout/TopBar.module.css
  - lib/utils.ts
  - package.json (primary owner)
  - tsconfig.json (primary owner)
  - next.config.ts
  - .npmrc
  - .gitignore

T2 owns:
  - lib/types.ts
  - lib/constants.ts
  - lib/data/mock-lotes.ts
  - lib/data/mock-embarques.ts
  - lib/data/mock-clientes.ts
  - lib/data/mock-reclamos.ts
  - lib/data/mock-temperaturas.ts
  - lib/data/mock-senales.ts
  - lib/data/mock-kpis.ts
  - lib/data/mock-chat.ts
  - lib/data/mock-defense.ts
  - lib/data/index.ts
  - lib/stores/pipeline-store.ts
  - lib/stores/ui-store.ts
  - lib/stores/selection-store.ts

T3 owns:
  - components/three/PipelineCanvas.tsx
  - components/three/PipelineCanvas.module.css
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

T4 owns:
  - components/panels/DashboardView.tsx
  - components/panels/DashboardView.module.css
  - components/panels/KpiCards.tsx
  - components/panels/KpiCards.module.css
  - components/panels/SignalQueue.tsx
  - components/panels/SignalQueue.module.css
  - components/panels/OperatorChat.tsx
  - components/panels/OperatorChat.module.css
  - components/panels/ClaimsDefense.tsx
  - components/panels/ClaimsDefense.module.css
  - components/panels/RightPanel.tsx
  - components/panels/RightPanel.module.css
  - components/panels/ConfigToggles.tsx
  - components/panels/ConfigToggles.module.css
  - components/panels/GraphView.tsx
  - components/panels/GraphView.module.css
  - components/ui/Badge.tsx
  - components/ui/Badge.module.css
  - components/ui/Card.tsx
  - components/ui/Card.module.css

T5 owns:
  - vercel.json
  - .vercelignore
  - .env.example
  - components/three/systems/CinematicMode.ts
  - public/favicon.ico
  - public/og-image.png
  - app/api/health/route.ts

SHARED (coordinate writes via COMMS.md):
  - package.json (T1 primary)
  - tsconfig.json (T1 primary)
  - COMMS.md (all terminals)
  - CLAUDE.md (orchestrator only)
```

---

## TERMINAL LOG

### T1 — Foundation
```
2026-05-14 17:14 — P1 START: ran create-next-app (Next 16.2.6, App Router, TS, ESLint, no Tailwind, no src dir, alias @/*). Temporarily moved CLAUDE.md/COMMS.md/prompts out so init wouldn't conflict; restored after.
2026-05-14 17:15 — P1: created .npmrc with legacy-peer-deps=true.
2026-05-14 17:16 — P1: installed three @types/three gsap zustand recharts lucide-react. next.config.ts updated with transpilePackages: ['three'].
2026-05-14 17:18 — P2 DONE: app/globals.css now defines all CSS custom properties (colors, radii, glass blur, sidebar/bottom bar/topbar dimensions), Inter @import, full reset, scrollbar styling, .glass-panel utility, pulse keyframe.
2026-05-14 17:22 — P3 DONE: AppShell (CSS Grid: sidebar/topbar/main/bottom + slide-in right panel), Sidebar (9 nav items in Spanish with Lucide icons, active border, collapse toggle, Datos mock footer), TopBar (eyebrow + title, search input with placeholder, MVP gold badge, Bell w/ red dot), BottomBar (TIMELINE slider, MODE pills, SIM controls, READOUT KPIs, CONFIG layer toggles). All as CSS Modules. app/layout.tsx swapped Geist→Inter w/ correct metadata. app/page.tsx renders AppShell + animated FRESCO loading placeholder. lib/utils.ts has cn / formatCurrency / formatNumber / formatDate / formatTemperature.
2026-05-14 17:24 — Verified: npx tsc --noEmit clean, npm run build passes (Next 16.2.6 Turbopack), dev server returned HTML containing FRESCO, Cockpit, Inicializando, pipeline-canvas, Centro de Comando, Operador Diario, Cadena de Frío, Timeline, Pregúntale a FRESCO.
2026-05-14 17:25 — div#pipeline-canvas ready for T3. All CSS custom properties defined. All deps installed.
2026-05-14 17:25 — P1, P2, P3 ✅ DONE.

— — — — — PHASE 2: 3D ULTRA-DETAIL — — — — —

2026-05-15 — Phase 2 START: re-claimed components/three/zones/* + SceneManager.ts (cross-T1/T3 ownership transfer for this batch, see "FILES MODIFIED OUTSIDE OWNERSHIP" below). Goal: 40-60 mesh detail per zone with environmental effects, ambient particles, and per-frame animations.
2026-05-15 — All 7 zones rewritten + SceneManager extended. tsc --noEmit clean. npm run build green (Next 16.2.6 Turbopack, /, /_not-found, /api/health). npm run lint reports 0 errors / 3 pre-existing-style _delta warnings (Embarque/Llegada/Packing — convention prefix, intentionally unchanged).

MESH COUNT PER ZONE (THREE.Object3D additions; InstancedMesh = 1 draw, but visual instances expand to many):

  ZoneCosecha — ~61 meshes (1 terrain + 3 path segs + 4 fruit trees [trunk+canopy+18-berry InstancedMesh×3 = 12] + 4 palms [trunk+4 fronds×4 = 20] + 3 bushes×2 [bush+InstancedMesh = 6] + 4 bins + 1 overflow InstancedMesh + 3 workers×4 parts = 12 + 1 leaf InstancedMesh + 1 pollen Points). Visual instances ≈280 (72 tree berries + 48 bush berries + 40 overflow + 28 leaves + 40 pollen + base meshes).
  ZoneSeleccion — ~51 meshes (floor, belt, 8-roller InstancedMesh, 2 rails, 3 stations×5 parts = 15, reject bin + InstancedMesh of 24 berries, frame edges, 4 lights×2, camera pole+head+LED, U-rail×3, 10-floor-berry InstancedMesh, 14-fruit-on-belt InstancedMesh — animated). Visual instances ≈110.
  ZonePacking — ~62 meshes (floor, 2 lines×[conv+5 rollers+scale+display+closer = 9] = 18, 16-open + 16-closed clamshell InstancedMesh + 64-inside-berry InstancedMesh, label printer body+label, 3 pallets+stacks [pallet + 36-box InstancedMesh] = 6, shrink-wrap, QC desk+clip+lens+handle, 3 workers×2 parts = 6, 3 fluorescent tubes). Visual instances ≈210 (96 master boxes + 32 clamshells + 64 inside berries + base meshes).
  ZoneFrio — ~67 meshes FLAGSHIP (floor, glass walls + edges, 9 pallets×[pallet + 4-box InstancedMesh] = 18, 4 corner sensors, evaporator + 2 fan rings + 1 spinning blade + 2 ceiling pipes, digital readout w/ CanvasTexture, forklift body+mast+2 forks+4 wheels = 8, 20 ice crystals on glass [pulsing], thermometer body+mercury, "ZONA DE FRÍO" sign w/ CanvasTexture, 5 strip-curtain panels [swaying], emergency button base+button, frost Points 80 + mist Points 30). Visual instances ≈230 (36 box instances + 80 frost + 30 mist + base).
  ZoneEmbarque — ~63 meshes (concrete dock, 12 yellow safety strips, corrugated container [vertex-displaced], "MSCU-7842190" stencil w/ CanvasTexture, 2 doors + 2 handles, reefer + grille + status light [pulsing], ramp, 4 inside pallets×2 + 2 dock pallets×2 = 12, forklift body + 4 wheels + 2 forks + carried pallet, paperwork desk + 3 papers + stamp + pen, 4 clipboards, overhead I-beam ×2 [3 parts each = 6]). Visual instances ≈80.
  ZoneTransito — ~58 meshes (animated 30×30 ocean [multi-freq waves + recompute normals/frame], horizon, tapered hull, deck, bridge base+top+windows, mast+antenna, 2 container InstancedMeshes [10 visual containers], 2 deck rails, data logger, GPS core + 3 expanding TorusGeometry rings [animated], satellite body + 2 solar panels + spinning rotor, 15-data-stream Points ship→satellite, 8-cloud Points, 2 wake triangles, route TubeGeometry [CatmullRomCurve3], 3 buoys×3 parts + blinking light = 9). Visual instances ≈110.
  ZoneLlegada — ~67 meshes (port dock, 4 bollards, 3 mooring ropes, container crane [2 towers + boom + trolley + 2 cables + spreader = 7], customs booth+window+roof, inspector body+head+clipboard, opened container [vertex-corrugated] + 2 doors, dock forklift body+4 wheels, retail shelf back+3 shelf levels = 4, 18-product-clamshell InstancedMesh, 3 price tags, customer body+head, shopping cart wireframe edges + 4 wheels, "LLEGADA · DESTINO" sign w/ CanvasTexture, floating bobbing "RECLAMO" clipboard w/ CanvasTexture). Visual instances ≈90.

SCENE-WIDE ADDITIONS (SceneManager.ts):
  — HemisphereLight(skyColor 0x8899AA, groundColor 0x1A1A2E, intensity 0.15) — softens shadow side of geometry naturally.
  — Global ambient dust mote system: 100-Point system drifting +X across all 7 zones, very subtle (size 0.05, opacity 0.15, additive-friendly), per-frame X drift + Y bob.
  — Connector dashed lines between adjacent zones now pulse opacity (0.45 + 0.15·sin(t·1.4)). NOTE: LineDashedMaterial does not expose a runtime dashOffset uniform in three r0.184; opacity pulse is the closest "moving dash" effect achievable without forking the material — flagged for a future custom ShaderMaterial replacement if a real moving-dash is required.

PER-FRAME ANIMATIONS (added in update() of each zone):
  Cosecha: pollen drift + sunlight/warm-glow flicker.
  Seleccion: belt UV map shift + screen pulse + 14 fruit-on-belt repositioned along belt path each frame.
  Packing: scale-display green pulse.
  Frio: dual frost/mist particle drift, cold-light pulse, spinning evaporator blade, 20 ice-crystal sparkle pulses, 5 curtain strips swaying ±0.08rad.
  Embarque: reefer status-light pulse.
  Transito: ocean multi-frequency waves (vertex displacement + computeVertexNormals each frame), 3 GPS rings expanding+fading, blinking buoy lights, ship→satellite data stream particles, cloud drift, wake opacity pulse, satellite rotor spin.
  Llegada: floating "RECLAMO" clipboard bob + sway.

PERFORMANCE:
  — Heavy InstancedMesh use throughout (berries, leaves, pallet boxes 36/pallet × 3 pallets, container stacks, retail products, sorting line clamshells, inside-berries, fruit-on-belt, ice crystals are individual planes for sparkle independence).
  — All SphereGeometry ≤ 12 segments (most 6-8); CylinderGeometry 5-12 segments.
  — CanvasTextures (Frio display + Frio sign + Embarque MSCU stencil + Llegada sign + Llegada RECLAMO clipboard) created once in ctor, disposed in dispose(). SSR-safe via `typeof document !== 'undefined'` guard.
  — Heaviest zone: ZoneFrio (~230 visible items including 80 frost + 30 mist + 20 ice + 36 pallet boxes). Lightest: ZoneTransito for ground meshes (most magic is in particles + animated ocean).
  — Risk-glow sweep & highlight sweep iterate ~15-25 registered materials per zone (NOT every detail) — emissive-by-default materials (LEDs, screens, sensors, status lights, displays, reefer light, GPS core, satellite windows, fluorescent tubes, mercury, button, route tube, data logger) are intentionally NOT registered so they keep glowing through highlight off-state.
  — Estimated total triangle count well under the 50k budget (low-segment primitives + heavy reuse via InstancedMesh).

DOWNSTREAM IMPACT:
  — All zones still extend THREE.Group with the original public surface: constructor(config), update(delta), setHighlight(active), setRiskLevel(level), getBoundingBox(), dispose(). Zero changes needed in PipelineCanvas, SelectionSystem, LabelSystem, CameraSystem, RiskGlow, CinematicMode.
  — userData.objectId still set on the salient meshes per zone, so SelectionSystem raycast → selectedObjectId continues to resolve to meaningful labels (e.g. `frio:pallet-1-2`, `embarque:container`, `transito:satellite`, `llegada:claim-icon`).
  — Label positions (zone.position.y + size.h + 2) unchanged — label heights still align with the new richer geometry.

FILES MODIFIED OUTSIDE T1 PHASE-1 OWNERSHIP (re-claimed for Phase 2 per orchestrator brief):
  — components/three/zones/ZoneCosecha.ts (was T3)
  — components/three/zones/ZoneSeleccion.ts (was T3)
  — components/three/zones/ZonePacking.ts (was T3)
  — components/three/zones/ZoneFrio.ts (was T3)
  — components/three/zones/ZoneEmbarque.ts (was T3)
  — components/three/zones/ZoneTransito.ts (was T3)
  — components/three/zones/ZoneLlegada.ts (was T3)
  — components/three/SceneManager.ts (was T3) — additive only: kept all original ground/grid/lights/zones/connectors logic, added hemisphere light, dust Points system, dashed-line opacity pulse + new dispose paths.

NOT TOUCHED (per Phase 2 brief):
  — components/three/PipelineCanvas.{tsx,module.css}
  — components/three/systems/* (CameraSystem, ParticleFlow, RiskGlow, SelectionSystem, LabelSystem, CinematicMode)
  — components/three/shaders/* (glassShader, temperatureHeatmap, riskGlow, particleFlow)
  — components/three/zones/index.ts (no signature changes needed)
  — lib/three-utils.ts (existing disposeObject still walks the new mesh trees correctly)
  — All T2/T4/T5 files.

NOTE for T5 / future perf passes:
  — ZoneTransito.update() recomputes ocean vertex normals every frame across 31×31 = 961 vertices. If frame budget tightens later (heavy mobile or LOD pass), this is the first place to throttle (e.g. recompute normals every 2nd frame, or use a derivative-based normal hack in a custom shader).
  — Some zones spin meshes (Frio fan blade, Transito satellite rotor) and animate Float32Array buffers (Cosecha pollen, Frio frost+mist, Transito clouds+stream). Counts deliberately kept below 100 per system to stay smooth on mid-range laptops.

2026-05-15 — Phase 2 ✅ DONE.

— — — — — PHASE 2 MATERIAL POLISH — — — — —

2026-05-15 — Phase 2 material polish complete — PBR metals, gradient sky, rim lighting.

2026-05-15 — Photoreal final polish (Sergio request "too dark, add real lighting"). Touched PipelineCanvas (T3-owned) + SceneManager (T1) per direct user authorization in this session.

PipelineCanvas.tsx:
  • Added IBL via PMREM RoomEnvironment: `pmremGenerator.fromScene(roomEnv, 0.04).texture` → `scene.environment`. environmentIntensity 0.55 to keep the dark cockpit mood. Every PBR material with metalness > 0 now picks up real reflections; matte materials get free ambient fill so the scene reads as "lit room" instead of "void".
  • renderer.toneMappingExposure 1.0 → 1.3 (ACES already on; just brighter).
  • renderer.shadowMap.type PCFSoftShadowMap → VSMShadowMap (PCFSoft deprecated in r0.184; VSM is softer + non-deprecated). Added shadow.bias -0.0004, shadow.normalBias 0.04, shadow.radius 4 for soft contact shadows.
  • Added EffectComposer pipeline: HalfFloatType + LinearSRGB render target (preserves >1.0 luminance for bloom), 4× MSAA, RenderPass → UnrealBloomPass (strength 0.55, radius 0.45, threshold 0.78 — tuned so only the always-emissive sources lift) → OutputPass (handles tone mapping + sRGB conversion). composer.render(delta) replaces renderer.render(...). Composer + bloomPass resize wired into handleResize. Cleanup: composer.dispose(), pmremGenerator.dispose(), envMap.dispose() added to teardown.
  • CSS2DRenderer label pass still runs after composer (DOM overlay on top of WebGL canvas).

SceneManager.ts:
  • Lighting rebalanced for IBL workflow (env map carries ambient, key + rim do directional shaping):
    - AmbientLight 0.20 → 0.18 (env map covers it).
    - HemisphereLight intensity 0.15 → 0.35, sky color 0x8899AA → 0x9AAECC (slightly brighter cool fill).
    - Directional key light 0xFFFFFF @ 0.8 → 0xFFF0D8 @ 1.9 (warm low industrial sun, ~2.4× brighter).
    - Rim DirectionalLight 0x4488FF intensity 0.15 → 0.55 (real silhouette separator now).
    - Key light position bumped slightly (22,32,18) for cleaner shadow direction.

Selective bloom note: the threshold 0.78 + emissiveIntensity values already in the zones (LEDs 0.5-1.5, screens/displays 0.4-0.9, GPS core 1.6, sensors 0.9, signs 0.25-0.4, route tube 0.55, mercury 0.5, status lights 1.2, fluorescent tubes 0.9) means LEDs + GPS core + sensors + status lights + reefer light hit threshold and bloom strongly; signs/screens/displays sit just under so they have a gentle halo without blowing out. CONFIG layer toggles (Particle Flow) are AdditiveBlending Points and contribute too.

Verification:
  • npx tsc --noEmit ✅ clean.
  • npm run build ✅ green (Next 16.2.6, 4 routes).
  • Browser runtime via dev log: PipelineCanvas mounts, renderer.info reports 721 draw calls / 215 geometries / 12 textures / 54,726 triangles. Triangle count UNCHANGED from prior polish (PMREM RoomEnvironment renders once at init, then env scene is GC'd). Geometry count +14 / texture count +3 reflect the PMREM cubemap + bloom blur targets. PCFSoftShadowMap deprecation warning gone (switched to VSM). One pre-existing THREE.Clock deprecation remains (line 163 of PipelineCanvas — pre-Phase-2 T3 code, not in this polish's scope). One PMREMGenerator HLSL precision warning (X4122) on Windows DirectX driver — cosmetic, harmless.

Imports added to PipelineCanvas (all from three/addons, no new npm install needed):
  RoomEnvironment, EffectComposer, RenderPass, UnrealBloomPass, OutputPass.

2026-05-15 — Floor + bloom hotfix (Sergio screenshot showed runaway bloom halo + flat floating-zones look).
  • PipelineCanvas bloom retuned: strength 0.55 → 0.4, radius 0.45 → 0.22, threshold 0.78 → 1.05. With the HDR HalfFloat target, only true emissives >1.0 luminance (LEDs, GPS core, sensors, status lights, route tube) bloom now. Screens / displays / signs / fluorescents sit just under so they have a soft halo without smearing the whole sky.
  • SceneManager floor rebuilt as TWO stacked planes:
    1. Polished-concrete base — MeshPhysicalMaterial #0A1018, roughness 0.5, metalness 0.35, envMapIntensity 0.65, clearcoat 0.5, clearcoatRoughness 0.35. Picks up IBL reflections (sky gradient + zone PointLights) + still receives VSM shadows so zones land convincingly.
    2. Emissive tech grid — custom ShaderMaterial above the base (y=-0.495, renderOrder 1, transparent + depthWrite false). Anti-aliased grid via fwidth(): minor lines every 1u (cool steel #3A5870, alpha 0.40), major lines every 10u matching zone spacing (accent green #2D8B5E, alpha 0.85). Radial fade smoothstep(22, 60, dist) so distant grid breathes into fog instead of revealing the plane edge. The transparency lets the polished-concrete reflections show through everywhere except the bright lines themselves.
  • GridHelper removed (replaced by the shader grid). gridHelper field renamed to gridMesh, dispose updated.
  • Result: floor reads as "wet polished tron grid" rather than a black slab; zones cast actual shadows onto reflective ground, no longer visually floating; bloom kept tight to genuine emissives.

SceneManager.ts changes:
  • Replaced solid black scene.background with a gradient sky-dome ShaderMaterial inside-out SphereGeometry(200, 32, 32). Three-color stop (top #0D1B2A → horizon #162030 → bottom #1B2838), exponent 0.4. Side: BackSide, depthWrite: false. Disposed in dispose().
  • Fog: FogExp2(0x0A0E14, 0.008) → FogExp2(0x0D1B2A, 0.005) — matches sky horizon color and reveals more depth at distance.
  • Ground plane: color #0A0E14 → #0F1923, roughness 0.95 → 0.85, metalness 0.05 → 0.15, added envMapIntensity 0.3 (subtle reflective industrial floor).
  • Grid helper: opacity 0.35 → 0.2, both colors unified to 0x1A2530 (subtler).
  • Added rim DirectionalLight(0x4488FF, 0.15) at (-30, 10, -20) for blue back-rim depth.

Zone material upgrades (PBR cleanup, no geometry changes):
  ALL ZONES — Berries / fruit standardized to blueberry purple #4A0E78 with metalness 0, roughness 0.35 (treeBerry/bushBerry/binBerry/floorBerry/beltFruit/insideBerry/Llegada product). Reject berries left red since they're a separate visual class.
  ALL METAL SURFACES (rollers, rails, frames, pipes, mast, cam poles, fan rings, evap unit, satellite body, fork tines, IBeam, crane, bollards, shelf frame, cart, lens ring, cable, bridge rail) — color shifted to #6B6B6B-#8A8A8A, metalness 0.75-0.85, roughness 0.35-0.5. Picks up the directional + new rim light.
  CONCRETE FLOORS (Packing pad, Embarque pad, Llegada dock) — color #5A5A5A-#707070, roughness 0.9, metalness 0.05.
  RUBBER (Seleccion belt, Packing line conveyors, all wheels) — color #1A1A1A, roughness 0.95, metalness 0.0.
  CARDBOARD master boxes (Packing master boxes, Embarque inner boxes) — color #B8860B, roughness 0.9, metalness 0.0. Frio palletBox kept #C8A77A (already in cardboard range) but explicit metalness 0 / roughness 0.9.
  WOOD (pallets, bins, crates, desks, qc desk, packing closer) — color #6E4C2A / #8B6F47, roughness 0.9, metalness 0.0.
  CORRUGATED CONTAINER (Embarque + Llegada open container) — color #7A2E2E → #8B4513 (rusty brown-orange), roughness 0.7 → 0.55, metalness 0.35 → 0.6. Door materials matched (#7A3A20).
  SHRINK WRAP (Packing) — color #A0CCE0 → #FFFFFF, opacity 0.18 → 0.4, roughness 0.1 → 0.15, metalness 0.0 → 0.1.
  WATER (Transito ocean) — color #1B3A4B → #0A2A4A, metalness 0.5 → 0.2, roughness 0.4 → 0.1, opacity 0.92 → 0.85. Now reflects the new sky gradient + rim light convincingly.
  SHIP HULL (Transito) — repainted as gray painted-steel #6B6B6B at metalness 0.75 / roughness 0.45 (was muddy navy + matte). Container stack instances bumped from 0.25→0.55 metalness for brighter painted-metal feel.
  COLD CHAMBER FLOOR (Frio) — color #334455 → #404A55, metalness 0.3 → 0.35, roughness 0.6 → 0.45 (slicker polished concrete that plays with frost particles + cold-blue light).

Verification:
  • npx tsc --noEmit — ✅ clean (0 errors).
  • npm run build — ✅ green (Next 16.2.6 Turbopack). Build emitted 4 routes: /, /_not-found, /api/health, /api/chat. NOTE: /api/chat is new since the prior polish — present from another agent's work, not from this task.
  • Glass chamber wall (Frio) untouched — already MeshPhysicalMaterial via createGlassMaterial() with transmission 0.85 / roughness 0.1, matches the spec's verification target.
  • All emissive-by-default materials (LEDs, screens, sensors, status lights, route tube, displays, fluorescent tubes, sign emissives, mercury, button, GPS core, satellite windows, data logger) untouched — they keep glowing across highlight cycles per the Phase 2 "not registered in highlightables" design.
  • Triangle count unchanged (zero geometry edits). Mesh count unchanged.

NOTE for downstream terminals:
  - app/layout.tsx and app/page.tsx export both a named export (RootLayout / HomePage) AND a default. Next.js App Router requires a default export from layout.tsx and page.tsx; the named export is preserved to satisfy the "named exports only" constraint. All other files use named exports only.
  - Sidebar activeView and BottomBar mode/layers use local useState — T4 should swap these to Zustand selectors from lib/stores once T2 publishes them.
  - AppShell accepts optional rightPanel + rightPanelOpen props for T4 to wire the contextual right panel.

— — — — — PHASE 3: WIDGET LIBRARY & DASHBOARD ROUTING — — — — —

2026-05-15 — Phase 3 T1 START: build production-grade reusable widget library + wire sidebar tabs to dashboard overlays.

NEW FILES — components/widgets/ (9 widgets, all 'use client' + named export + .module.css):
  • CircularGauge — SVG tachometer (270° sweep, 7→5 o'clock). Sizes sm 120 / md 160 / lg 200 (viewBox-based, scales). Props: value/min/max/target/label/unit/colorZones/invertZones. Background dark arc, value arc colored green/amber/red by zone (red↔green flipped when invertZones true — for "Descarte %" cases). Mount animation via stroke-dasharray + stroke-dashoffset CSS transition (1s ease-out). 5 tick marks with tiny numeric labels on inner radius. Optional triangle/dot target marker. Center: large bold value + small uppercase unit. Glow drop-shadow on value arc colored by zone. Wrapped in glassmorphism card.
  • StatCard — KPI card with optional icon (20px), label (uppercase 12px muted), value (24px bold) + unit, optional 120×28 sparkline (TrendSparkline showArea) under value, footer = delta pill (up/down/neutral with arrow + color) + optional "Meta: X". Becomes <button> when onClick supplied (hover lift + green border). Min-height 132px so cards in a grid are uniform.
  • DataTable — sortable, paginated (default 10 rows), optional searchable. ColumnDef supports types text/number/date/badge/mini-gauge + custom render(value,row). Header click cycles asc → desc → none with chevron arrows; aria-sort wired. Search filters across text/badge columns only. Pagination shows "1-10 de 45" + prev/next + "page/total" indicator. Sticky header. Alternating row tint, hover highlight, optional row-click handler. Badge type auto-colors by Spanish keyword match (crítico/alta → red, alerta/medio → amber, normal/aprobado/activa → green, etc.). Mini-gauge type renders inline MiniGauge bar. Date type formats via toLocaleDateString es-PE. Wrapped in glassmorphism card with horizontal scroll on small screens.
  • TrendSparkline — pure SVG polyline (no axes/labels). Optional gradient area fill below using <linearGradient> via useId. Color prop accepts CSS var or hex. Bails out gracefully when data has <2 points.
  • AlertBanner — full-width pill with 4px colored left border + tinted icon square + title/description + optional action button + optional X dismiss. 3 variants: critical (red, AlertTriangle, role=alert), warning (amber, AlertCircle), info (blue, Info). Slide-down keyframe on mount.
  • MiniGauge — 50×8 horizontal bar, rounded, dark track + colored fill. Optional showValue right of bar (rounded percent). Smooth CSS transition on width.
  • VarietySelector — pill-row radiogroup. Default options: Todos / Arándano / Uva / Palta / Mango / Cítricos with per-variety colors (Arándano #6B21A8, Uva #2D6B30, Palta #1A5C3A, Mango #D4A843, Cítricos #FF8800, Todos gray). Active = filled. Inactive = outline only with colored text/border. Hover lifts pill 1px.
  • SectionHeader — optional 36px tinted icon square + h2 title (18px) + muted subtitle. Optional right-aligned action node. Bottom border + 16px margin.
  • DashboardShell — overlay container. SectionHeader at top, optional alerts row, then auto-fill grid (minmax(260px, 1fr)) collapses 4→2→1 cols at 1100px / 768px. Max-width 1400px centered. Glass overlay tint (top/bottom radial). overflow-y: auto.

NEW FILES — components/widgets/index.ts: barrel exports all 9 widgets — `import { CircularGauge, StatCard, DataTable, TrendSparkline, AlertBanner, MiniGauge, VarietySelector, SectionHeader, DashboardShell } from '@/components/widgets';`

NEW FILES — components/dashboards/ (3 placeholder stubs, T1-created, owned by T2/T3/T4 to fully implement):
  • PackingDashboard.tsx — empty DashboardShell with Boxes icon, "En construcción · será completado por T2".
  • QualityDashboard.tsx — empty DashboardShell with ClipboardCheck icon, "En construcción · será completado por T3".
  • ColdChainDashboard.tsx — empty DashboardShell with Snowflake icon, "En construcción · será completado por T4".
  REASON: dashboard routing in page.tsx imports these via next/dynamic. Without stub files, the dynamic import would fail to resolve at build time even with .catch(). Stubs are minimal (~22 lines each, named export, no logic), and the full implementations from T2/T3/T4 will entirely replace them. Documenting here per file-ownership rule — these are NEW files, no existing T2/T3/T4 work was modified.

UPDATED — lib/types.ts (additive only, ADD new types at end):
  • PackingLineStatus, PackingLoteProcess (Packing operations).
  • QCInspeccion, VarietyBenchmark (Quality control).
  • CamaraFrioStatus, ExcursionEvent (Cold chain).
  • ColumnDef, GaugeColorZones (widget-shared types).
  • Added `import type { ReactNode } from 'react'` at top so ColumnDef.render's return type can be ReactNode (replaces `React.ReactNode` from spec since the file has no React namespace import).

UPDATED — app/page.tsx:
  • New `DashboardLoading` local component: spinner + "Cargando dashboard..." text.
  • Added 3 dynamic imports (ssr:false, loading: <DashboardLoading />) for PackingDashboard / QualityDashboard / ColdChainDashboard.
  • New `DashboardOverlay` component subscribes to useUiStore.activeView and renders:
      - 'comando' → <DashboardView /> + <PackingDashboard /> stacked inside .dashboardOverlay (DashboardView already exists from T2 Phase 2; this is its first time being routed-in)
      - 'calidad' → <QualityDashboard />
      - 'frio'    → <ColdChainDashboard />
      - any other → returns null (3D canvas visible, no overlay).
  • Sidebar tabs UNCHANGED — still 9 items: Centro de Comando, Operador Diario, Cuentas, Calidad, Cadena de Frío, Radar de Señales, Escucha Social, Inteligencia de Grafo, Configuración. ConfigToggles, OperatorChat, SignalQueue, ClaimsDefense remain unrouted (Phase 2 carryover, not in scope).

UPDATED — app/page.module.css:
  • .dashboardOverlay: position absolute, top var(--topbar-height), bottom var(--bottom-bar-height), left/right 0, background rgba(10,14,20,0.93), z-index 10, fadeIn 0.3s ease keyframe. Thin scrollbar styled to match dark theme (rgba(45,139,94,0.45) thumb on rgba(13,17,23,0.6) track) — both webkit and Firefox via scrollbar-color.
  • .dashboardLoading + .spinner with 1s linear infinite rotation.
  • Mobile @media: dashboard overlay extends to bottom of viewport (since BottomBar hides essential controls on mobile already).

VERIFICATION:
  • `npx tsc --noEmit` → 0 errors.
  • `npm run lint` → 0 errors, 6 warnings (all pre-existing: T4 StoryMode 3× setElapsed/setScene/completeStory + T1 Phase-2 zone _delta convention prefixes).
  • `npm run build` → green (Next 16.2.6 Turbopack). Routes unchanged (/, /_not-found, /api/chat, /api/export, /api/health, /import). One Recharts SSR width/height console-warning observed during static prerender of / — this is a known harmless Recharts behavior surfacing now because DashboardView (which uses Recharts AreaChart) is being rendered inside the new dashboardOverlay during SSR. Fixes itself on client hydrate; flagged for T2 to consider switching DashboardView's <ResponsiveContainer> to a fixed-aspect ratio in a future polish if it becomes noisy.

WIDGET EXPORTS (T2/T3/T4 — copy these import paths verbatim for Phase 3 dashboards):
  import {
    CircularGauge, StatCard, DataTable, TrendSparkline,
    AlertBanner, MiniGauge, VarietySelector, SectionHeader, DashboardShell,
  } from '@/components/widgets';
  import type { ColumnDef, GaugeColorZones } from '@/lib/types';

NEW PHASE-3 TYPES (T2/T3/T4 may consume):
  import type {
    PackingLineStatus, PackingLoteProcess,
    QCInspeccion, VarietyBenchmark,
    CamaraFrioStatus, ExcursionEvent,
  } from '@/lib/types';

NOTES for T2 / T3 / T4:
  - Replace components/dashboards/{Packing,Quality,ColdChain}Dashboard.tsx ENTIRELY when you implement your dashboard. Keep the named export name (`export function {X}Dashboard`) so the dynamic import in page.tsx keeps resolving.
  - DashboardShell handles the page chrome (header + responsive grid). Drop your widgets directly as children — the shell auto-fills 4→2→1 columns. Use `style={{ gridColumn: '1 / -1' }}` on a child to break out of the grid (e.g., a wide chart).
  - DataTable rows MUST have a stable `id` field to get a good React key (falls back to row index if absent — fine for static data, bad for paginated datasets that mutate).
  - CircularGauge's `colorZones` is a 0-100 percent scale (NOT min-max units). The component normalizes value into pct internally and picks the color band by where pct lands. Use `invertZones` for "lower is better" KPIs like Descarte %.
  - For dashboard-specific alerts, render <AlertBanner /> instances and pass them as the `alerts` prop on DashboardShell.
  - DashboardOverlay's z-index is 10 — below RightPanel (35-45) and CinematicProvider (1070+). 3D canvas stays mounted underneath; selection/hover events on the canvas are blocked by the overlay's backdrop, which is intentional (when on a dashboard view, the user is doing analysis, not 3D selection).

FILES MODIFIED OUTSIDE T1 PHASE-1 OWNERSHIP (Phase 3, documented per file-ownership rule):
  - lib/types.ts (T2) — ADD-ONLY append at end (8 new interfaces + 2 type aliases for widgets, 1 import line). No existing types touched. Phase 3 carve-out per orchestrator brief.
  - components/dashboards/{Packing,Quality,ColdChain}Dashboard.tsx (NEW, T2/T3/T4 future-owned) — minimal placeholder stubs to unblock the dynamic imports in page.tsx. Will be replaced wholesale by their respective owners.
```

### T2 — Data Layer
```
2026-05-14 17:55 — P4 START: built lib/types.ts with all domain entities, view enums, 3D config types. Added literal-union helpers (Variedad, EmbarqueStatus, ClienteSegmento, ReclamoTipo, SenalTipo) plus Vec3/Size3 so 3D + UI consumers don't have to redeclare them. No `any` anywhere; strict mode honored.
2026-05-14 17:57 — P7 DONE: lib/constants.ts has ZONE_CONFIGS (X spread -30 → +32), derived ZONE_POSITIONS / ZONE_SIZES / ZONE_COLORS / ZONE_ACCENTS / ZONE_LABELS / ZONE_ORDER lookups, PARTICLE_COLORS, NAV_ITEMS (9 items, Lucide names match T1's sidebar), DEFAULT_LAYER_VISIBILITY (flow/temp/risk/signals on; docs/grafo off), BRAND_COLORS for non-CSS use cases (e.g. Three.js materials).
2026-05-14 18:00 — P5 DONE: all 9 mock data files in lib/data/.
  • mock-clientes (6): Walmart US, Driscoll's, Tesco UK, Carrefour France, AEON Japan, MercadoLibre Perú — exact scores/totals from spec.
  • mock-embarques (8): S-8842 (high-risk arándano flagship for Walmart), S-8843…S-8849. Statuses: 1 en-camara, 2 cargado, 2 en-transito, 2 en-puerto, 1 entregado.
  • mock-lotes (20): 6 arándano, 5 uva, 4 palta, 3 mango, 2 cítricos. Risk distribution = 3 high (80-95) / 5 medium (55-75) / 12 low (15-45). Spread across all 7 zones (cosecha 1, seleccion 2, packing 2, frio 3, embarque 4, transito 4, llegada 4). embarqueId set on the 13 lotes that ship inside the 8 embarques (consistent with loteIds back-reference).
  • mock-reclamos (5): tipos calidad/temperatura/calibre, montos $12K-$85K, statuses 2 open + 1 investigating + 1 resolved + 1 closed. Largest is R-002 = $85K against S-8842/Walmart for the temp excursion.
  • mock-temperaturas: 336 entries for S-8842 over 7 days (every 30min) with explicit excursion event at reading 168 (day 4 noon) — ramp 0.3→5.8 °C, hold 4 readings (~2h) at 5.8 °C, ramp down to 1.2 °C, then drift at 1.0 ± 0.5; plus 240 entries for S-8845 stable at -0.8 ± 0.2. Uses deterministic Math.sin-based pseudo-noise so values are stable across reloads.
  • mock-senales (6): exact titles + scores + accion fields from spec, fechas late April / early-mid May.
  • mock-kpis (4): revenue-risk $1.84M (bad +12%), shipments 428 (warn 36 críticos), claims-exposure $312K (good -8%), portfolio-health 78/100 (good +4 pts). Icon strings match Lucide names.
  • mock-chat (4): exact 4-message Spanish conversation from spec.
  • mock-defense (6): 4 ready + 2 draft items per spec.
  • lib/data/index.ts re-exports all 9 named exports.
2026-05-14 18:03 — P6 DONE: 3 Zustand stores in lib/stores/.
  • pipeline-store: initialized with all 9 mock collections; addChatMessage(msg) appends.
  • ui-store: activeView default 'comando', viewMode 'pipeline', layers from DEFAULT_LAYER_VISIBILITY, sidebarCollapsed/rightPanelOpen/cinematicMode flags. Setters + toggleLayer + setLayer for fine-grained writes from ConfigToggles.
  • selection-store: selectedZone / selectedObjectId / hoveredObjectId + clearSelection().
2026-05-14 18:05 — Verified: `npx tsc --noEmit` clean (0 errors), `npm run build` succeeds (Next 16.2.6 Turbopack, static prerender of /).
2026-05-14 18:05 — P4, P5, P6, P7 ✅ DONE.

EXPORT MAP (T3 + T4: copy these import paths verbatim — strict named exports, no defaults):

// Types — import from '@/lib/types'
import type {
  PipelineZone, ViewMode, DataFlowType, BadgeVariant, SignalSource, ClaimStatus,
  DefenseItemStatus, NavViewId, Variedad, EmbarqueStatus, ClienteSegmento,
  ReclamoTipo, SenalTipo,
  Lote, Embarque, Cliente, Reclamo, Temperatura, Senal,
  KpiData, ClaimDefenseItem, ChatMessage,
  Vec3, Size3, ZoneConfig, LayerVisibility, NavItem,
} from '@/lib/types';

// Constants — import from '@/lib/constants'
import {
  ZONE_CONFIGS, ZONE_POSITIONS, ZONE_SIZES, ZONE_COLORS, ZONE_ACCENTS,
  ZONE_LABELS, ZONE_ORDER, PARTICLE_COLORS, NAV_ITEMS,
  DEFAULT_LAYER_VISIBILITY, BRAND_COLORS,
} from '@/lib/constants';

// Mock data (rarely needed directly — prefer the stores) — import from '@/lib/data'
import {
  mockLotes, mockEmbarques, mockClientes, mockReclamos, mockTemperaturas,
  mockSenales, mockKpis, mockChatMessages, mockDefenseItems,
} from '@/lib/data';

// Stores — one named hook per file
import { usePipelineStore } from '@/lib/stores/pipeline-store';
import { useUiStore }       from '@/lib/stores/ui-store';
import { useSelectionStore } from '@/lib/stores/selection-store';

// pipeline-store fields:  lotes, embarques, clientes, reclamos, temperaturas,
//                         senales, kpis, chatMessages, defenseItems, addChatMessage(msg)
// ui-store fields:        activeView/setActiveView, viewMode/setViewMode,
//                         layers/toggleLayer/setLayer, sidebarCollapsed/toggleSidebar,
//                         rightPanelOpen/setRightPanelOpen, cinematicMode/setCinematicMode
// selection-store fields: selectedZone/setSelectedZone, selectedObjectId/setSelectedObjectId,
//                         hoveredObjectId/setHoveredObjectId, clearSelection

NOTES for T3 / T4:
  - The flagship high-risk shipment is `S-8842` (Walmart, arándanos). Its loteIds are L-1001 + L-1002. mock-temperaturas has the full 7-day curve with the excursion. mock-reclamos has R-002 ($85K) tied to it. mock-senales SG-001 references it. Use S-8842 as the demo selection target.
  - ZONE_CONFIGS is the single source of truth for zone geometry. X spans -30 (cosecha) → +32 (llegada). Use it (not the derived Records) when you need full zone metadata.
  - DEFAULT_LAYER_VISIBILITY = { flow:true, temperatura:true, riesgo:true, documentos:false, senales:true, grafo:false }. T1's BottomBar layer toggles need to be wired to ui-store.toggleLayer.
  - T1 sidebar uses local useState for activeView; swap to `useUiStore(s => s.activeView)` + `useUiStore(s => s.setActiveView)`.
  - All temperature values are Celsius. setPointTemp on Embarque is also Celsius.
  - Lote.brix = 0 is intentional for palta (dry matter is the relevant metric, brix isn't tracked).

— — — — — PHASE 2: DECISION INTELLIGENCE LAYER — — — — —

2026-05-15 — Phase 2 START. Goal: convert 3D selection into a decision in <60s. Every zone/object click must answer WHAT/WHY/WHAT TO DO/WHO.
2026-05-15 — Types extended (append-only): RiskLevel, FichaTargetType, DecisionUrgencia, DataConfidence, FichaResponsable, FichaImpacto, FichaOperativa, DecisionPendiente, DataSourceInfo. No existing types were touched.
2026-05-15 — Mock data added:
  • lib/data/mock-fichas.ts — 9 fichas: FO-S-8842 (CRÍTICO 91, flagship, full causa/accion narrative anchoring on the +5.8 °C excursion + Walmart history + 17-day ETA + sibling lote bracket), FO-S-8845 (BAJO 22, reference for the "normal" path), plus 7 zone fichas (FO-zone-cosecha through FO-zone-llegada) each with their own causa/accion + responsable + impacto. Risk distribution across zones mirrors the actual operational state in the mock embarques. Helpers: findFichaForEmbarque(id), findFichaForZone(zone), findFichaById(id).
  • lib/data/mock-decisiones.ts — 4 pending decisions wired by fichaId, mix of alta/media urgencias, named responsables, ISO deadlines spread May 16-21.
  • lib/data/index.ts re-exports all new symbols.
2026-05-15 — Components shipped (all 'use client', CSS Modules, named exports):
  • DataSourceBadge — pill with FlaskConical/Database icon + source name + relative time + confidence dot (green/amber/red). useEffect mount sets the relative time so SSR/CSR don't desync; auto-refreshes every 30s.
  • CausaAccionCard — reusable, type-driven (causa = amber border + lightbulb + bullet list; accion = green border + play icon + numbered list with green pill markers).
  • ImpactoEconomico — headline "Exposición estimada" (color-graded by amount: red ≥60k, amber ≥20k, else green) + breakdown of valorEmbarque / prob % / monto + 0-100% probability bar with green→amber→red gradient.
  • TrazabilidadTimeline — horizontal 7-zone strip. Status derived from embarque.currentZone via ZONE_ORDER index: completed (filled green + check), current (amber pulsing ring), future (gray hollow), incident (red pulsing + AlertTriangle). S-8842 is hard-coded to flag transito as incident. Each dot is a button → setSelectedZone, so the 3D camera retargets when you click a step.
  • TemperaturaCurve — Recharts LineChart, 200px (configurable). Variety→range mapping (arandano -1..+1, uva -1.5..0, palta 4..7, mango 8..12, citricos 5..9) drives a green ReferenceArea band; setPointTemp drives a dashed blue ReferenceLine; excursion window auto-detected as any contiguous run with v > (max+0.5°C), labelled and drawn as a red ReferenceArea with "Excursión detectada · pico X.X °C" badge in the header. Tooltip is custom (date+time + tabular °C). Footer carries a DataSourceBadge ("Emerson Data Logger").
  • FichaOperativa — the centerpiece. Composes: header (eyebrow "Ficha operativa · {zona}" + risk pill colored by RiskLevel; CRÍTICO gets a red box-shadow pulse) → title (h2) → DataSourceBadge → risk summary card (icon + label + 0-100 gradient bar + one-sentence resumenRiesgo) → TrazabilidadTimeline (only for embarque) → CausaAccionCard("causa") → CausaAccionCard("accion") → TemperaturaCurve (only when embarque has lecturas in mock-temperaturas) → Responsable card (initials avatar + name + role) → ImpactoEconomico → 3 quick-action buttons (Generar Brief green, Carpeta Defensa amber, Contactar blue).
2026-05-15 — Existing components UPDATED (still T2-owned per Phase 2 brief):
  • RightPanel.tsx — now a dispatcher.
       Resolution order: (1) if selectedObjectId matches an embarque → focus that embarque; (2) else if selectedZone has an embarque with riskScore ≥ 80 in currentZone → focus the highest-risk one; (3) else no focused embarque. Ficha lookup: embarque ficha first, otherwise zone ficha. Render branches: ficha present → FichaOperativa (+ ZoneDetail under a divider when only a zone is selected, no embarque); else activeView === 'frio' → FrioMonitor (TemperaturaCurve for S-8842 default + DataSourceBadge); else selectedZone only → ZoneDetail; else DefaultSummary. Title + header icon adapt per branch.
  • KpiCards.tsx — DataSourceBadge under each card (per-KPI source: GraphRAG/Loggers/CRM/Modelo riesgo, confidence high/medium). KPIs with badgeVariant 'bad' get a pulseBad red glow + a thin red top line to draw the eye to Ingresos en riesgo. min-height bumped 124→148 to fit the badge.
  • DashboardView.tsx — (a) AlertaPrioritaria banner at the top (renders only when there's an embarque with riskScore ≥ 80; clicking "Ver ficha" calls setSelectedObjectId(embarque.id) + setSelectedZone(currentZone) + setRightPanelOpen(true), which makes the RightPanel render the S-8842 FichaOperativa); (b) new "Decisiones pendientes" Card with 3 DecisionRow entries — urgency dot (red/amber/green), descripcion + responsable + deadline, "Abrir ficha" button calls findFichaById and routes selection the same way; (c) DataSourceBadge added to the chart + signal queue cards.
2026-05-15 — Verified: `npx tsc --noEmit` clean (0 errors), `npm run build` succeeds (Next 16.2.6 Turbopack, prerenders /, /_not-found, /api/chat, /api/health).
2026-05-15 — Decision Intelligence Layer ✅ DONE.

PHASE-2 EXPORTS (additional symbols T3/T4/T5 may consume):

// New types — from '@/lib/types'
import type {
  RiskLevel, FichaTargetType, DecisionUrgencia, DataConfidence,
  FichaResponsable, FichaImpacto, FichaOperativa, DecisionPendiente, DataSourceInfo,
} from '@/lib/types';

// Mock helpers — from '@/lib/data' (or '@/lib/data/mock-fichas')
import { mockFichas, findFichaForEmbarque, findFichaForZone, findFichaById } from '@/lib/data';
import { mockDecisiones } from '@/lib/data';

// New components — from '@/components/panels/<name>'
import { FichaOperativa }        from '@/components/panels/FichaOperativa';
import { TrazabilidadTimeline }  from '@/components/panels/TrazabilidadTimeline';
import { TemperaturaCurve }      from '@/components/panels/TemperaturaCurve';
import { DataSourceBadge }       from '@/components/panels/DataSourceBadge';
import { CausaAccionCard }       from '@/components/panels/CausaAccionCard';
import { ImpactoEconomico }      from '@/components/panels/ImpactoEconomico';

NOTES for downstream terminals:
  - To programmatically focus the demo on S-8842 from anywhere: setSelectedObjectId('S-8842') + setSelectedZone('transito') + setRightPanelOpen(true). The RightPanel will switch to FichaOperativa automatically.
  - selectedObjectId convention reaffirmed: pass the embarque id (e.g. 'S-8842') when a 3D container/ship object is clicked. Zone-only clicks set selectedZone and leave selectedObjectId null.
  - TemperaturaCurve auto-detects excursions — if T3 ships more excursion fixtures in mock-temperaturas, the chart will pick them up without code changes.
  - The "Decisiones pendientes" list pulls straight from mock-decisiones; add more there (max 5) and the dashboard truncates to top-3 via .slice(0,3).
  - CausaAccionCard is reusable outside Ficha — useful for SignalQueue or ClaimsDefense expansions in future phases.
```

### T3 — 3D Engine
```
2026-05-14 — P8 START: scaffolded components/three/{zones,systems,shaders}/ + lib/three-utils.ts. Vanilla Three.js r0.184 (NO React Three Fiber). All Three.js work behind 'use client' in PipelineCanvas.tsx.
2026-05-14 — P11 DONE: shaders/glassShader.ts (MeshPhysicalMaterial factory, transmission 0.85), shaders/temperatureHeatmap.ts (5-stop blue→red ramp + animated noise + AdditiveBlending), shaders/riskGlow.ts (Fresnel pow(1-NdotV,3) * uRiskLevel, green→amber→red color shift, pulsing), shaders/particleFlow.ts (custom point material with per-particle aSize/aColor/aAlpha attributes, soft circle alpha falloff, distance attenuation, additive blend).
2026-05-14 — P8 DONE: SceneManager (scene #0A0E14 + FogExp2 dens 0.008, 140x50 ground plane, GridHelper 140 div 70, ambient 0.25 + dir 0.8 with 2048² shadowmap, per-zone PointLights, dashed connector lines between adjacent zones). 7 zone classes all extend THREE.Group: Cosecha (displaced terrain hills + 6 trees + 3 bins + warm point light), Seleccion (conveyor + 3 sorting stations + 2 camera poles + overhead emissive lights), Packing (4 tables + 2 stacks of 3x3 boxes + 2 pallets + labeler), Frio (MeshPhysicalMaterial glass walls + EdgeLines frame + 6 pallets with boxes + 4 corner emissive sensors + cold-blue point light + 80 frost particles drifting down + reflective floor), Embarque (corrugated container via vertex displacement + open doors + crane arm + forklift + clipboards), Transito (animated wave ocean via per-frame vertex Z displacement + tapered hull + superstructure + 4 deck containers + glowing data logger + dashed route line), Llegada (dock + inspection table + retail shelf with colored products + canvas-texture sprite client icon). Every zone implements setHighlight, setRiskLevel (lerps green→red emissive), getBoundingBox, dispose.
2026-05-14 — P9 DONE: CameraSystem with PerspectiveCamera(fov 50, near 0.1, far 500) + OrbitControls. 4 modes: pipeline (locked polar, pan+zoom only, dist 30-80), zone (full orbit, polar 0.3-1.2, dist 8-25), object (close orbit dist 2-12), cinematic (interface ready for T5). transitionToZone / transitionToPosition / resetToOverview use GSAP tween (power2.inOut, 1.2s / 0.8s) over a single state object that drives camera.position + controls.target in onUpdate — no double-tweening.
2026-05-14 — P10 DONE: ParticleFlow uses single THREE.Points with BufferGeometry across 5 flow types (trazabilidad 200 green, temperatura 180 red, documentos 140 gold, senales 160 purple + sine Y wave, reclamos 120 orange REVERSED). 800 total particles travel along a CatmullRomCurve3 (tension 0.4) through all 7 zone centers. Per-particle aSize/aColor/aAlpha attributes; ShaderMaterial uses gl_PointSize with distance attenuation + AdditiveBlending. setVisible toggles entire system from useUiStore.layers.flow.
2026-05-14 — P11 DONE: see above. Plus systems/RiskGlow.ts wraps the riskGlow shader as one inflated mesh per zone — setRisk(zoneId, level 0-1) drives uRiskLevel; toggled by useUiStore.layers.riesgo.
2026-05-14 — P12 DONE: SelectionSystem uses Raycaster against zone groups. Pointer down/up with drag-threshold of 6px (so OrbitControls drags don't trigger selection). Click → setSelectedZone + setSelectedObjectId. Double-click (300ms window) → setViewMode('object') + close camera transition. Hover applies temporary white emissive boost to MeshStandardMaterial under the cursor (restored on leave). LabelSystem uses CSS2DRenderer overlay (pointer-events:none, position absolute over the WebGL canvas), one CSS2DObject per zone with Spanish label + color-coded risk dot (green/amber/red), positioned at zone.position.y + size.h + 2. Labels hide in 'object' view mode. CSS2D renderer resizes with the WebGL renderer.
2026-05-14 — PipelineCanvas.tsx ('use client'): WebGLRenderer (antialias, PCFSoftShadowMap, ACESFilmicToneMapping, SRGBColorSpace, pixelRatio = min(devicePixelRatio, 2)), instantiates SceneManager + CameraSystem + ParticleFlow + RiskGlow + LabelSystem + SelectionSystem, RAF loop calls sceneManager.update(delta), particleFlow.update(delta), riskGlow.update(delta), cameraSystem.update(), selectionSystem.update(), then renderer.render + labelSystem.render. Subscribes to useUiStore (layer toggles + viewMode → labels) and useSelectionStore (selectedZone → camera transition + zone highlight). Cleanup: cancels RAF, removes resize listener, unsubscribes stores, disposes selection / labels / particles / risk glow / camera / scene / renderer in order, removes canvas DOM node.
2026-05-14 — `npm run build` ✅ green (Next 16.2.6 Turbopack, static prerender). `npx tsc --noEmit` clean for all T3 files (only pre-existing error is in T4's components/panels/ConfigToggles.tsx — not owned by T3, build still passes because Next's TS step accepts it).
2026-05-14 — P8, P9, P10, P11, P12 ✅ DONE.

NOTE for T1 / T5: PipelineCanvas must be imported with:
  dynamic(() => import('@/components/three/PipelineCanvas').then(m => ({ default: m.PipelineCanvas })), { ssr: false })

NOTES for T4 / T5:
  - useSelectionStore.setSelectedZone(zoneId) automatically triggers the camera transition + zone highlight. To return to the overview, call setSelectedZone(null). PipelineCanvas owns the viewMode side-effect of this transition, so callers don't need to set viewMode themselves.
  - useUiStore.layers.flow toggles the particle system. useUiStore.layers.riesgo toggles the per-zone fresnel risk glow.
  - Hover updates useSelectionStore.hoveredObjectId in real-time — RightPanel can subscribe for hover previews.
  - The CSS2DRenderer DOM is appended INSIDE the PipelineCanvas root div (sibling of the WebGL canvas), with pointer-events:none, so it won't intercept mouse events from panels rendered above.
  - RiskGlow.setRisk(zoneId, level) is exposed but currently not wired to mock data — T4 or T5 can subscribe to pipeline-store and call it per zone (e.g. compute avg riskScore of lotes in that zone / 100).
  - PipelineCanvas mounts inside its own absolutely-positioned root that fills the parent. The parent is `<div id="pipeline-canvas">` from T1's AppShell, which already provides width/height.

— — — — — PHASE 2: LIVE CLAUDE OPERATOR — — — — —

2026-05-15 — Phase 2 START: ownership transfer — T3 took ownership of components/panels/OperatorChat.{tsx,module.css} for the live-API rewire (was T4 in Phase 1). All other T4 panels untouched.
2026-05-15 — Built lib/operator/ + app/api/chat/route.ts:
  • lib/operator/system-prompt.ts → getSystemPrompt() (cached). Bakes the FULL mock state into the system prompt at first call: 8 embarques, 6 clientes, 5 reclamos, 6 señales, top-10 highest-risk lotes, S-8842 temperature summary (min/max/avg + excursion peak/start, plus stable S-8845 baseline), 4 KPIs. Rules block enforces Spanish output, no invented IDs, brief structure, responsable per acción.
  • lib/operator/stream-handler.ts → streamChat({messages,signal}) returns {chunks: AsyncIterable<string>, mode: 'live'|'mock'|'unknown'}. OperatorStreamError surfaces HTTP failures. collectStream() drains an iterable into one string. AbortSignal-aware so unmount cancels in-flight requests.
  • lib/operator/brief-generator.ts → generateBrief(embarqueId, {signal?, onChunk?}). Prompts FRESCO with the "Situación → Riesgo → Causa → Acción → Responsable → Impacto Económico" structure, 250-word cap. Optional onChunk(chunk,total) for streaming UIs.
  • lib/operator/defense-generator.ts → generateDefensePacket(reclamoId, {signal?, onChunk?}). 5-section defense packet (resumen / evidencia / línea de tiempo / análisis de temperatura / respuesta comercial), 350-word cap.
  • lib/operator/index.ts → barrel: getSystemPrompt, streamChat, collectStream, OperatorStreamError, generateBrief, generateDefensePacket.
  • app/api/chat/route.ts (runtime: 'nodejs', dynamic: 'force-dynamic'). POST { messages: ChatMessage[] }. Normalizes messages (role bot→assistant, last 10 only, drops empty). If ANTHROPIC_API_KEY missing → streams the pre-scripted demo response back as text/plain in chunks (X-Operator-Mode: mock) so the UI still feels alive. If key present → fetches https://api.anthropic.com/v1/messages with model claude-sonnet-4-20250514, max_tokens 1024, temperature 0.3, system=getSystemPrompt(), stream:true. Upstream SSE is piped through a TransformStream that parses `data: {...}` lines, extracts content_block_delta text_delta chunks, and re-emits them as plain UTF-8 bytes (header X-Operator-Mode: live). Malformed SSE lines are skipped; upstream errors surface with status + first 500 chars of body.
  • API key never leaves the server. Client only sees /api/chat — no Anthropic URL, no auth header, no key in the bundle.
2026-05-15 — Rewired components/panels/OperatorChat.tsx:
  • Removed MOCK_RESPONSES random reply. Now POSTs the last 10 messages (incl. just-sent user turn) to /api/chat.
  • Streams tokens into a "live" bubble with blinking caret. Empty-stream state shows the existing 3-dot typing indicator; once chunks arrive the caret takes over. Final accumulated text is committed to the pipeline-store via addChatMessage so history persists.
  • Aborts the active stream on unmount.
  • Error state: failed sends render a red-bordered error bubble with the original message text retained + a "Reintentar" button that re-sends. AbortError is silent (user navigated away).
  • Header status flips to "Modo demo · respuestas predefinidas" once any X-Operator-Mode:mock response is observed, so the user knows the key isn't set.
  • 4 quick-ask chip buttons below the messages: "¿Qué embarques necesitan acción?", "Brief de S-8842", "Resumen del pipeline", "Riesgo por cliente". Each chip submits a fuller, more specific prompt to FRESCO (chip label is the short version, prompt asks for structure + responsables).
  • Input + send + chips all disabled while a stream is in-flight.
  • CSS: added .caret blink, .errorBubble + .errorText + .retry, .quickAsks/.quickAsk styles. Existing typing/dot/keyframes untouched.
2026-05-15 — .env.example: added ANTHROPIC_API_KEY=sk-ant-... with comment explaining the demo fallback.
2026-05-15 — Verified: `npx tsc --noEmit` clean (0 errors), `npm run build` green (Next 16.2.6 Turbopack). Build now lists `ƒ /api/chat` (dynamic) alongside `ƒ /api/health`.
2026-05-15 — T3 Phase 2 ✅ DONE.

NOTES for T2 / T4 Phase 2:
  - To wire the "Generar Brief" button (FichaOperativa) and "Generar carpeta" button (ClaimsDefense), import { generateBrief, generateDefensePacket } from '@/lib/operator'. Both are async, both accept { signal, onChunk } so a panel can stream into a markdown viewer. Both reuse the same /api/chat endpoint — no extra route, no extra env config.
  - generateBrief/generateDefensePacket pass ONLY the synthetic user message (not the chat history) to keep token cost predictable. If a future workflow wants to inject embarque/reclamo specifics directly into the request (vs relying on the system prompt context), they can wrap the call.
  - When the key is missing, both generators ALSO get the demo streaming response — no special handling needed. Check for the "⚠️ Modo demo" prefix or HEAD-equivalent the X-Operator-Mode response header via the streamChat result.mode if you need to render a "demo" badge.
  - The system prompt is built lazily and cached in module scope, so the mock-data serialization cost is paid once per server boot.
  - Chat history is trimmed to last 10 in BOTH the client (before send) and the server (before forwarding) — defense-in-depth for token cost.

FILES MODIFIED OUTSIDE T3 PHASE-1 OWNERSHIP (re-claimed for Phase 2 per orchestrator brief):
  - components/panels/OperatorChat.tsx (was T4)
  - components/panels/OperatorChat.module.css (was T4)
  - .env.example (was T5) — appended only the ANTHROPIC_API_KEY entry; left NEXT_PUBLIC_SITE_URL intact.

— — — — — PHASE 3: QUALITY CONTROL DASHBOARD — — — — —

2026-05-15 — T3 Phase 3 ✅ DONE — Quality Control dashboard end-to-end.

NEW FILES:
  • lib/data/mock-quality.ts — comprehensive QC fixture set:
    - `gaugeConfigByVariety: Record<string, GaugeConfig[]>` — 4 gauges per variety. Palta swaps Brix → Materia Seca, Cítricos swaps Firmeza → Acidez. Color zones tuned to CircularGauge's monotonic interpretation so typical export-grade values land in the green band, off-spec values shift to amber/red.
    - `varietyStatsByVariety` — per-variety daily stat cards (inspeccionados/aprobados/rechazados/condicional/defectos/inspectores). Aggregate "Todos" rolls up to the brief's headline numbers (18/15/1/2/4.8%/3-of-4).
    - `mockQCInspecciones[12]` — Arándano ×3, Uva ×3, Palta ×3, Mango ×2, Cítricos ×1. 9 aprobado, 2 condicional, 1 rechazado (Palta L-1008, materia seca 19.4% below the 21% APHIS minimum). Each row includes brix/firmeza/calibrePromedio/defectosPct + per-row distribuciones for drill-down.
    - `mockBenchmarks[5]` — VarietyBenchmark records aligned to ProArándanos / ProHass / SENASA references: arándano 12.5°Bx@0°C 35d, uva 16.5°Bx@-0.5°C 60d, palta 23% MS @5°C 28d, mango 15°Bx@8°C 21d, cítricos 11°Bx@4°C 45d.
    - `brixTrendByVariety` + `firmezaTrendByVariety` + `acidezTrendCitricos` — 7-day series 2026-05-09 → 2026-05-15. Cítricos firmeza is replaced by acidez at render time.
    - `brixOptimalRange` + `firmezaOptimalRange` — Recharts ReferenceArea bands per variety.
    - `calibreDistByVariety` + `calibreOptimalBand` — 6-bin histograms with variety-specific buckets (arándano 8-18 mm in 2-mm steps, uva 16-26 mm, palta/cítricos 50-80 mm in 5-mm steps, mango 8-13 cm). Optimal band rendered as a green ReferenceArea spanning the modal bins.
    - `defectDistByVariety` — distinct defect taxonomy per variety (uva→Desgrane, palta→Materia seca baja + Antracnosis, mango→Antracnosis, cítricos→Pitting). 5 slices each, summing to 100%.
    - `defectColors[8]` — palette for PieChart Cell fills.

  • components/dashboards/QualityDashboard.tsx + .module.css — replaces the T1 placeholder. 'use client', named export. Layout uses DashboardShell + custom full-width `.row`/`.gaugesRow`/`.statsRow`/`.chartsRow` containers that escape the shell's auto-fill grid via gridColumn:'1/-1'.
    Section 1 — VarietySelector pill bar (Todos / Arándano / Uva / Palta / Mango / Cítricos), defaults to Arándano. Filters EVERY downstream widget through a single `selected` state.
    Section 2 — 4 CircularGauges in a glass card (4-col → 2-col → 1-col responsive). Gauge labels swap per variety (Brix→Materia Seca for Palta, Firmeza→Acidez for Cítricos).
    Section 3 — 6 StatCards (icons: ListChecks/CheckCircle2/XCircle/AlertTriangle/Bug/Users) wired to varietyStatsByVariety. Delta phrasing and arrow direction shift with each variety.
    Section 4 — Side-by-side Recharts: Calibre BarChart (220 px) with ReferenceArea on the optimal bin range + variety-colored bars; Defectos PieChart (220 px) with custom Cell colors and inline labels.
    Section 5 — Trend LineCharts (200 px each): "Brix/MS" + "Firmeza/Acidez", ReferenceArea on optimal range, mid-target ReferenceLine on the firmeza chart, dot+activeDot styled.
    Section 6 — Inspections DataTable (10 columns, sortable + searchable, pageSize 12). Custom renders: variety chip badge in variety palette color; firmeza & defectos columns combine number + MiniGauge (defectos gauge is inverted — fewer defects = more green fill, color shifts amber/red above 5%/8%); brix column shows "—" for varieties where it's not applicable (palta rows have brix=0, cítricos rows display the brix value but show "—" via the same 0-check). resultadoLabel column is a badge ("Aprobado"/"Condicional"/"Rechazado") so DataTable's badgeColor regex picks the right zone (green/amber/red).
    Section 7 — Benchmarks reference table — small static glass card listing all 5 variety specs (Brix min-óptimo-max, Firmeza/Acidez, Calibre, Temp óptima ± tolerance, Vida útil).
    Custom ChartTooltip component renders glass tooltips matching the design system.

  • lib/data/index.ts — appended quality exports (15 named values + 5 types). No existing exports touched.

VERIFICATION:
  • `npx tsc --noEmit` → ✅ 0 errors (one Recharts Pie label type required casting to PieLabelRenderProps-shape; resolved).
  • `npm run build` → ✅ green (Next 16.2.6 Turbopack, 3.6 s compile + 3.0 s tsc + 400 ms static gen). One non-fatal recharts width(-1)/height(-1) warning is emitted at static-render time because Recharts probes a 0×0 layout on the prerender pass — it disappears at runtime when the dashboard mounts inside the sized overlay (same pattern T4's ColdChain charts produced).

NOTES for other terminals:
  - The Quality dashboard is reachable today via the existing T1 page.tsx routing for activeView='calidad' (the dynamic import in page.tsx resolves the new full implementation automatically — no page.tsx change needed).
  - 3D wire-up ("click row → highlight lote in 3D") is left as a no-op until a `setSelectedLote(id)` selector lands in pipeline-store. The DataTable's onRowClick prop is untapped so it can be added later without restructuring.
  - All quality fixtures are pure data with no React/Three imports — safe to consume from server components or the operator system-prompt builder if a future phase wants FRESCO to answer QC questions over the same mock.
  - VarietyBenchmark.firmezaMin/Max/Optimo are set to 0 for Cítricos by design (acidez is the operational analogue). Consumers that read benchmarks must branch on `variedad === 'Cítricos'`.
```

### T4 — Features UI
```
2026-05-14 — P13–P18 START: read COMMS + types + stores; confirmed T2 export map.
2026-05-14 — Built UI primitives: components/ui/Badge (variants good/warn/bad/info, sm/md) + Card (glassmorphism, optional title+icon, noPadding). All CSS Modules, named exports.
2026-05-14 — P13 DONE: KpiCards (reads usePipelineStore.kpis, maps Lucide icon string→component with fallback, hover lifts border) + DashboardView (responsive grid: title/subtitle → KPI row → middleRow [Recharts AreaChart 280px with riesgo/calidad gradients, 6 months mock data, custom glass tooltip | top-3 signals sorted by score desc] → bottomRow [last-2 chat preview + read-only "Pregúntale a FRESCO..." input + Send button]). Glass background over the whole view.
2026-05-14 — P14 DONE: OperatorChat. Reads chatMessages + addChatMessage from pipeline-store. Auto-scrolls via useRef on messages and typing toggle. Enter or Send button → user message → 1.5s setTimeout → bot reply from one of 4 mock Spanish responses. Typing indicator = 3 bouncing dots with staggered animation. Send disabled while typing or input empty.
2026-05-14 — P15 DONE: SignalQueue. Sorts senales by score desc. Score color: ≥80 red, ≥65 amber, ≥50 cold-blue, else muted. Each card: large score + titulo + descripcion + accion (green) + source Badge (internal→good, market→info, client→warn, regulatory→bad). Spanish source labels.
2026-05-14 — P16 DONE: ClaimsDefense. Reads defenseItems. Header = ShieldCheck + "Carpeta de defensa de reclamo" + "{ready}/{total} listos". Progress bar = ready/total green gradient. Rows: CheckCircle2/Clock/AlertCircle by status + name + "Fuente: {source}" + status Badge (Listo/Borrador/Falta).
2026-05-14 — P17 DONE: RightPanel. position:fixed slide-in (340px, mobile=100vw), translateX transition 280ms. Reads rightPanelOpen from ui-store + selectedZone from selection-store + lotes from pipeline-store. When zone selected: 4 stats (lotes activos / riesgo prom / alto riesgo / variedades) + lotes list filtered by zone with risk Badge. When nothing selected: default summary with "haz clic en una zona" hint. X close button calls setRightPanelOpen(false).
2026-05-14 — P18 DONE: ConfigToggles. 6 pill toggles reading layers (flow/temperatura/riesgo/documentos/senales/grafo) from ui-store + toggleLayer dispatch. Active = colored fill (per spec: #1A5C3A/#FF4444/#FF8800/#D4A843/#6B5CE7/#4488FF), inactive = outline with icon tinted to that color. aria-pressed for a11y.
2026-05-14 — P18b DONE: GraphView placeholder. Network icon in tinted circle, title "Inteligencia de Grafo", Spanish blurb, "Próximamente en Fase 1" gold badge with Sparkles.
2026-05-14 — Type fix: switched LucideIcon component-type alias to the official `LucideIcon` type imported from 'lucide-react' (the locally-typed ComponentType<SVGProps<SVGSVGElement>> did not allow the `size` prop).
2026-05-14 — Verified: `npx tsc --noEmit` clean, `npm run build` succeeds (Next 16.2.6 Turbopack, /, /_not-found prerendered).
2026-05-14 — P13, P14, P15, P16, P17, P18 ✅ DONE.

EXPORTS T4 PROVIDES (T1/T5: import paths for wiring into app/page.tsx + AppShell):
  import { DashboardView }    from '@/components/panels/DashboardView';
  import { OperatorChat }     from '@/components/panels/OperatorChat';
  import { SignalQueue }      from '@/components/panels/SignalQueue';
  import { ClaimsDefense }    from '@/components/panels/ClaimsDefense';
  import { RightPanel }       from '@/components/panels/RightPanel';
  import { ConfigToggles }    from '@/components/panels/ConfigToggles';
  import { GraphView }        from '@/components/panels/GraphView';
  import { KpiCards }         from '@/components/panels/KpiCards';
  import { Badge }            from '@/components/ui/Badge';
  import { Card }             from '@/components/ui/Card';

NOTES for T1 / T3 / T5:
  - RightPanel is position:fixed; it positions itself inside top:--topbar-height, bottom:--bottom-bar-height, right:0 — no AppShell prop needed. T1's existing rightPanel slot in AppShell can be deprecated, OR T4's component can be rendered once inside AppShell (e.g. at the same level as <main>). Either works; component is self-contained.
  - ConfigToggles is the canonical layer toggle UI — T1's BottomBar layer pills (local useState) can be replaced by `<ConfigToggles />` to wire into ui-store.
  - DashboardView assumes it fills its parent (width:100% height:100% overflow-y:auto). Drop it into the canvas overlay slot when activeView === 'comando'.
  - OperatorChat is a self-contained pane (height:100% min-height:0). Place it in a sized container.
  - All panels read from stores; no props required for stateful components.

— — — — — PHASE 2: CINEMATIC STORY MODE — — — — —

2026-05-15 — Phase 2 START: built a self-contained components/cinematic/ module. NO modifications to lib/stores/, components/three/, components/panels/, or app/. All cinematic state lives in a local store (components/cinematic/store.ts) — out of lib/stores/ per ownership constraints. Reads useSelectionStore.setSelectedZone (camera driver, per T3's note) + useUiStore.setCinematicMode (flag for T3's existing CinematicMode/scene treatment) only.

NEW FILES (all under components/cinematic/):
  • store.ts — Zustand store: storyStatus (idle|running|paused|complete), currentScene 1..5, elapsed seconds, presentationMode, scriptOpen + actions. Plus TOTAL_DURATION_SEC=90, SCENE_START/SCENE_END maps, sceneFromElapsed(elapsed)→SceneId helper.
  • scenes.ts — Single source of truth: SCENES[] array (5 entries, each {id, title, startSec, endSec, narration, beats, dataOverlay}). Beats are timestamped {at, zone} pairs that drive setSelectedZone() (frío at 0:18, tránsito at 0:27, frío at 0:36/0:54, null at 0/1:12). TALKING_POINTS map for the teleprompter.
  • StoryMode.tsx + .module.css — Full-screen overlay (z 1095) with radial vignette over the 3D scene. RAF clock advances elapsed in seconds when storyStatus==='running'; transitions to next scene via sceneFromElapsed; completes at 90s. Pauses on backdrop click + Space; Escape exits. Beats useEffect picks the latest beat ≤ elapsed and dispatches setSelectedZone(zone) only when the target changes. Controls (top-right): Pausar/Reanudar, Siguiente escena, Saltar demo. Completion screen with "Repetir demo" + "Cerrar". Side-effect on body: adds .story-mode-on class for downstream .story-dim opacity rule.
  • NarrationOverlay.tsx + .module.css — Bottom-center bubble (28px desktop / 20px mobile, white w/ text-shadow). Key={scene} forces fresh fade-in animation on every scene change. Eyebrow "Escena N · Título".
  • SceneDataOverlay.tsx + .module.css — Per-scene floating data: Scene 1 = glass KPI bar across top (reads usePipelineStore.kpis); Scene 2 = pulsing red "91/100 RIESGO CRÍTICO" badge; Scene 3 = mini SVG temperature curve built inline from usePipelineStore.temperaturas (filters embarque S-8842, normalizes to 380×120 viewBox, marks peak with red dot + dashed guideline + "+5.8°C" label); Scene 4 = orange-tinted "$85,000 en riesgo" card with 3-bullet acción list; Scene 5 = centered closing tagline "¿Cuánto riesgo se pierde hoy entre planillas, sensores y correos?". The temp chart is intentionally inline SVG (not Recharts) — keeps the overlay lightweight and avoids a dep on a panel from another terminal.
  • ProgressBar.tsx + .module.css — Bottom 3px green gradient bar (drop-shadow glow). 5 clickable scene-marker dots positioned by SCENE_START%. Past dots filled bright; current dot inverted; future dots outlined. Dots call jumpToScene(id) (stopPropagation so backdrop pause doesn't fire). Time label "0:32 / 1:30" bottom-right.
  • PresentationMode.tsx + .module.css — Toggles body.presentation-mode-on (CSS :global rule scales body font-size to 130% + brightens --color-text-secondary / --color-text-muted). Renders the 6-row color legend (verde/ámbar/rojo/azul/púrpura/dorado in Spanish) bottom-left + "Datos de demostración" gold pill watermark bottom-right. Both fade-slide in. Cleans up body class on unmount.
  • DemoScript.tsx + .module.css — Teleprompter panel (right side, between topbar and bottombar, 380px). Lists all 5 scenes with timing (0:00→0:18 etc.), narration in italics, 3-bullet TALKING_POINTS each. Active scene highlighted with green border/glow + auto-scrolls into view via scrollIntoView({behavior:'smooth',block:'center'}). Clicking a scene calls jumpToScene. Toggle: Ctrl+Shift+D (custom listener inside this component) OR via DemoFAB.
  • DemoFAB.tsx + .module.css — Bottom-right (z 1070) floating column: primary green "Demo guiada [F5]" pill + secondary glass "Presentación [F8]" + "Guion [Ctrl+Shift+D]" toggles. Active states use gold tint. FAB hides itself while a story is running (storyStatus !== 'idle') so the StoryMode's own controls take over.
  • CinematicProvider.tsx — Renders <PresentationMode /> <DemoScript /> <StoryMode /> <DemoFAB />. URL params on mount: ?present=true → setPresentationMode(true); ?demo=true → startStory() after 600ms (lets the 3D canvas mount first). Global keyboard listener: F5=startStory (only when idle), F8=togglePresentationMode, Escape cascades (close story → close presentation → close script).
  • index.ts — Barrel: CinematicProvider + every component + store hooks + SCENES/TALKING_POINTS + types.

CAMERA / 3D INTEGRATION:
  - StoryMode drives the 3D camera EXCLUSIVELY via useSelectionStore.setSelectedZone() (per T3's note: PipelineCanvas owns the subscription that transitions camera + zone highlight + viewMode). No direct CameraSystem touch, no GSAP timeline duplication — leverages T3's existing 1.2s GSAP transitions.
  - Sets useUiStore.setCinematicMode(true) on entry so any downstream effect that cares about cinematic mode (T5's CinematicMode.start() is *not* triggered — that's wired to ui-store.cinematicMode separately by PipelineCanvas; if both fire simultaneously, T5's 60s auto-fly would compete with our beat-driven setSelectedZone calls). FLAGGED: T5's CinematicMode may want to skip its auto-fly when StoryMode is already controlling camera. For now, T4's StoryMode uses setSelectedZone (which transitions camera in 'pipeline' viewMode → 'zone' viewMode), so even if CinematicMode.start() fires, it currently starts an independent GSAP tween that may visually conflict. T5 can resolve by gating CinematicMode behind a separate ui-store flag, or by having StoryMode skip setting cinematicMode. Marking this for follow-up — not blocking for the demo to work end-to-end.

KEYBOARD SHORTCUTS (registered globally by CinematicProvider, plus duplicate Escape/Space inside StoryMode for redundancy):
  F5         → Start story
  F8         → Toggle presentation mode
  Ctrl+Shift+D → Toggle teleprompter
  Escape     → Exit story OR presentation OR script (cascading)
  Space      → Pause/resume during story

ENTRY POINTS (3 ways to trigger):
  1. FAB primary button "Demo guiada"
  2. Keyboard F5
  3. URL: agrovia.infratek.ai/?demo=true (auto-starts on page load); ?present=true enables presentation; combine both as ?demo=true&present=true.

2026-05-15 — Verified: `npx tsc --noEmit` clean (0 errors), `npm run build` succeeds (Next 16.2.6 Turbopack — routes /, /_not-found, /api/chat (dynamic), /api/health (dynamic)).
2026-05-15 — T4 Phase 2 ✅ DONE.

EXPORTS T4 PHASE 2 PROVIDES:
  import { CinematicProvider } from '@/components/cinematic';
  // single mount-point — internally renders StoryMode + PresentationMode + DemoScript + DemoFAB.
  // Plus barrel exports of the individual components + useCinematicStore + SCENES + types if needed.

INTEGRATION REQUIRED (T5 must do this during integration):
  ⚠️ Add `<CinematicProvider />` to app/page.tsx (top level of the HomePage component, or inside AppShell beside the canvas). It is self-contained — renders only when the user opens the demo / toggles presentation, otherwise just the FAB is visible. No props.

  Suggested location in app/page.tsx (NOTE T5 owns this file — change must be made by T5):
    return (
      <AppShell ...>
        <div className={styles.canvasWrap}>
          <PipelineCanvas />
        </div>
        <RightPanel />
        <MobileHero />
        <CinematicProvider />    {/* ← add this line */}
      </AppShell>
    );

NOTES for T3 / T5 follow-up:
  - If T5's CinematicMode.start() (the 60s auto-fly tied to ui-store.cinematicMode) conflicts with T4's StoryMode camera control, either:
      (a) Add a separate flag like ui-store.autoFlyMode and switch T5's CinematicMode to subscribe to that instead, leaving cinematicMode purely as a "UI dim / vignette on" signal.
      (b) Have T4's StoryMode NOT call setCinematicMode and rely solely on its own body class for dimming. Either works — currently going with (b)-adjacent: T4 sets cinematicMode for downstream awareness, but the camera is driven by setSelectedZone, not by CinematicMode's auto-fly. T5/T3 to choose final wiring.
  - The body class .story-mode-on is exposed for the rest of the app: any element with class "story-dim" will be faded to 20% opacity + pointer-events:none during story playback. Sidebar/TopBar/BottomBar can opt in by adding className="story-dim" if desired (T1 owns those files).
  - useCinematicStore is exported from '@/components/cinematic'. T1's TopBar can add a "Presentación" button by importing it and calling togglePresentationMode() — same store as the FAB, so both stay in sync.

— — — — — PHASE 3: COLD CHAIN DASHBOARD — — — — —

2026-05-15 — T4 Phase 3 START: replace placeholder ColdChainDashboard with full implementation per orchestrator brief (cold-chain manager view: "¿Alguna cámara fuera de rango? ¿Delta del set point? ¿Excursiones en tránsito? ¿Pre-cooling?").

NEW FILES:
  • lib/data/mock-coldchain.ts — MOCK_CAMARAS (6 chambers, CF-01..CF-06 across arándano/uva/palta/mango/pre-cool, deltas spanning normal/alerta states), MOCK_TEMP_24H (48-point generator at 30-min spacing, deterministic sin/cos noise + scripted CF-04 palta drift 5.5→6.8°C in last 4h + CF-06 pre-cool exponential cooling curve from ambient 14.5°C → 2.1°C over last 3.5h), MOCK_EMBARQUE_TEMP_MONITOR (8 rows derived from existing mock-embarques, S-8842 highlighted crítico with 1 alerta badge), MOCK_EXCURSION_HISTORY (5 events, S-8842 row 1 severo). Generator is deterministic — no Math.random, so first paint matches subsequent renders and SSR/CSR are aligned.
  • components/dashboards/ColdChainDashboard.tsx + .module.css — full replacement of T1 placeholder, 'use client', named export preserved (`export function ColdChainDashboard`). Wraps DashboardShell with critical AlertBanner (always-on for S-8842, "Ver embarque" action sets selectedZone=transito + selectedObjectId=S-8842).
    Sections:
      1. Gauges row — 4 CircularGauges (cámaras operativas 5/6 · temp promedio 0.3°C · adherencia 94.5% w/ target 98 · excursiones 7d=3 invertZones). Color zones translated from absolute [min,max] ranges into the CircularGauge percent-band model.
      2. Stat cards row — 6 StatCards (Contenedores en tránsito 12 + 2 con alerta · Pre-Cooling 3 lotes · Hrs cámara 18.5h target 24h · Humedad 92% target 90-95% · Pallets 142/180 79% · Próximo despacho 14:30).
      3. HERO 24h temperature chart — Recharts LineChart 320px ResponsiveContainer. 6 lines (CF-01 #6B21A8, CF-02 #8B5CF6, CF-03 #2D6B30, CF-04 #D4A843, CF-05 #FF8800, CF-06 #4488FF). XAxis dataKey="label" (HH:mm strings) interval=5. YAxis domain [-3,15] custom ticks. Green ReferenceArea y1=-1 y2=1 ("Rango berries" label). Red ReferenceLine y=4 ("Crítico +4°C" label). Custom multi-line tooltip showing all 6 chambers at the hovered timestamp with colored dot swatches. Recharts <Legend /> below.
      4. Cámaras DataTable — 10 columns: cámara, producto (custom variety-color badge), set point, temp actual (colored by abs delta: green<0.5, amber 0.5-1.0, red>1.0), delta (signed +N.N°C colored by same band, red bold for >1.0), humedad (text + MiniGauge, amber if outside 90-95%), pallets (text + MiniGauge cold-blue), hrs op, estado badge (DataTable's built-in regex auto-colors normal=green/alerta=amber/crítico=red), última lectura. Row click → setSelectedZone('frio') + setSelectedObjectId(`frio:${id}`).
      5. Embarques en tránsito DataTable — 10 columns: embarque (bold), contenedor, destino, set point, temp actual (delta-colored), delta, días tránsito, ETA, alertas (custom red circular badge when >0, em-dash when 0), estado badge. searchable. Row click → setSelectedZone('transito') + setSelectedObjectId(embarqueId).
      6. Excursion history DataTable — 7 columns: fecha, ubicación, duración, temp máx (red bold), producto, impacto (custom severo/moderado/leve badge), acción tomada.
    All renderers use plain Spanish labels. No hardcoded colors — all via CSS vars (--color-alert-red / --color-alert-amber / --color-accent-green-light / --color-cold-blue) except the 6 chamber line colors per spec.

GAUGE COLOR-ZONE NOTE (for reviewers): CircularGauge expects `colorZones` as percent bands of the gauge's [min,max] sweep, not absolute value ranges. The brief specified ranges in absolute units (e.g. temp promedio green [-2,2] within a -5..15 sweep). I translated each to equivalent percent bands so the widget renders the correct color thresholds:
  • Cámaras Operativas (0-6): green [5,6] → [83%,100%], amber [3,5] → [50%,83%], red [0,3] → [0%,50%].
  • Temp Promedio (-5..15): green [-2,2] → [15%,35%], amber [2,5] → [35%,50%], red [5,15] → [50%,100%].
  • Adherencia Set Point (0..100): green [95,100], amber [85,95], red [0,85] (already percent units).
  • Excursiones (0..20): green [0,2] → [0%,10%], amber [2,5] → [10%,25%], red [5,20] → [25%,100%] (invertZones=true flips green↔red rendering so 0 events draws green and 20+ draws red).

UPDATED FILES (T4 Phase 3-owned):
  • lib/data/index.ts — added 4-symbol re-export from './mock-coldchain' + 2 type re-exports (TempReading24h, EmbarqueTempMonitorRow). Block sits between mock-decisiones export and existing packing/quality blocks; existing order preserved.

VERIFICATION:
  • `npx tsc --noEmit` clean for own files. Only error reported is a PRE-EXISTING T3-owned issue in components/dashboards/QualityDashboard.tsx (`TS2769: PieLabelRenderProps incompat`) unrelated to Phase-3 cold-chain work — flagged for T3.
  • `npm run build` ✅ green (Next 16.2.6 Turbopack, 4.0s compile, "Finished TypeScript in 3.0s"). Routes unchanged. Static page generation prints a benign Recharts ResponsiveContainer width(-1)/height(-1) warning during prerender (existing pattern across dashboards).

FILES T4 PHASE 3 OWNS:
  - components/dashboards/ColdChainDashboard.tsx (REPLACED placeholder, same named export)
  - components/dashboards/ColdChainDashboard.module.css (NEW)
  - lib/data/mock-coldchain.ts (NEW)
  - lib/data/index.ts (ADDED 4 + 2 type exports; no existing lines touched)

EXPORTS FOR OTHER TERMINALS (wiring already in place):
  - <ColdChainDashboard /> remains rendered by page.tsx via the existing dynamic-import overlay for activeView==='frio'. No page.tsx change needed.
  - mock-coldchain re-exported from '@/lib/data': MOCK_CAMARAS, MOCK_TEMP_24H, MOCK_EMBARQUE_TEMP_MONITOR, MOCK_EXCURSION_HISTORY + types TempReading24h, EmbarqueTempMonitorRow.

INTEGRATION NOTES:
  - DataTable row-click handlers dispatch via useSelectionStore (setSelectedZone + setSelectedObjectId). PipelineCanvas already subscribes to selectedZone for camera flight, so clicking a cámara/embarque row will fly the camera to ZoneFrio / ZoneTransito if the user closes the dashboard overlay. If T1 wants click-to-3D to also auto-close the overlay, it's a one-liner in page.tsx.
  - The 24h temperature chart is intentionally locally generated (deterministic in mock-coldchain.ts) rather than reading pipeline-store.temperaturas — those are scoped to embarques, not cámaras. Future real-data work should add a CamaraTemperatura entity to lib/types.ts + a sensor stream in pipeline-store.

2026-05-15 — T4-Phase3 ✅ DONE.
```

### T5 — Deploy & Polish
```
2026-05-14 — P19 DONE: vercel.json (framework=nextjs, region=iad1, X-Frame-Options:DENY, X-Content-Type-Options:nosniff), .vercelignore (node_modules, .git, .env*, README.md, prompts/), .env.example (NEXT_PUBLIC_SITE_URL), app/api/health/route.ts (GET → {status, timestamp, version} with force-dynamic), public/favicon.ico (16×16 green #1A5C3A square placeholder, 1086 bytes — Node-generated valid ICO). next.config.ts already had transpilePackages:['three'] from T1.
2026-05-14 — P19: app/layout.tsx updated with full OG metadata (metadataBase + openGraph {title, description, url, type, siteName} + twitter card + icons.icon). Title/description matches spec.
2026-05-14 — Integration fix: app/page.tsx was rendering a placeholder; rewrote it as 'use client' + dynamic import of @/components/three/PipelineCanvas with ssr:false (per T3's note), added a loading state, and mounted RightPanel + MobileHero. Wrapped canvas in styles.canvasWrap which hides on mobile. Also added .canvasWrap rule to app/page.module.css.
2026-05-14 — Created components/layout/MobileHero.{tsx,module.css} (T1 layout folder, documented here): heading "FRESCO BI Móvil" + subtitle, 4 KPI cards in 2×2 grid pulling from usePipelineStore.kpis (uses Badge from T4), muted note "Accede desde desktop para la experiencia 3D completa". Hidden by default (display:none); only shown at max-width:768px.
2026-05-14 — P20 DONE: responsive @media rules added to existing CSS modules.
  • AppShell.module.css: tablet (769-1024px) forces sidebar to collapsed-width; mobile (<768px) re-layouts grid → topbar/main/bottom/sidebar (sidebar moves to bottom as tab bar) and rightPanel becomes 100vw full-screen.
  • Sidebar.module.css + Sidebar.tsx: tablet forces icon-only; mobile flips to horizontal tab bar, font-size 9px, top-border instead of left-border for active state. Nav items get data-id attribute; cuentas/frio/social/grafo hidden on mobile (leaving the 5 primary: comando, operador, calidad, senales, config).
  • TopBar.module.css: tablet shrinks columns; mobile hides .center (search input), .title, .mvpBadge — keeps eyebrow (re-styled to FRESCO logo color) + bell.
  • BottomBar.module.css: tablet shrinks; mobile hides sectionTimeline/sectionSim/sectionConfig — keeps MODE + READOUT only.
  • RightPanel.module.css: tablet overlays at min(420px,60vw) z-index 35; mobile = full screen 100vw top to bottom edge z-index 45.
  • PipelineCanvas.module.css: .root display:none on mobile (3D canvas entirely hidden, MobileHero takes over).
2026-05-14 — P21 DONE: components/three/systems/CinematicMode.ts. GSAP timeline of 8 waypoints (7 zones + return-to-overview). Per-leg durations: cosecha 8s, seleccion 8s, packing 8s, frio 8s, embarque 8s, transito 10s (drama), llegada 8s, overview 2s = 60s total. start() disables OrbitControls, builds a single tween over {cx,cy,cz,tx,ty,tz} state and chains gsap.to() per leg; onUpdate writes back into camera.position + controls.target; onComplete dispatches setCinematicMode(false). stop() kills the timeline. The CinematicMode also flips ui-store.cinematicMode on start.
2026-05-14 — Wiring: PipelineCanvas.tsx instantiates CinematicMode after SelectionSystem; its layer-subscription now also watches cinematicMode and calls cinematic.start()/stop() on transitions. Cleanup calls cinematic.dispose() in the effect teardown.
2026-05-14 — BottomBar.tsx Play button now: useUiStore.cinematicMode/setCinematicMode, click flips the flag, icon swaps Play↔Pause when active, .simBtnActive styling green. Stop (Square) button forces setCinematicMode(false). Pause/FastForward kept disabled (no Phase 0 backing). Added .simBtnActive + :disabled CSS.
2026-05-14 — P22 DONE: dev-only console.log of renderer.info (triangles, calls, geometries, textures) once after 2s warmup inside RAF in PipelineCanvas. PipelineCanvas already lazy-loaded via next/dynamic ssr:false, which code-splits Three.js into its own chunks (verified via build output). No additional bundle work needed; spec said review, not refactor.
2026-05-14 — P23 DONE: `npx tsc --noEmit` clean (0 errors). `npm run build` clean (Next 16.2.6 Turbopack, 4 routes: /, /_not-found, /api/health). `npm run lint` reports 5 pre-existing warnings in T3 zone files (unused `_delta` params — convention prefix, not a bug, not blocking). My only ESLint issue (unused eslint-disable) fixed.
2026-05-14 — DEPLOY: `npx vercel link` created .vercel + connected GitHub. `npx vercel --prod --yes` deployed successfully:
  Production URL: https://agrovia-oc705mdm1-infratekis-projects.vercel.app
  Aliased: https://agrovia-black.vercel.app
  Verified: GET /api/health → 200 OK { status: ok, ... }, headers include X-Frame-Options: DENY and X-Content-Type-Options: nosniff (vercel.json applied).
2026-05-14 — Domain: `npx vercel domains add agrovia.infratek.ai` succeeded (added to project), but DNS does not resolve from CLI host yet. Spec said domain is already in GoDaddy pointing to Vercel — so once GoDaddy propagation finishes the alias will be live. If DNS still doesn't resolve later, Serge needs to confirm the GoDaddy CNAME points to cname.vercel-dns.com (or the project's recommended target shown in Vercel dashboard → Settings → Domains).

INTEGRATION NOTES FOR FUTURE TERMINALS:
  - page.tsx mounts: AppShell → [canvasWrap > PipelineCanvas] + MobileHero + RightPanel. AppShell itself renders Sidebar/TopBar/BottomBar around `children`.
  - DashboardView, OperatorChat, SignalQueue, ClaimsDefense, ConfigToggles, GraphView (T4-owned) are NOT currently mounted in page.tsx — they exist and build green in isolation but no view-switcher overlay wires them to ui-store.activeView. This is a follow-up integration step (not a T5 deliverable — T5's scope was deploy/polish, not the per-view overlay layer). Recommend adding a ViewSwitcher overlay in a future ticket that maps activeView → component.
  - BottomBar layer pills (CONFIG section) still use local useState, not ui-store.toggleLayer. T4's ConfigToggles is the canonical component if/when BottomBar gets refactored. Leaving as-is per "do not refactor working code".
  - Sidebar activeView still uses local useState, not useUiStore.setActiveView. Same rationale.

FILES MODIFIED OUTSIDE T5 OWNERSHIP (documented per file-ownership rule):
  - app/page.tsx (T1) — converted placeholder to client+dynamic PipelineCanvas import + mounted RightPanel + MobileHero. REASON: required for "PipelineCanvas dynamically imported with ssr:false in page.tsx" integration check.
  - app/page.module.css (T1) — added .canvasWrap with mobile display:none. REASON: support the mobile/desktop switch above.
  - app/layout.tsx (T1) — added metadataBase + openGraph + twitter + icons. REASON: P19 required OG tags.
  - components/layout/AppShell.module.css (T1) — added @media rules. REASON: P20.
  - components/layout/Sidebar.{tsx,module.css} (T1) — added data-id attribute and @media rules. REASON: P20 mobile tab bar.
  - components/layout/TopBar.module.css (T1) — added @media rules. REASON: P20.
  - components/layout/BottomBar.{tsx,module.css} (T1) — added @media rules + cinematicMode wiring on SIM Play/Stop + .simBtnActive/:disabled CSS. REASON: P20 + P21 trigger.
  - components/layout/MobileHero.{tsx,module.css} (NEW under T1 layout dir) — REASON: P20 mobile hero spec.
  - components/three/PipelineCanvas.{tsx,module.css} (T3) — imported + instantiated CinematicMode, subscribed to cinematicMode, dev perf log, .root mobile display:none. REASON: P21 + P22 + P20.
  - components/panels/RightPanel.module.css (T4) — added tablet/mobile @media rules. REASON: P20.
2026-05-14 — P19, P20, P21, P22, P23 ✅ DONE.

— — — — — PHASE 2: INTEGRATION, IMPORT, EXPORT, DEPLOY v2 — — — — —

2026-05-15 — Phase 2 START: integrate T1/T2/T3/T4 Phase 2 work, add CSV import + HTML/PDF export, deploy v2.

P2-T1 DONE — CinematicProvider wired:
  • app/page.tsx: imported { CinematicProvider } from '@/components/cinematic' and mounted as a sibling inside <AppShell> (after RightPanel). Self-contained — renders DemoFAB/StoryMode/PresentationMode/DemoScript internally. Also mounted <DataSourceBanner /> at the top (renders absolutely-positioned over canvas).
  • app/page.tsx loading placeholder: AgroVIA + FRESCO Operator labels.
  • Verified PipelineCanvas still loads via dynamic({ ssr: false }).

P2-T2 DONE — CSV import:
  • lib/import/csv-parser.ts: parseLotesCsv / parseEmbarquesCsv / parseClientesCsv / parseTemperaturasCsv. Native string-tokenized CSV (handles quoted fields with commas, escaped double quotes "" → "). Header-row case-insensitive. Validation: required-column check, per-row missing-field check, enum coercion for Variedad/PipelineZone/EmbarqueStatus/ClienteSegmento (with accent normalization), number coercion (strips thousands commas), date coercion (ISO or DD/MM/YYYY → YYYY-MM-DD). Returns { data, errors } per spec. loteIds and preferencias use | or ; as inner separator.
  • lib/import/csv-templates.ts: getLote/Embarque/Cliente/Temperatura Template() — return header + 2-3 example rows matching the parser exactly. Used by the download buttons on /import.
  • lib/import/index.ts: barrel.
  • lib/stores/pipeline-store.ts (T2-owned, modified per integration carve-out — documented below): added dataSource: 'mock'|'imported', importedAt: ISO string | null, importLotes/Embarques/Clientes/Temperaturas (each sets dataSource='imported' + importedAt=now), resetToMockData (rewinds all collections from mockX and clears dataSource flag). Existing fields/actions untouched.
  • app/import/page.tsx + app/import/page.module.css: full-page /import route. 'use client'. Sections: header (back link, title, subtitle, status pill + reset button) → 1. Plantillas (4 download buttons, browser blob download) → 2. Tipo de datos (4 pills, sets active kind) → 3. Drop zone with drag/drop + file input + select button → 4. Previsualización (errors block with first 10 errors + "+N más", 5-row preview table, "Importar N registros" button). Success banner after commit.

P2-T3 DONE — Export:
  • app/api/export/route.ts: GET endpoint, dynamic='force-dynamic'. Renders a styled HTML report (light theme, print-CSS-ready). Sections: header with AgroVIA branding + source pill, exec KPIs (4-card grid), exposure card (sum of open/investigating reclamos.monto, red accent), Top 5 embarques en riesgo (sorted by riskScore desc), Lotes de riesgo alto (filter >=60), Alertas activas (señales score>=65), Decisiones pendientes (open reclamos slice 4), footer with timestamp + source. Spanish throughout. Print-tip banner with Ctrl+P instruction (hidden via @media print). HTML escaping for all dynamic strings. Query: ?source=mock|imported (defaults to mock).
  • components/panels/ExportButton.{tsx,module.css}: client button reads dataSource from pipeline-store, opens /api/export?source={mode} in new tab. Two sizes: full label (icon + text) or compact (icon-only round). Self-contained — can be dropped into TopBar, DashboardView, or anywhere.

P2-T4 DONE — Naming + DataSource banner:
  • app/layout.tsx: title → "AgroVIA — Inteligencia Postcosecha 3D | INFRATEK"; description mentions "con operador IA" + "Decisiones en menos de 60 segundos"; openGraph.siteName="AgroVIA"; OG/Twitter titles refreshed. metadataBase preserved.
  • components/layout/TopBar.tsx (T1-owned, modified): eyebrow "FRESCO Operator MVP" → "AgroVIA | FRESCO Operator"; title "Cockpit ejecutivo BI" → "Cockpit ejecutivo de inteligencia postcosecha".
  • components/layout/MobileHero.tsx (T1 carve-out from Phase 1): heading "FRESCO BI Móvil" → "AgroVIA Móvil"; subtitle now mentions "operador IA".
  • components/layout/DataSourceBanner.{tsx,module.css} (NEW, T1 layout dir carve-out): absolute-positioned pill at top-center of canvas. Gold "Operando con datos de demostración" when dataSource==='mock'; green "Datos importados · hace N min" when 'imported' (relative time auto-refreshes via 30s tick; uses a `tick` counter pattern to avoid setState-in-effect lint violation). X dismiss button. z-index 50 so it sits over canvas but under right panel.

P2-T5 DONE — Integration test + deploy:
  • `npx tsc --noEmit` → 0 errors.
  • `npm run build` → green (Next 16.2.6 Turbopack). Routes: / (○ static), /_not-found (○), /api/chat (ƒ dynamic), /api/export (ƒ dynamic, NEW), /api/health (ƒ dynamic), /import (○ static, NEW). 6 routes total (was 4 in Phase 1).
  • `npm run lint` → 0 errors, 6 warnings (3 pre-existing `_delta` in T3 zone files + 3 unused-vars in T4's StoryMode.tsx). Fixed 2 lint errors I caused: (a) refactored DataSourceBanner to use a tick-counter pattern instead of setState-in-effect; (b) escaped quotes in DemoScript.tsx narration (T4-owned fix, single-line change, react/no-unescaped-entities).
  • `npx vercel --prod --yes` → SUCCESS.
      Production URL: https://agrovia-7bqqoem3n-infratekis-projects.vercel.app
      Alias: https://agrovia.infratek.ai (custom domain resolves via GoDaddy A record 76.76.21.21, DNS verified working).
  • Smoke tests against https://agrovia.infratek.ai:
      GET / → 200 OK
      GET /import → 200 OK
      GET /api/health → 200 OK { status: ok, timestamp: ..., version: '0.1.0' }
      GET /api/export → 200 OK text/html, AgroVIA branded report

FILES MODIFIED OUTSIDE T5 OWNERSHIP (Phase 2, documented per file-ownership rule):
  - app/page.tsx (T1) — added CinematicProvider + DataSourceBanner mounts; updated loading-state branding to AgroVIA.
  - app/layout.tsx (T1) — title/description/OG updated for AgroVIA + "operador IA" mention.
  - components/layout/TopBar.tsx (T1) — eyebrow + title text updated for AgroVIA naming.
  - components/layout/MobileHero.tsx (T1 carve-out) — title/subtitle updated for AgroVIA naming.
  - components/layout/DataSourceBanner.{tsx,module.css} (NEW, T1 layout dir carve-out) — banner over canvas, reads pipeline-store.dataSource.
  - lib/stores/pipeline-store.ts (T2) — added dataSource/importedAt + import methods + resetToMockData. Existing API unchanged, additive only.
  - components/cinematic/DemoScript.tsx (T4 Phase 2) — escaped double-quote literals around scene narration to satisfy react/no-unescaped-entities. 1-line change, no behavior change.

INTEGRATION NOTES / KNOWN-OPEN ITEMS (carried from Phase 1, status unchanged):
  - DashboardView/OperatorChat/SignalQueue/ClaimsDefense/ConfigToggles/GraphView are still NOT wired to ui-store.activeView via a view-switcher overlay. RightPanel (T2 Phase 2 dispatcher: FichaOperativa / FrioMonitor / ZoneDetail / DefaultSummary) IS mounted and works end-to-end via 3D selection. Future ticket.
  - ExportButton component built but NOT MOUNTED anywhere in the live UI by default — drop it into TopBar.tsx right of the bell, or into DashboardView header, or into the import page header, when desired. Self-contained, no props needed.
  - BottomBar layer pills + Sidebar activeView still use local useState (Phase 1 carryover).
  - T4's StoryMode unused-vars warnings (setElapsed/setScene/completeStory) are intentional store destructures kept for future use — left untouched.

2026-05-15 — Phase 2 ✅ DONE. v2 deployed to https://agrovia.infratek.ai.

— — — — — PHASE 3: INTEGRATION & DEPLOY v3 — — — — —

2026-05-15 — Phase 3 START: T5 runs last after T1 (widget library + page.tsx overlay routing), T2 (PackingDashboard + mock-packing), T3 (QualityDashboard + mock-quality), T4 (ColdChainDashboard + mock-coldchain) all reported ✅.

Verification (no integration fixes needed — T1 already wired everything):
  • app/page.tsx already imports the three dashboards via dynamic(ssr:false) (lines 45-67) and the DashboardOverlay component routes activeView 'comando' → DashboardView + PackingDashboard, 'calidad' → QualityDashboard, 'frio' → ColdChainDashboard. All other activeView values leave the overlay null and the 3D canvas visible.
  • app/page.module.css .dashboardOverlay is positioned between topbar and bottom-bar, glass background rgba(10,14,20,0.93), z-index 10, scrollbar-styled (webkit + firefox), 0.3s dashFadeIn keyframe, mobile @media collapses to full-height (no bottom bar).
  • Mock data source files present and exported from lib/data/index.ts: mock-packing.ts (174 lines: MOCK_PACKING_LINES + MOCK_PACKING_LOTES + MOCK_HOURLY_PRODUCTION + HourlyProduction type), mock-quality.ts (1006 lines: gauge configs + variety stats + 12 QC inspecciones + 5 benchmarks + brix/firmeza/acidez trends + calibre/defect distributions), mock-coldchain.ts (337 lines: 6 cámaras + 48-entry 24h temp curve + embarque monitor + 5 excursions).
  • Mock-data banner: skipped duplication inside each dashboard. The existing global DataSourceBanner (mounted at AppShell level in page.tsx:103) already displays a dismissible "Operando con datos de demostración" pill at the top of every view including the three dashboards. Adding a second per-dashboard banner would have required modifying T2/T3/T4-owned files (against Phase 3 constraints) and would have duplicated the same message.

Build:
  • `npx tsc --noEmit` → 0 errors.
  • `npm run build` → green (Next 16.2.6 Turbopack). Routes: / (○ static), /_not-found (○), /api/chat (ƒ dynamic), /api/export (ƒ dynamic), /api/health (ƒ dynamic), /import (○ static) — 6 routes total, unchanged from Phase 2 (dashboards live inside / via dynamic import).
  • One non-blocking recharts warning during static generation of `/`: "The width(-1) and height(-1) of chart should be greater than 0". This is the well-known ResponsiveContainer-without-DOM warning when Next prerenders the page shell; dashboards are dynamic({ssr:false}) so they don't actually render server-side. Harmless.

Deploy:
  • git add -A && git commit -m "feat: phase3 — operational dashboards (packing, quality, cold chain)" && git push origin main → commit 54f8c8b pushed to afb6514..54f8c8b.
  • `npx vercel --prod --yes` → SUCCESS. Production URL: https://agrovia-e1qr7g55x-infratekis-projects.vercel.app · Alias: https://agrovia.infratek.ai · Build 15s · Deploy 29s.
  • Smoke tests against https://agrovia.infratek.ai: GET / → 200, GET /api/health → 200 {"status":"ok","timestamp":"2026-05-15T23:25:25.491Z","version":"0.1.0"}.

FILES MODIFIED OUTSIDE T5 OWNERSHIP (Phase 3): NONE. T1 had already wired app/page.tsx + page.module.css for dashboard overlay routing as part of Phase 3 widget-library work. T5 only modified COMMS.md.

2026-05-15 — Phase 3 ✅ DONE. v3 deployed to https://agrovia.infratek.ai. 🟢 DEPLOYED v3 — Phase 3 operational dashboards live.

— — — — — PHASE 4: NAVIGATION REDESIGN & DEPLOY v4 — — — — —

2026-05-15 — Phase 4 START: replace left Sidebar + always-on RightPanel with a unified frosted-glass TopNavBar; wire all 9 views (3 of 9 were routed pre-Phase 4); make shipment detail contextual + non-blocking; redeploy.

CRITICAL STACK DEVIATION (documented per "On ambiguity, note in COMMS.md"):
  • Phase 4 prompt assumed Tailwind + shadcn/ui. Project per CLAUDE.md mandates "NO Tailwind CSS — vanilla CSS Modules only" and "NO component libraries (no shadcn, no MUI, no Chakra)". Prompt also said "No new dependencies." These conflict — installing Tailwind would be a new dep that touches every existing style file.
  • Resolution: preserved the DESIGN intent (Jony Ive / old-money frosted glass, warm gold #d4b88a, hairline 1px borders, pill geometry, SVG grain) and translated each Tailwind class string from the spec into equivalent CSS Module rules. New design tokens added to app/globals.css: --nav-height (56px), --color-glass-04/05/07/08, --color-hairline(-soft), --color-warm-gold(-dim), --color-text-warm(-60/-40), --glass-blur-2xl (blur(28px) saturate(140%)), plus a @supports-not(backdrop-filter) fallback that promotes glass-04 to 0.08 opacity.

NEW COMPONENTS (T5-owned):
  • components/shell/TopNavBar.{tsx,module.css} — fixed h-56, z-50, 3-col grid (FRESCO wordmark · 9 pill links · search/bell/avatar cluster). Pill states: rest = white/60 transparent; hover = glass-05; active = glass-08 + warm-gold + 18%-gold hairline border + tightened letter-spacing. Avatar opens dropdown with outside-click handler (Cuenta / Preferencias / Cerrar sesión). Drawer mode kicks in at ≤980px (hamburger left, drawer slides under bar, backdrop dismisses).
  • components/shell/GrainOverlay.{tsx,module.css} — single fixed pointer-events-none div inset-0 z-10 opacity 0.03, mix-blend-mode overlay. Inline <svg> with <feTurbulence baseFrequency=0.9 numOctaves=2> + <feColorMatrix> dropping channels to monochrome. Mounts once in AppShell above background, below content.
  • components/panels/ShipmentDetailPanel.{tsx,module.css} — controlled component, props { id, onClose }. Floating glass card at top:nav+12 right:16, max 420px wide, rounded-20, glass-08 background. Header: small-caps "EMBARQUE" eyebrow + ficha title + 30px round X (onClose). Body: if findFichaForEmbarque(id) → renders existing FichaOperativa; else if embarque match → 4-cell KV grid (Contenedor / Naviera / ETA / Estado) + risk dot + TemperaturaCurve; else "Sin datos" empty state. Mobile (<768px) anchors bottom instead of right.
  • components/dashboards/GraphIntelligenceView.{tsx,module.css} — full-bleed below nav, mounts existing PipelineCanvas via dynamic({ssr:false}). Bottom-left legend pill with "Inteligencia de Grafo" + orbit/zoom hint. Detail panel is force-suppressed when activeView==='grafo' so the 3D never gets covered.
  • components/dashboards/EmptyView.{tsx,module.css} — minimal placeholder card (eyebrow + title + subtitle + "Próximamente" pill) used for `cuentas` and `social` until real builds exist.

STATE CHANGES:
  • lib/types.ts: NavViewId 'senales' → 'radar' (matches Phase 4 spec). 'senales' was already used elsewhere as a LayerKey on DataFlowType — left untouched.
  • lib/constants.ts: NAV_ITEMS[5].id 'senales' → 'radar'.
  • lib/stores/ui-store.ts: added detailPanelOpen, selectedShipmentId, openDetail(id), closeDetail(). Existing fields untouched (rightPanelOpen kept for the legacy RightPanel that lives in components/panels/ but is no longer mounted — kept on disk for potential reuse in dashboards).

INTEGRATION (app/page.tsx + AppShell):
  • AppShell stripped to { GrainOverlay, TopNavBar, <main>{children} }. Old grid (sidebar/topbar/main/bottom + sliding rightPanel) deleted. Sidebar/TopBar/BottomBar/RightPanel are no longer rendered. AppShell removed cn() / collapsed state / rightPanel/rightPanelOpen props (none of the new shell needs them).
  • app/page.tsx <ViewRouter> switch maps all 9 activeView values:
        comando → DashboardView + PackingDashboard (scrollable)
        operador → OperatorChat (panel wrap)
        cuentas → EmptyView "Cuentas"
        calidad → QualityDashboard (scrollable)
        frio → ColdChainDashboard (scrollable)
        radar → SignalQueue (panel wrap)
        social → EmptyView "Escucha Social"
        grafo → GraphIntelligenceView (full-bleed 3D, no detail overlay)
        config → ConfigToggles (panel wrap)
  • <DetailMount> only renders when activeView !== 'grafo' && detailPanelOpen && selectedShipmentId.
  • app/page.module.css rewritten with .scrollPane / .panelWrap / .operatorWrap / .dashboardLoading using --nav-height for top offset and warm-gold scrollbar accents.
  • DataSourceBanner (Phase 2 global pill) and CinematicProvider remain mounted.
  • MobileHero kept (hides on >=768px; <768px shows static KPI cards as before).

DEPRECATIONS:
  • components/layout/Sidebar.{tsx,module.css} → moved via `git mv` to components/_deprecated/Sidebar.{tsx,module.css}. Not referenced anywhere in the live tree.
  • components/layout/TopBar.{tsx,module.css} and BottomBar.{tsx,module.css} are no longer rendered (AppShell stopped mounting them) but kept on disk under their original paths to avoid a broader churn.
  • components/panels/RightPanel.{tsx,module.css} is no longer mounted in page.tsx; ShipmentDetailPanel replaces its contextual role. File kept on disk.

CINEMATIC DEMO WIRING:
  • components/cinematic/StoryMode.tsx: on `active` mount → setActiveView('grafo') + closeDetail() (clean canvas for the opening scene). Scene 2-4 (the S-8842 cold-chain arc) → setActiveView('frio') + openDetail('S-8842') so the new floating panel surfaces the same data the old always-on RightPanel used to show. Scene 5 (closing) and unmount → closeDetail(). No DOM touching; all via ui-store actions.

BUILD:
  • `npx tsc --noEmit` → 0 errors.
  • `npm run build` → green (Next 16.2.6 Turbopack). 6 routes, unchanged.
  • One pre-existing recharts ResponsiveContainer warning during static prerender — same as Phase 3, harmless.

DEPLOY:
  • Single commit `6ae62ee` "feat(phase4): frosted glass top navbar + contextual detail panel + 3D view routing".
  • `git push origin main` → 27d16ce..6ae62ee.
  • `npx vercel --prod --yes` → SUCCESS. Production URL: https://agrovia-qjxkfuldc-infratekis-projects.vercel.app · Alias: https://agrovia.infratek.ai · Build 16s · Deploy 29s.
  • Smoke: GET / → 200, GET /api/health → 200 {"status":"ok","timestamp":"2026-05-15T23:48:19.898Z","version":"0.1.0"}.

DEFERRED / TODO:
  • `cuentas` and `social` are EmptyView placeholders — content is the next iteration.
  • BottomBar's TIMELINE / SIM / READOUT / CONFIG controls are no longer rendered; cinematic playback is now entirely via the DemoFAB and demo controller. If those bottom-bar controls are wanted back, they need to be rebuilt into the new chrome (top-nav secondary row or floating bottom toolbar).
  • Avatar dropdown items (Cuenta / Preferencias / Cerrar sesión) are visual only — no onClick handlers wired.
  • Search icon button is decorative — no command palette yet.
  • SCSS `.bellDot` red badge is purely cosmetic (no notifications store).

FILES MODIFIED OUTSIDE T5 OWNERSHIP (Phase 4, documented per file-ownership rule):
  - app/page.tsx (T1) — rewrote routing into ViewRouter + DetailMount; mounts new chrome.
  - app/page.module.css (T1) — replaced .dashboardOverlay/.placeholder with .scrollPane/.panelWrap/.operatorWrap.
  - app/globals.css (T1) — added Phase 4 design tokens (nav-height, glass-04/05/07/08, hairline, warm-gold, glass-blur-2xl) and @supports-not(backdrop-filter) fallback.
  - components/layout/AppShell.{tsx,module.css} (T1) — stripped to GrainOverlay + TopNavBar + main.
  - components/layout/Sidebar.{tsx,module.css} (T1) — moved via git mv to components/_deprecated/.
  - lib/types.ts (T2) — NavViewId 'senales' → 'radar'.
  - lib/constants.ts (T2) — NAV_ITEMS 'senales' → 'radar'.
  - lib/stores/ui-store.ts (T2) — added detailPanelOpen / selectedShipmentId / openDetail / closeDetail. Existing API additive only.
  - components/cinematic/StoryMode.tsx (T4 cinematic) — wired to new store actions for view + detail panel.

```

### ORCHESTRATOR
```
2026-05-14 — Project initialized from PRD v1.0
2026-05-14 — Generated CLAUDE.md, COMMS.md, T1-T5 prompts
2026-05-14 — Pushed CLAUDE.md + COMMS.md to local repo via Filesystem MCP
```

---

## BLOCKERS

```
[TEMPLATE]
🔴 BLOCKER T#: Description of issue
Blocked by: T# or external
Impact: What can't proceed
Resolution: What's needed
```

---

## DECISION LOG

| Date | Decision | Made by | Impact |
|---|---|---|---|
| 2026-05-14 | Use vanilla CSS Modules, no Tailwind | Orchestrator | All terminals must use .module.css |
| 2026-05-14 | Three.js vanilla, not React Three Fiber | Orchestrator | T3 builds raw Three.js wrapped in 'use client' |
| 2026-05-14 | Phase 0 uses mock data only, no DB | Orchestrator | T2 provides static mock data, no Prisma yet |
| 2026-05-14 | Deploy to agrovia.infratek.ai via Vercel | Orchestrator | T5 handles Vercel config |
| 2026-05-14 | Dark theme glassmorphism aesthetic | Orchestrator | T1 sets CSS vars, all terminals follow |
| 2026-05-14 | Spanish UI text, English code | Orchestrator | All user-facing strings in Spanish |
| 2026-05-14 | page.tsx converted to client component + dynamic PipelineCanvas | T5 | Required by Next 16+ for ssr:false dynamic imports; metadata stays in layout.tsx (still server) |
| 2026-05-14 | Cinematic mode controlled via ui-store.cinematicMode flag | T5 | BottomBar dispatches setCinematicMode; PipelineCanvas subscribes and drives CinematicMode start/stop. Avoids passing refs across components |
| 2026-05-14 | Mobile primary nav = 5 items via data-id CSS hide | T5 | Keeps Sidebar.tsx logic uniform; mobile drops cuentas/frio/social/grafo by selector instead of conditional render |

---

## CROSS-TERMINAL DEPENDENCIES

```
T2 → T1: T2 needs package.json with zustand installed (T1 installs all deps)
T3 → T1: T3 needs layout with canvas container div (id="pipeline-canvas")
T3 → T2: T3 reads from Zustand stores (pipeline-store, selection-store)
T4 → T1: T4 places panels inside layout slots (right panel, bottom overlays)
T4 → T2: T4 reads from Zustand stores (pipeline-store, ui-store)
T4 → T3: T4 CONFIG toggles write to ui-store, T3 reads them for layer visibility
T5 → ALL: T5 runs after T1-T4 complete for integration + deploy
```

---

## EXPORTS T2 PROVIDES (other terminals depend on these)

```
lib/types.ts:
  - Lote, Embarque, Cliente, Reclamo, Temperatura, Senal
  - PipelineZone (enum), ZoneId (type)
  - KpiData, SignalData, ClaimDefenseItem
  - ViewMode (enum): 'pipeline' | 'zone' | 'object'

lib/stores/pipeline-store.ts:
  - usePipelineStore: { lotes, embarques, clientes, reclamos, senales, kpis }

lib/stores/ui-store.ts:
  - useUiStore: { activeView, layers (flow/temp/risk/docs/signals/graph), sidebarCollapsed }

lib/stores/selection-store.ts:
  - useSelectionStore: { selectedZone, selectedObject, hoveredObject }

lib/constants.ts:
  - ZONE_POSITIONS: Record<ZoneId, {x, y, z}>
  - ZONE_COLORS: Record<ZoneId, string>
  - ZONE_LABELS: Record<ZoneId, string> (Spanish names)
  - PARTICLE_COLORS: Record<DataFlowType, string>
```

---

## NEXT SPRINT

- [ ] Phase 1: Replace procedural geometry with Blender GLB models
- [ ] Phase 1: Add Claude API integration for live operator
- [ ] Phase 1: Add Prisma + PostgreSQL for real data
- [ ] Phase 1: Add Neo4j for GraphRAG queries
- [ ] Phase 2: Signal Radar with external data sources
- [ ] Phase 2: WhatsApp integration
