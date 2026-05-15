Read COMMS.md and CLAUDE.md. You are T5 — Integration & Deploy owner for Phase 3.

You run LAST after T1-T4 Phase 3 are all done.

### Task 1: Wire Dashboards into Page

Verify that T1's page.tsx updates correctly route to the new dashboards:
- activeView === 'comando' → existing DashboardView + PackingDashboard below it
- activeView === 'calidad' → QualityDashboard
- activeView === 'frio' → ColdChainDashboard

If T1 didn't wire this correctly, do it now:

```tsx
// In app/page.tsx, inside the AppShell, add:
import { useUiStore } from '@/lib/stores/ui-store';

// Dynamic imports
const PackingDashboard = dynamic(() => import('@/components/dashboards/PackingDashboard').then(m => ({ default: m.PackingDashboard })), { ssr: false });
const QualityDashboard = dynamic(() => import('@/components/dashboards/QualityDashboard').then(m => ({ default: m.QualityDashboard })), { ssr: false });
const ColdChainDashboard = dynamic(() => import('@/components/dashboards/ColdChainDashboard').then(m => ({ default: m.ColdChainDashboard })), { ssr: false });
```

Add overlay rendering logic:
```tsx
const { activeView } = useUiStore();
const showDashboardOverlay = ['comando', 'calidad', 'frio'].includes(activeView);

{showDashboardOverlay && (
  <div className={styles.dashboardOverlay}>
    {activeView === 'comando' && (
      <>
        <DashboardView />
        <PackingDashboard />
      </>
    )}
    {activeView === 'calidad' && <QualityDashboard />}
    {activeView === 'frio' && <ColdChainDashboard />}
  </div>
)}
```

Ensure the overlay CSS allows scrolling and has the glassmorphism background.

### Task 2: Verify All Widgets Render

Test that T1's widgets work correctly in all 3 dashboards:
- CircularGauge: SVG renders, animation plays, color zones work, all 3 sizes
- StatCard: value, delta, sparkline all visible
- DataTable: columns render, sort works, pagination works, search works, mini-gauge cells render
- VarietySelector: pills render, click switches, active state colors correctly
- AlertBanner: shows, dismiss works
- Check responsive behavior at 375px, 768px, 1024px, 1440px widths

Fix any rendering issues.

### Task 3: Verify Mock Data Loads

- PackingDashboard reads from mock-packing.ts → 4 packing lines, 8 lotes, hourly data
- QualityDashboard reads from mock-quality.ts → 12 inspections, benchmarks, trends
- ColdChainDashboard reads from mock-coldchain.ts → 6 cámaras, 48-entry 24h temp, 5 excursions
- All data types match lib/types.ts interfaces
- No TypeScript errors in data files

### Task 4: Verify Sidebar Navigation

- Click "Centro de Comando" → PackingDashboard renders below existing KPIs
- Click "Calidad" → QualityDashboard renders with variety selector
- Click "Cadena de Frío" → ColdChainDashboard renders with temp chart
- Click "Operador Diario" → existing chat works
- Click any other tab → 3D visible (no overlay)
- Active tab highlights correctly in sidebar
- Transitions are smooth (fade in/out)

### Task 5: Fix All Build Errors

This is the critical integration step:

1. `npx tsc --noEmit` — Fix ALL type errors
   - Common issues: mismatched prop types, missing imports, type narrowing
   - Check that ColumnDef type matches what DataTable expects
   - Check that GaugeColorZones matches CircularGauge props

2. `npm run build` — Fix ALL build errors
   - Common issues: dynamic import paths, missing 'use client', SSR issues
   - Ensure all dashboard components have 'use client'
   - Ensure recharts is only used in client components

3. `npm run lint` — Fix warnings

### Task 6: Mock Data Banner

Add a subtle indicator when viewing dashboards that data is mock:

At the top of each dashboard (inside DashboardShell or as a separate component), show:
"📊 Datos de demostración — Los datos reales se integran en la fase de piloto"
- Small text, muted color, dismissible
- Non-intrusive but honest about data provenance

### Task 7: Performance Check

- Verify dashboards load within 2 seconds
- Check that Recharts charts render without lag
- Verify no memory leaks when switching between tabs rapidly
- Check bundle size: `npm run build` output should show reasonable chunk sizes

### Task 8: Deploy v3

```bash
cd C:\Infratek\repos\agrovia
git add -A
git commit -m "feat: phase3 — operational dashboards (packing, quality, cold chain)"
git push
npx vercel --prod
```

Verify agrovia.infratek.ai loads with all Phase 3 features:
- Navigate to each operational tab
- Verify gauges animate
- Verify tables sort and paginate
- Verify charts render with correct data
- Test on mobile (375px) — dashboards should reflow to single column

### Files you own / can modify
- app/page.tsx (wire dashboards if T1 didn't)
- app/page.module.css (add overlay styles if needed)
- Any file with build/type errors (document in COMMS.md)
- vercel.json (if needed)

### Constraints
- Don't modify dashboard content (T2/T3/T4) unless build errors
- Don't modify widgets (T1) unless build errors
- Don't add new npm dependencies
- ALL fixes documented in COMMS.md

### When done
1. `npm run build` — MUST PASS
2. `npx tsc --noEmit` — MUST PASS
3. `npx vercel --prod` — deploy
4. Verify agrovia.infratek.ai
5. Update COMMS.md: 🟢 DEPLOYED v3 — Phase 3 operational dashboards live
