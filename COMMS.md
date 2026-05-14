# COMMS.md — Terminal Orchestration Board
## FRESCO 3D Pipeline Intelligence

**Last updated:** 2026-05-14 · by Orchestrator
**Status:** 🟡 IN PROGRESS
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
| Foundation & Layout | T1 | ⬜ TODO | | App shell, design system, sidebar, bottom bar |
| Data Layer & Stores | T2 | ⬜ TODO | | Types, mock data, Zustand stores, constants |
| 3D Pipeline Engine | T3 | ⬜ TODO | | Three.js scene, zones, camera, particles, shaders |
| Features UI | T4 | ⬜ TODO | | Dashboard, chat, signals, claims, config panel |
| Deploy & Polish | T5 | ⬜ TODO | | Vercel, domain, mobile, cinematic, perf |

---

## TASK BOARD

| # | Task | Owner | Status | File(s) |
|---|---|---|---|---|
| P1 | Project init (create-next-app, install ALL deps) | T1 | ⬜ TODO | package.json, tsconfig.json |
| P2 | Design system (CSS variables, glassmorphism, typography) | T1 | ⬜ TODO | globals.css |
| P3 | App shell layout (sidebar + canvas + bottom bar + right panel) | T1 | ⬜ TODO | layout.tsx, AppShell, Sidebar, BottomBar |
| P4 | TypeScript interfaces for all domain entities | T2 | ⬜ TODO | lib/types.ts |
| P5 | Mock data for all entities (lotes, embarques, clientes, etc.) | T2 | ⬜ TODO | lib/data/* |
| P6 | Zustand stores (pipeline, ui, selection) | T2 | ⬜ TODO | lib/stores/* |
| P7 | Constants and design tokens in TS | T2 | ⬜ TODO | lib/constants.ts |
| P8 | Three.js scene manager + 7 zone groups | T3 | ⬜ TODO | components/three/* |
| P9 | Camera system (4 modes + GSAP transitions) | T3 | ⬜ TODO | systems/CameraSystem.ts |
| P10 | Particle data flow system | T3 | ⬜ TODO | systems/ParticleFlow.ts |
| P11 | Custom shaders (temperature, risk glow) | T3 | ⬜ TODO | shaders/* |
| P12 | Object selection with Raycaster + labels | T3 | ⬜ TODO | systems/SelectionSystem.ts |
| P13 | Executive dashboard KPI cards + charts | T4 | ⬜ TODO | components/panels/KpiCards, DashboardView |
| P14 | Operator chat UI (mock conversation) | T4 | ⬜ TODO | components/panels/OperatorChat |
| P15 | Signal radar queue list | T4 | ⬜ TODO | components/panels/SignalQueue |
| P16 | Claims defense folder UI | T4 | ⬜ TODO | components/panels/ClaimsDefense |
| P17 | Right panel (contextual detail on 3D selection) | T4 | ⬜ TODO | components/panels/RightPanel |
| P18 | CONFIG toggles (layers: flow, temp, risk, docs, signals) | T4 | ⬜ TODO | components/panels/ConfigToggles |
| P19 | Vercel config + agrovia.infratek.ai domain | T5 | ⬜ TODO | vercel.json, .vercelignore |
| P20 | Mobile responsive (< 768px: static overview, no 3D) | T5 | ⬜ TODO | responsive styles |
| P21 | Cinematic mode (auto-fly 60s pipeline tour) | T5 | ⬜ TODO | CinematicMode.ts |
| P22 | Performance optimization (LOD, dispose, lazy load) | T5 | ⬜ TODO | across codebase |
| P23 | Integration test (full build, all imports resolve) | T5 | ⬜ TODO | build verification |

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
[Timestamp entries added by T1 as it works]
```

### T2 — Data Layer
```
[Timestamp entries added by T2 as it works]
```

### T3 — 3D Engine
```
[Timestamp entries added by T3 as it works]
```

### T4 — Features UI
```
[Timestamp entries added by T4 as it works]
```

### T5 — Deploy & Polish
```
[Timestamp entries added by T5 as it works]
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
