# CLAUDE.md — Project Instructions for All Terminals

## Project: FRESCO 3D Pipeline Intelligence

### What this is
An immersive 3D web experience that visualizes the Peruvian agroexport postharvest pipeline (Cosecha → Selección → Packing → Frío → Embarque → Tránsito → Llegada) as an interactive Three.js model with real-time data overlays, conversational AI operator, and executive dashboard. Target: agrovia.infratek.ai

### Stack
- **Framework:** Next.js 15, App Router, TypeScript (strict)
- **3D Engine:** Three.js r170+ (vanilla, NOT React Three Fiber)
- **Animation:** GSAP 3.12+
- **State:** Zustand 5+
- **Styling:** Vanilla CSS Modules only (NO Tailwind, NO component libraries)
- **Charts:** Recharts (for dashboard KPIs only)
- **Icons:** Lucide React
- **Deployment:** Vercel → agrovia.infratek.ai

### Before doing any work
1. **Read COMMS.md** — check current status, blockers, and your terminal's ownership
2. **Check file ownership** — do NOT modify files owned by another terminal
3. **Update COMMS.md** when you start and finish work
4. Use `/compact` if context exceeds 60%
5. One task per session — use `/clear` between unrelated tasks

### Confirmed facts (source of truth)
- **GitHub repo:** https://github.com/infrateki/agrovia.git
- **Local path:** C:\Infratek\repos\agrovia
- **Domain:** agrovia.infratek.ai (Vercel + GoDaddy)
- **Brand color Agro Green:** #1A5C3A
- **Brand color Harvest Gold:** #D4A843
- **Alert Red:** #FF4444
- **Warning Amber:** #FF8800
- **Cold Blue:** #4488FF
- **Signal Purple:** #6B5CE7
- **Dark Base:** #1A1A2E
- **Light Surface:** #F0F4EC
- **Glass:** rgba(255,255,255,0.08)
- **Font:** Inter (headings bold 600-700, body 400)
- **Border radius:** 8px for cards, 12px for panels, 4px for badges
- **7 Pipeline Zones:** Cosecha, Selección, Packing, Frío, Embarque, Tránsito, Llegada
- **4 KPIs:** Ingresos en riesgo ($1.84M), Embarques monitoreados (428), Exposición reclamos ($312K), Salud de cartera (78/100)
- **Language:** ALL user-facing text is in Spanish. Code and variable names in English.
- **Contact:** sergio@infratek.ai

### Design system
- **Background:** #0A0E14 (main), #111820 (sidebar), #0D1117 (cards)
- **Text:** #E6EDF3 (primary), #8B949E (secondary), #484F58 (muted)
- **Accent:** #1A5C3A (green), #D4A843 (gold)
- **Panels:** backdrop-filter: blur(20px), background: rgba(13,17,23,0.85), border: 1px solid rgba(255,255,255,0.06)
- **Font family:** 'Inter', system-ui, sans-serif
- **Breakpoints:** 375px (mobile), 768px (tablet), 1024px (desktop), 1440px (wide)

### Critical constraints
- NO Tailwind CSS — vanilla CSS Modules only
- NO component libraries (no shadcn, no MUI, no Chakra)
- NO React Three Fiber — Three.js vanilla with 'use client' wrapper components
- NO default exports — named exports everywhere
- Three.js components MUST use dynamic import with ssr: false
- All CSS colors via CSS custom properties (--color-*) defined in globals.css
- Mobile: Three.js scene skipped on screens < 768px, show static overview instead
- .npmrc with legacy-peer-deps=true required for build

### File ownership
See COMMS.md for the full ownership table. Terminals MUST NOT modify files owned by another terminal.

### Commands
```bash
npm run dev          # Start dev server (port 3000)
npm run build        # Production build (must pass before deploy)
npx tsc --noEmit     # Type check
npm run lint         # Lint
```

### When you finish a task
1. Run `npx tsc --noEmit` to verify types
2. Run `npm run build` to verify production build
3. Update your section in COMMS.md with status and notes
4. If you created new exports other terminals need, note them in COMMS.md

### Architecture registry (Phase 6+)
Any new entity, source, endpoint, storage target, or BI integration MUST be registered in `lib/architecture/schema-map.ts` in the same commit it's introduced. The SCHEMA tab is the canonical view of project structure — if it's not in the registry, it doesn't exist. Update `consumes`/`exposes` so the Flow and Maturity views stay correct.

### Mistakes to avoid
- Don't use default exports; use named exports everywhere
- Don't import Three.js at module level in server components — always behind dynamic()
- Don't use window or document outside 'use client' components
- Don't put CSS in JS template literals — use .module.css files
- Don't hardcode colors — use CSS custom properties
- Don't use px for font sizes in media queries — use rem
- Don't forget 'use client' on any component that uses useState, useEffect, or Three.js
- Don't put Three.js dispose/cleanup in the wrong lifecycle — always in useEffect return
