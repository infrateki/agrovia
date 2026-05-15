Read CLAUDE.md. You are T1 — Foundation owner. You run FIRST before all other terminals.

Your job is to create the project skeleton that T2–T5 will build on. This is the FRESCO 3D Pipeline Intelligence app — an immersive postharvest agroexport visualization tool deployed to agrovia.infratek.ai.

### Tasks P1 + P2 + P3:

**P1: Project initialization**

1. The repo is already cloned at C:\Infratek\repos\agrovia. You are working inside it. CLAUDE.md and COMMS.md already exist — do NOT overwrite them.
2. Run: `npx create-next-app@latest . --typescript --app --eslint --no-tailwind --no-src-dir --import-alias "@/*"` (note the `.` to init in current directory). If it asks to overwrite existing files, say yes for everything EXCEPT CLAUDE.md and COMMS.md.
3. Create `.npmrc` with `legacy-peer-deps=true`
4. Install ALL dependencies for the ENTIRE project (T1–T5 need these):
```bash
npm install three @types/three gsap zustand recharts lucide-react
```
5. Verify `npm run build` passes with the fresh install

**P2: Design system in globals.css**

Replace the default `app/globals.css` with a dark-theme glassmorphism design system. Define ALL CSS custom properties:

```css
:root {
  --color-bg-main: #0A0E14;
  --color-bg-sidebar: #111820;
  --color-bg-card: #0D1117;
  --color-bg-glass: rgba(13,17,23,0.85);
  --color-border-glass: rgba(255,255,255,0.06);
  --color-text-primary: #E6EDF3;
  --color-text-secondary: #8B949E;
  --color-text-muted: #484F58;
  --color-accent-green: #1A5C3A;
  --color-accent-green-light: #2D8B5E;
  --color-accent-gold: #D4A843;
  --color-alert-red: #FF4444;
  --color-alert-amber: #FF8800;
  --color-cold-blue: #4488FF;
  --color-signal-purple: #6B5CE7;
  --color-dark-base: #1A1A2E;
  --color-surface-light: #F0F4EC;
  --radius-card: 8px;
  --radius-panel: 12px;
  --radius-badge: 4px;
  --glass-blur: blur(20px);
  --font-family: 'Inter', system-ui, -apple-system, sans-serif;
  --sidebar-width: 240px;
  --sidebar-collapsed: 60px;
  --bottom-bar-height: 64px;
  --right-panel-width: 340px;
  --topbar-height: 48px;
}
```

Include global reset (box-sizing border-box, margin 0, padding 0), body styling (dark background #0A0E14, Inter font, color --color-text-primary, overflow hidden), scrollbar styling (thin, dark track, accent green thumb), and utility classes for glassmorphism panels (.glass-panel class with backdrop-filter, background, border, border-radius). Import Inter from Google Fonts via `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap')`.

Also add CSS reset for html and body: height 100%, #__next height 100%.

**P3: App shell layout**

Create the full application layout with these components:

**`components/layout/AppShell.tsx`** ('use client') — The main layout component that arranges:
- Left sidebar (fixed, 240px width)
- Top bar (fixed, 48px height, to the right of sidebar)
- Main content area (fills remaining space, contains the canvas)
- Bottom bar (fixed, 64px height, to the right of sidebar)
- Right panel (slides in, 340px, overlays the right side)

Use CSS Grid or flexbox. The main content area must contain a div with `id="pipeline-canvas"` and `style={{ width: '100%', height: '100%', position: 'relative' }}` — this is where T3 mounts Three.js.

**`components/layout/Sidebar.tsx`** ('use client') — Left sidebar navigation:
- FRESCO logo at top: green text "FRESCO" bold + "Operator" lighter, with a small green dot indicator
- 9 navigation items with Lucide React icons. Use these exact items in this order:
  1. `Gauge` icon → "Centro de Comando" (id: 'comando')
  2. `MessageSquareText` icon → "Operador Diario" (id: 'operador')
  3. `UsersRound` icon → "Cuentas" (id: 'cuentas')
  4. `PackageCheck` icon → "Calidad" (id: 'calidad')
  5. `Thermometer` icon → "Cadena de Frío" (id: 'frio')
  6. `Radar` icon → "Radar de Señales" (id: 'senales')
  7. `Ear` icon → "Escucha Social" (id: 'social')
  8. `Network` icon → "Inteligencia de Grafo" (id: 'grafo')
  9. `Settings` icon → "Configuración" (id: 'config')
- Active item has a 3px left border in accent green and slightly brighter text
- Default active: 'comando'
- For now, use local useState for activeView (T2 creates the Zustand store later)
- At bottom: a small badge "Datos mock" with muted text and "Demo GraphRAG-ready para inteligencia postcosecha."
- Sidebar collapses to 60px showing only icons on click of a collapse button (ChevronLeft/ChevronRight)

**`components/layout/BottomBar.tsx`** ('use client') — Fixed bottom bar with 5 sections in a row:
1. **TIMELINE** — Label "TIMELINE" in small caps, a horizontal slider (range input styled dark), min/max labels "00:00" / "23:59"
2. **MODE** — Label "MODE", 3 pill buttons: "Pipeline" / "Zona" / "Objeto". Default active: Pipeline. Active button has accent green background.
3. **SIM** — Label "SIM", 4 icon buttons: Play (Play icon), Pause (Pause), Forward (FastForward), Stop (Square). Styled as small circular buttons.
4. **READOUT** — Label "READOUT", 4 mini KPI displays in a row: "$1.84M" (red badge), "428" (amber badge), "$312K" (green badge), "78/100" (green badge). Small text, compact.
5. **CONFIG** — Label "CONFIG", 6 small toggle pills: "Flujo" / "Temp" / "Riesgo" / "Docs" / "Señales" / "Grafo". Each toggleable on/off. Active = filled with that layer's color (green/red/amber/gold/purple/blue). Inactive = outline only.

All sections separated by subtle vertical dividers (1px border-right with glass border color).

**`components/layout/TopBar.tsx`** ('use client') — Top bar:
- Left: Eyebrow text "FRESCO Operator MVP" in small muted text, then "Cockpit ejecutivo BI" in larger text
- Center: Search input with placeholder "Pregúntale a FRESCO sobre riesgo, clientes, embarques o reclamos..." with Search icon (Lucide). Glassmorphism input styling.
- Right: Badge "MVP" in accent gold, notification Bell icon with a small red dot indicator

**`app/layout.tsx`** — Root layout:
- Import Inter font
- Metadata: title "FRESCO 3D Pipeline Intelligence | INFRATEK", description "Cockpit ejecutivo 3D para inteligencia postcosecha, reclamos y cadena de frío en agroexportación peruana."
- Body wraps children (no AppShell here — page.tsx handles that)

**`app/page.tsx`** — Main page:
- Import AppShell
- Render AppShell wrapping a placeholder for the canvas area: a centered message with the FRESCO logo and "Inicializando pipeline 3D..." in muted text with a subtle loading animation (CSS pulse)
- This placeholder will be replaced by T3's PipelineCanvas via dynamic import later

**`lib/utils.ts`** — Utility functions:
- `cn(...classes: (string | undefined | false)[])` — Joins class names, filtering falsy values
- `formatCurrency(value: number)` — Formats as "$1.84M", "$312K", etc.
- `formatNumber(value: number)` — Formats with locale separators
- `formatDate(date: Date | string)` — Formats as "14 May 2026"
- `formatTemperature(value: number)` — Formats as "0.5°C"

Create `.module.css` files for EACH component (AppShell.module.css, Sidebar.module.css, BottomBar.module.css, TopBar.module.css). All colors via CSS custom properties. Glassmorphism panels use: `backdrop-filter: var(--glass-blur); background: var(--color-bg-glass); border: 1px solid var(--color-border-glass);`

### Files you own (ONLY modify these)
- app/layout.tsx
- app/page.tsx
- app/globals.css
- components/layout/AppShell.tsx + .module.css
- components/layout/Sidebar.tsx + .module.css
- components/layout/BottomBar.tsx + .module.css
- components/layout/TopBar.tsx + .module.css
- lib/utils.ts
- package.json (primary owner)
- tsconfig.json (primary owner)
- next.config.ts
- .npmrc
- .gitignore

### Files you must NOT touch
- CLAUDE.md (already exists, do NOT overwrite)
- COMMS.md (already exists, only UPDATE your terminal log section)
- lib/types.ts (T2)
- lib/stores/* (T2)
- lib/data/* (T2)
- lib/constants.ts (T2)
- components/three/* (T3)
- components/panels/* (T4)
- components/ui/* (T4)
- vercel.json (T5)
- prompts/* (orchestrator reference files)

### Constraints
- ALL text labels in Spanish (navigation items, placeholders, badges, headings)
- Named exports only — no default exports
- CSS Modules only — no inline styles, no Tailwind, no styled-components
- Every component that uses hooks must have 'use client' directive at the very top
- AppShell must provide a `div#pipeline-canvas` that fills the main content area for Three.js mounting
- Sidebar active state uses local useState for now — T4 will wire it to Zustand later
- BottomBar CONFIG toggles use local useState for now — T4 will wire to Zustand later
- Do NOT install any additional packages beyond what P1 installs
- Ensure `next.config.ts` has: `transpilePackages: ['three']` for Three.js compatibility

### When done
1. Run `npx tsc --noEmit` — must pass with zero errors
2. Run `npm run build` — must pass with zero errors
3. Open browser to localhost:3000 and verify the shell renders (dark theme, sidebar, bottom bar, top bar, canvas placeholder)
4. Update COMMS.md: mark P1, P2, P3 as ✅ DONE with timestamp in the T1 terminal log
5. Note in COMMS.md terminal log: "div#pipeline-canvas ready for T3. All CSS custom properties defined. All deps installed."
