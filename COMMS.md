# COMMS.md — Terminal Orchestration Board
## FRESCO 3D Pipeline Intelligence

**Last updated:** 2026-05-14 · by T5
**Status:** 🟢 DEPLOYED (custom domain DNS pending)
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
| Data Layer & Stores | T2 | ✅ DONE | 2026-05-14 18:05 | Types, mock data, Zustand stores, constants — tsc + build green |
| 3D Pipeline Engine | T3 | ✅ DONE | 2026-05-14 | 7 zones, camera (4 modes + GSAP), particles, shaders, raycaster selection, CSS2D labels |
| Features UI | T4 | ✅ DONE | 2026-05-14 | Dashboard, chat, signals, claims, right panel, config toggles, graph placeholder |
| Deploy & Polish | T5 | ✅ DONE | 2026-05-14 | Vercel deployed, mobile responsive, cinematic mode, integration green |

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

NOTE for downstream terminals:
  - app/layout.tsx and app/page.tsx export both a named export (RootLayout / HomePage) AND a default. Next.js App Router requires a default export from layout.tsx and page.tsx; the named export is preserved to satisfy the "named exports only" constraint. All other files use named exports only.
  - Sidebar activeView and BottomBar mode/layers use local useState — T4 should swap these to Zustand selectors from lib/stores once T2 publishes them.
  - AppShell accepts optional rightPanel + rightPanelOpen props for T4 to wire the contextual right panel.
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
