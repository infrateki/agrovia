Read COMMS.md and CLAUDE.md. You are T5 — Deploy & Polish owner.

Your job is to configure Vercel deployment to agrovia.infratek.ai, implement cinematic mode, optimize for mobile, and run the full integration test. You run LAST after T1–T4 are all done.

### Tasks P19 + P20 + P21 + P22 + P23:

**P19: Vercel Config + Domain**

1. Create `vercel.json`:
```json
{
  "framework": "nextjs",
  "regions": ["iad1"],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" }
      ]
    }
  ]
}
```
2. Create `.vercelignore`: node_modules, .git, .env*, README.md, prompts/
3. Create `.env.example`: NEXT_PUBLIC_SITE_URL=https://agrovia.infratek.ai
4. Create `app/api/health/route.ts` — GET endpoint returning `{ status: 'ok', timestamp: new Date().toISOString(), version: '0.1.0' }`
5. Ensure `next.config.ts` has `transpilePackages: ['three']` and any needed image/font configs
6. Ensure `public/favicon.ico` exists (create green square placeholder if missing)
7. Update `app/layout.tsx` metadata with OG tags:
   - og:title = "FRESCO 3D Pipeline Intelligence"
   - og:description = "Cockpit ejecutivo 3D para inteligencia postcosecha"
   - og:url = "https://agrovia.infratek.ai"
   - og:type = "website"

**P20: Mobile Responsive**

On screens < 768px:
- Sidebar collapses to a bottom tab bar showing 5 main icons (Comando, Operador, Calidad, Señales, Config) with labels below
- Three.js canvas is hidden entirely — replaced with mobile hero:
  - "FRESCO BI Móvil" heading
  - "Cockpit ejecutivo para riesgo postcosecha, reclamos e inteligencia comercial" subtitle
  - 4 KPI cards stacked in 2x2 grid below
  - "Accede desde desktop para la experiencia 3D completa" muted note
- RightPanel becomes full-screen overlay with back button
- BottomBar hides CONFIG and SIM sections, keeps only MODE toggle and READOUT
- TopBar search input hides, shows only FRESCO logo and notification bell

On screens 768px–1024px (tablet):
- Sidebar collapses to icons only (60px)
- RightPanel overlays canvas instead of pushing it
- BottomBar shows all sections but more compact

Add these responsive styles to the existing .module.css files. Do NOT break existing desktop styles.

**P21: Cinematic Mode**

`components/three/systems/CinematicMode.ts`:
- Imports GSAP and the CameraSystem
- Creates a GSAP timeline that:
  1. Zone 1 Cosecha (0s–8s): Camera orbits slowly, warm lighting emphasis
  2. Zone 2 Selección (8s–16s): Camera transition + conveyor animation highlight
  3. Zone 3 Packing (16s–24s): Focus on packing tables and boxes
  4. Zone 4 Frío (24s–32s): Camera enters through glass wall, temperature overlay activates
  5. Zone 5 Embarque (32s–40s): Container loading view
  6. Zone 6 Tránsito (40s–50s): Wide orbit showing ocean and route, 10 seconds for the drama
  7. Zone 7 Llegada (50s–58s): Dock and retail shelf
  8. Return to Pipeline overview (58s–60s)
- During cinematic: dispatches useUiStore.setCinematicMode(true), hides UI panels
- On complete or manual stop: dispatches setCinematicMode(false), restores UI
- Methods: start(), stop(), isPlaying()
- The SIM play button in BottomBar triggers this

**P22: Performance Check**

- Review all Three.js geometries for reasonable segment counts
- Verify no memory leaks: add console.log of renderer.info (triangles, draw calls, textures) in dev mode
- Check bundle size from `npm run build` output — Three.js should be code-split
- Add `loading="lazy"` to any non-critical images
- Verify dynamic imports have proper loading states

**P23: Full Integration Test**

This is the critical step. Run through everything:

1. `npm run build` — fix ALL errors. This is the most important step.
2. `npx tsc --noEmit` — fix ALL type errors
3. `npm run lint` — fix warnings if any
4. Verify these work by reading the code / checking imports:
   - AppShell renders with sidebar, topbar, canvas area, bottombar
   - PipelineCanvas is dynamically imported with ssr:false in page.tsx
   - 3D scene renders 7 zones along X axis with labels
   - Camera starts in pipeline overview mode
   - Sidebar navigation items are clickable
   - KPI cards display correct data from store
   - Chat shows mock messages
   - Signal queue renders sorted by score
   - CONFIG toggles are wired to useUiStore.layers
   - RightPanel slides in/out
5. Fix ANY cross-terminal import issues:
   - Check all imports from lib/types, lib/stores/*, lib/constants resolve
   - Check all component imports across boundaries resolve
   - Fix any "module not found" or type mismatch errors
6. Update COMMS.md with final status

### Files you own (ONLY modify these)
- vercel.json
- .vercelignore
- .env.example
- components/three/systems/CinematicMode.ts
- public/favicon.ico
- app/api/health/route.ts

### Files you CAN modify for integration fixes
- ANY file that has a build error or type error, but:
  - Document EVERY change in COMMS.md decision log
  - Only fix — do NOT refactor or add features
  - If a fix requires changing the architecture, note it as a blocker instead

### Dependencies
- ALL of T1–T4 must be complete before T5 starts

### Constraints
- Do NOT refactor working code
- Do NOT add new dependencies
- Do NOT change the design system colors or layout structure
- Domain agrovia.infratek.ai is in GoDaddy pointing to Vercel — just needs custom domain added in Vercel project settings after first deploy

### Deployment Steps (after integration passes)

```bash
# From the project root
npx vercel login          # If not already logged in
npx vercel --prod         # Deploy to production

# When prompted:
# - Set up and deploy? Y
# - Scope: select your account
# - Link existing? N (first time)
# - Project name: agrovia
# - Directory: ./
# - Override settings? N

# After deploy, add custom domain:
npx vercel domains add agrovia.infratek.ai
# Or via Vercel dashboard: Settings → Domains → Add agrovia.infratek.ai
```

### When done
1. `npm run build` — MUST PASS (this is non-negotiable)
2. `npx tsc --noEmit` — MUST PASS
3. Update COMMS.md: mark ALL tasks as ✅ DONE or list specific remaining issues
4. Update COMMS.md project status to either:
   - 🟢 DEPLOYED if Vercel deploy succeeded
   - 🟡 BUILD PASSING if build works but deploy needs manual step
   - 🔴 ISSUES if there are remaining build errors (list them)
