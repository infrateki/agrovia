Read COMMS.md and CLAUDE.md. You are T4 — Features UI owner.

Your job is to build all the 2D UI panels that overlay the 3D scene: executive dashboard, operator chat, signal radar, claims defense, contextual right panel, and CONFIG toggles. These panels use glassmorphism styling over the dark 3D background.

### Tasks P13 + P14 + P15 + P16 + P17 + P18:

**P13: Executive Dashboard (DashboardView + KpiCards)**

`components/panels/DashboardView.tsx` ('use client') — Main dashboard view shown when the user is on "Centro de Comando". This overlays the canvas area as a semi-transparent panel grid:
- Top row: 4 KPI cards in a responsive row (gap 16px)
- Middle row: left side = "Portfolio risk vs quality" chart (Recharts AreaChart with gradient fill, 280px height, mock data points for 6 months), right side = Signal queue preview (top 3 signals)
- Bottom row: mini operator chat preview (last 2 messages + input field)
- All inside a scrollable container with padding
- Glassmorphism background on the whole view

`components/panels/KpiCards.tsx` ('use client') — Individual KPI card component:
- Props: KpiData
- Layout: icon (from Lucide, 20px) + label (small, muted text) on top, value (large, 28px, bold, white) in middle, badge (small pill, colored per badgeVariant) at bottom right
- Glass card styling with subtle hover effect (border brightens)
- Import usePipelineStore to read kpis array and render 4 cards

`components/ui/Card.tsx` — Reusable glassmorphism card:
- Props: { children, className?, title?, icon? (React.ReactNode), noPadding? }
- Styling: backdrop-filter: var(--glass-blur), background: var(--color-bg-glass), border: 1px solid var(--color-border-glass), border-radius: var(--radius-card), padding: 16px (unless noPadding)
- If title provided: render header with title and optional icon

`components/ui/Badge.tsx` — Reusable badge component:
- Props: { text, variant: BadgeVariant, size?: 'sm' | 'md' }
- Variants: good (green bg/text), warn (amber), bad (red), info (blue)
- Size sm: 11px, padding 2px 6px. Size md: 13px, padding 3px 10px.

**P14: Operator Chat (OperatorChat)**

`components/panels/OperatorChat.tsx` ('use client') — Chat interface:
- Reads chatMessages from usePipelineStore
- User messages right-aligned (green tint), bot messages left-aligned (glass)
- Bot avatar: small green circle with Bot icon
- Auto-scrolls to bottom on new messages
- Input: "Pregúntale a FRESCO..." with Send button
- On send: add user message, after 1.5s add mock bot response with typing indicator (3 bouncing dots)
- Header: "FRESCO Operator" with green status dot

**P15: Signal Radar Queue (SignalQueue)**

`components/panels/SignalQueue.tsx` ('use client') — Active signals list:
- Reads senales from usePipelineStore, sorted by score desc
- Each card: score (large, colored by severity), titulo (bold), acción (green text), source badge
- Header: "Cola de señales activas" with count

**P16: Claims Defense Folder (ClaimsDefense)**

`components/panels/ClaimsDefense.tsx` ('use client') — Defense checklist:
- Reads defenseItems from usePipelineStore
- Each row: status icon (CheckCircle2/Clock/AlertCircle), name, source, status badge
- Progress bar proportional to ready items
- Header: ShieldCheck + "Carpeta de defensa de reclamo" + "4/6 listos"

**P17: Right Panel (RightPanel)**

`components/panels/RightPanel.tsx` ('use client') — Slide-in panel (340px):
- Reads rightPanelOpen from useUiStore, selectedZone from useSelectionStore
- CSS transition translateX for open/close
- Content by context: zone detail (lotes list), signal queue, chat, or default summary
- Close button, glass styling, scrollable

**P18: CONFIG Toggles (ConfigToggles)**

`components/panels/ConfigToggles.tsx` ('use client') — 6 toggle pills:
- Reads layers from useUiStore, dispatches toggleLayer
- Each: icon + label, active = colored fill, inactive = outline
- Colors: Flujo=#1A5C3A, Temp=#FF4444, Riesgo=#FF8800, Docs=#D4A843, Señales=#6B5CE7, Grafo=#4488FF

**P18b: GraphView placeholder**

`components/panels/GraphView.tsx` ('use client') — Placeholder with "Próximamente en Fase 1" badge

### Files you own (ONLY modify these)
- components/panels/DashboardView.tsx + .module.css
- components/panels/KpiCards.tsx + .module.css
- components/panels/SignalQueue.tsx + .module.css
- components/panels/OperatorChat.tsx + .module.css
- components/panels/ClaimsDefense.tsx + .module.css
- components/panels/RightPanel.tsx + .module.css
- components/panels/ConfigToggles.tsx + .module.css
- components/panels/GraphView.tsx + .module.css
- components/ui/Badge.tsx + .module.css
- components/ui/Card.tsx + .module.css

### Files you must NOT touch
- app/* (T1), components/layout/* (T1), components/three/* (T3)
- lib/types.ts, lib/stores/*, lib/constants.ts, lib/data/* (T2) — import only

### Dependencies
- T2 stores and types must exist. Check that lib/stores/pipeline-store.ts and lib/stores/ui-store.ts are importable.
- Recharts and lucide-react must be installed (T1 did this)

### Constraints
- ALL text in Spanish. Named exports only. CSS Modules only. 'use client' on every component with hooks.
- Glassmorphism styling on all panels. Responsive < 768px.
- Lucide icons: import individually. Recharts: AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer.

### When done
1. `npx tsc --noEmit` — must pass
2. `npm run build` — must pass
3. Update COMMS.md: mark P13–P18 as ✅ DONE
