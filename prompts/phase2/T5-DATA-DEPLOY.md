Read COMMS.md and CLAUDE.md. You are T5 — Data Pipeline, Integration & Deploy owner for Phase 2.

You run LAST after T1-T4 Phase 2 are all done. Your job is threefold: (1) wire all Phase 2 components together, (2) add CSV data import capability, (3) fix all integration issues and deploy v2.

### Task 1: Wire Phase 2 Components Together

**Update `app/page.tsx`:**
- Import and render CinematicProvider from T4: `import { CinematicProvider } from '@/components/cinematic'`
- Add `<CinematicProvider />` as a sibling to the existing components (it renders its own overlay)
- Verify PipelineCanvas still loads correctly with dynamic import

**Update `app/layout.tsx`:**
- Ensure metadata is updated for v2: description mentions "inteligencia postcosecha con operador IA"
- Add `?demo=true` URL param detection (if present, auto-trigger story mode — or just document this)

**Verify cross-terminal imports resolve:**
- T2's FichaOperativa imports types from lib/types.ts
- T2's TemperaturaCurve imports from recharts
- T3's OperatorChat calls /api/chat route
- T4's StoryMode imports ZONE_CONFIGS and store hooks
- T4's SceneDataOverlay may import TemperaturaCurve from T2

### Task 2: CSV Data Import

**`app/import/page.tsx`** ('use client') — New page at /import route:
- Header: "Importar datos operativos" with Upload icon
- Drag-and-drop zone for CSV files (styled glassmorphism)
- File input for manual selection
- Template download: buttons to download CSV templates for: Lotes, Embarques, Clientes, Temperaturas
- After upload: preview table showing first 5 rows
- "Importar" button that parses and loads data into Zustand stores
- Validation: check required columns exist, types are correct, dates parse
- Error display: list of validation errors per row
- Success: "X registros importados" with summary

**`lib/import/csv-parser.ts`** — Parse CSV to typed arrays:
```typescript
export function parseLotesCsv(csvText: string): { data: Lote[], errors: string[] }
export function parseEmbarquesCsv(csvText: string): { data: Embarque[], errors: string[] }
export function parseClientesCsv(csvText: string): { data: Cliente[], errors: string[] }
export function parseTemperaturasCsv(csvText: string): { data: Temperatura[], errors: string[] }
```

Use native string splitting (no Papa Parse dependency needed for Phase 2). Handle:
- Header row detection
- Quoted fields with commas
- Date parsing (ISO and DD/MM/YYYY formats)
- Number parsing (handle commas as thousands separators)
- Missing required fields → error

**`lib/import/csv-templates.ts`** — Generate downloadable CSV templates:
```typescript
export function getLoteTemplate(): string  // Returns CSV header + 2 example rows
export function getEmbarqueTemplate(): string
export function getClienteTemplate(): string
export function getTemperaturaTemplate(): string
```

**`lib/import/index.ts`** — Barrel export.

**Update `lib/stores/pipeline-store.ts`** — ADD methods (don't break existing):
```typescript
// Add to the store interface:
importLotes: (lotes: Lote[]) => void;          // replaces mock lotes
importEmbarques: (embarques: Embarque[]) => void;
importClientes: (clientes: Cliente[]) => void;
importTemperaturas: (temps: Temperatura[]) => void;
resetToMockData: () => void;                     // revert to mock data
dataSource: 'mock' | 'imported';                 // track data provenance
```

**Add import link to Sidebar** — Since you don't own Sidebar.tsx, create a floating "Importar datos" button on the /import page itself, or add a nav instruction in COMMS.md for a future sidebar update.

### Task 3: PDF Export (Simple)

**`app/api/export/route.ts`** — GET endpoint that generates a simple HTML report:
- Reads current pipeline data from a query param or generates from mock data
- Returns HTML that can be printed/saved as PDF via browser's Ctrl+P
- Content: executive summary with KPIs, top 5 risks, active alerts, pending decisions
- Styled with inline CSS for print compatibility
- Header: "FRESCO AgroVIA — Reporte Semanal de Riesgo"
- Footer: "Generado el [date] · Datos: [mock/imported]"

**Add "Exportar reporte" button** — Create a standalone component:
**`components/panels/ExportButton.tsx`** ('use client')
- Button that opens /api/export in a new tab
- Styled as a small icon button with FileDown icon
- Can be placed anywhere — document in COMMS.md where it should go

### Task 4: Data Source & Naming Consistency

**Fix naming throughout the app:**
- The app should consistently show "AgroVIA" as the platform name
- "FRESCO" is the AI operator module name
- Update any "FRESCO Operator MVP" references to "AgroVIA | FRESCO Operator"
- Title in layout.tsx: "AgroVIA — Inteligencia Postcosecha 3D | INFRATEK"

**Update DataSource displays:**
- Every KPI should show whether data is mock or imported
- Add a global banner when using mock data: "Operando con datos de demostración" (subtle, top of page)
- When imported data is loaded, banner changes to "Datos importados · [timestamp]"

### Task 5: Full Integration Test

1. `npm run build` — fix ALL errors from all terminals
2. `npx tsc --noEmit` — fix ALL type errors
3. Verify in browser:
   - All 7 zones render with enhanced detail (T1)
   - Click zone → FichaOperativa appears in RightPanel (T2)
   - Temperature curve renders for embarque S-8842 (T2)
   - Data source badges appear on KPIs (T2)
   - Operator chat works (sends to /api/chat, gets response or mock fallback) (T3)
   - Quick-ask buttons appear below chat input (T3)
   - DemoFAB appears in bottom-right (T4)
   - Story mode plays 90-second demo (T4) — press F5 or click FAB
   - Presentation mode increases font sizes (T4) — press F8
   - /import page renders and accepts CSV (T5)
4. Fix any cross-terminal issues

### Task 6: Deploy v2

```bash
npx vercel --prod
```

Verify agrovia.infratek.ai loads with all Phase 2 features.

### Files you own
- app/page.tsx (UPDATE — add CinematicProvider)
- app/layout.tsx (UPDATE — naming, metadata)
- app/import/page.tsx (NEW)
- app/import/page.module.css (NEW)
- app/api/export/route.ts (NEW)
- lib/import/csv-parser.ts (NEW)
- lib/import/csv-templates.ts (NEW)
- lib/import/index.ts (NEW)
- lib/stores/pipeline-store.ts (UPDATE — add import methods)
- components/panels/ExportButton.tsx + .module.css (NEW)
- .env.example (UPDATE)
- vercel.json (UPDATE if needed)

### Files you CAN fix for integration
- ANY file with build/type errors — document in COMMS.md

### Constraints
- No new npm dependencies (use native APIs for CSV parsing)
- CSV import is client-side only (no server upload in Phase 2)
- PDF export via browser print (no server-side PDF generation yet)
- ALL text in Spanish
- Named exports only

### When done
1. `npm run build` — MUST PASS
2. `npx tsc --noEmit` — MUST PASS
3. `npx vercel --prod` — deploy
4. Verify agrovia.infratek.ai
5. Update COMMS.md: final project status 🟢 DEPLOYED v2
