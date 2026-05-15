Read COMMS.md and CLAUDE.md. You are T1 — Widget Library & Dashboard Routing owner for Phase 3.

ultrathink

Your job is to build a production-grade reusable widget library (gauges, tables, stat cards, sparklines) AND wire the existing sidebar tabs to render new dashboard components that T2, T3, T4 will create.

CRITICAL: Do NOT change the sidebar navigation tabs. They stay exactly as they are (Centro de Comando, Operador Diario, Cuentas, Calidad, Cadena de Frío, Radar de Señales, Escucha Social, Inteligencia de Grafo, Configuración). You are ONLY adding widgets and routing logic.

### PART A: Widget Components (components/widgets/)

Create these reusable components that all dashboards will use:

**1. `components/widgets/CircularGauge.tsx`** ('use client') — SVG tachometer gauge:
- Props: `{ value: number, min: number, max: number, target?: number, label: string, unit: string, size?: 'sm' | 'md' | 'lg', colorZones?: { green: [number, number], amber: [number, number], red: [number, number] }, invertZones?: boolean, className?: string }`
- SVG implementation (NOT canvas):
  - Outer circle: thin stroke, dark gray
  - Background arc: 270° sweep (from 7 o'clock to 5 o'clock position), dark stroke
  - Value arc: proportional fill, colored by which zone the value falls in (green/amber/red)
  - If `invertZones` is true, low values are green and high values are red (useful for "Descarte %")
  - Target indicator: small triangle/line marker on the arc at target position
  - Center text: value (large, bold, white) + unit (smaller, muted) stacked
  - Label below gauge (muted text)
  - 5 tick marks evenly spaced along arc with tiny numeric labels
- Sizes: sm=120px, md=160px, lg=200px (viewBox scales, not pixel dimensions)
- Mount animation: value sweeps from min to actual over 1s using CSS transition on stroke-dashoffset
- Glassmorphism card wrapper with subtle border

**2. `components/widgets/StatCard.tsx`** ('use client') — KPI card with sparkline:
- Props: `{ label: string, value: string, delta?: string, deltaType?: 'up' | 'down' | 'neutral', unit?: string, icon?: React.ReactNode, sparklineData?: number[], target?: string, onClick?: () => void, className?: string }`
- Layout: icon(20px) + label(muted,12px) top → value(bold,24px) + unit(muted) middle → delta badge + target bottom
- If sparklineData: render 60×20px SVG polyline below value
- Click: optional handler for 3D zone linking
- Glassmorphism card

**3. `components/widgets/DataTable.tsx`** ('use client') — Sortable paginated table:
- Props: `{ columns: ColumnDef[], data: any[], onRowClick?: (row: any) => void, pageSize?: number, searchable?: boolean, title?: string, className?: string }`
- ColumnDef: `{ key: string, label: string, sortable?: boolean, type?: 'text' | 'number' | 'date' | 'badge' | 'mini-gauge', width?: string, align?: 'left' | 'center' | 'right', render?: (value: any, row: any) => React.ReactNode }`
- Features: header click sort (asc/desc with arrow), search input (filters all text columns), pagination (prev/next + "1-10 de 45"), row hover, row click, custom render function per column
- 'badge' type: renders colored pill. 'mini-gauge' type: renders inline horizontal bar.
- Glassmorphism table, alternating subtle row backgrounds, sticky header
- Responsive: horizontal scroll on small screens

**4. `components/widgets/TrendSparkline.tsx`** ('use client') — Mini inline chart:
- Props: `{ data: number[], width?: number, height?: number, color?: string, showArea?: boolean, className?: string }`
- SVG polyline, optional gradient fill below, no axes/labels

**5. `components/widgets/AlertBanner.tsx`** ('use client') — Operational alert:
- Props: `{ type: 'critical' | 'warning' | 'info', title: string, description?: string, action?: string, onAction?: () => void, onDismiss?: () => void }`
- Full-width, colored left border (4px), icon, text, buttons
- Slide-down animation on mount

**6. `components/widgets/MiniGauge.tsx`** ('use client') — Inline bar for table cells:
- Props: `{ value: number, max: number, color?: string, showValue?: boolean }`
- Horizontal 50×8px bar, rounded, background gray, fill colored

**7. `components/widgets/VarietySelector.tsx`** ('use client') — Crop filter pills:
- Props: `{ selected: string, onChange: (v: string) => void, options?: string[] }`
- Default options: ['Todos', 'Arándano', 'Uva', 'Palta', 'Mango', 'Cítricos']
- Each pill colored by variety: Arándano=#6B21A8, Uva=#2D6B30, Palta=#1A5C3A, Mango=#D4A843, Cítricos=#FF8800
- Active: filled background. Inactive: outline only.

**8. `components/widgets/SectionHeader.tsx`** ('use client'):
- Props: `{ title: string, subtitle?: string, icon?: React.ReactNode, action?: React.ReactNode }`
- h2 title + muted subtitle, optional right-aligned action button

**9. `components/widgets/DashboardShell.tsx`** ('use client') — Standard dashboard wrapper:
- Props: `{ children, title, subtitle?, icon?, alerts?: React.ReactNode, className? }`
- Scrollable container with padding, max-width 1400px centered
- Glass overlay background (for rendering over the 3D)
- Responsive grid for children: auto-fill from 1 to 4 columns

**`components/widgets/index.ts`** — Barrel export ALL widgets.

Create `.module.css` for EACH component. ALL colors via CSS custom properties. ALL text labels accept string props (no hardcoded text).

### PART B: Dashboard Routing in page.tsx

**Update `app/page.tsx`** — Add dynamic imports and conditional rendering for dashboard overlays:

```tsx
// Add these dynamic imports (T2, T3, T4 create these components):
const PackingDashboard = dynamic(() => import('@/components/dashboards/PackingDashboard').then(m => ({ default: m.PackingDashboard })), { ssr: false, loading: () => <DashboardLoading /> });
const QualityDashboard = dynamic(() => import('@/components/dashboards/QualityDashboard').then(m => ({ default: m.QualityDashboard })), { ssr: false, loading: () => <DashboardLoading /> });
const ColdChainDashboard = dynamic(() => import('@/components/dashboards/ColdChainDashboard').then(m => ({ default: m.ColdChainDashboard })), { ssr: false, loading: () => <DashboardLoading /> });
```

Create a `DashboardLoading` component (simple "Cargando dashboard..." with spinner).

Add an overlay container that renders the appropriate dashboard based on `activeView` from useUiStore:
- 'comando' → existing DashboardView (already works) + new PackingDashboard section at bottom
- 'calidad' → QualityDashboard
- 'frio' → ColdChainDashboard
- 'operador' → existing OperatorChat (already works)
- 'senales' → existing SignalQueue in RightPanel (already works)
- Any other view → show 3D with no overlay (just the canvas)

The overlay wrapper style:
```css
.dashboardOverlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(10, 14, 20, 0.93);
  overflow-y: auto;
  z-index: 10;
  animation: fadeIn 0.3s ease;
}
```

### PART C: New Types (lib/types.ts — ADD only)

Add these types at the end of the existing file (do NOT remove anything):

```typescript
// === Packing Operations ===
export interface PackingLineStatus {
  id: string;
  linea: string;
  turno: 'dia' | 'noche';
  variedad: string;
  cajasHora: number;
  cajasHoraTarget: number;
  rendimientoPct: number;
  velocidadLinea: number;
  cajasProducidas: number;
  kgEntrada: number;
  kgSalida: number;
  horaInicio: string;
  estado: 'activa' | 'pausa' | 'detenida' | 'mantenimiento';
}

export interface PackingLoteProcess {
  id: string;
  loteId: string;
  variedad: string;
  calibre: string;
  horaEntrada: string;
  horaSalida?: string;
  cajasProducidas: number;
  rendimientoPct: number;
  descartePct: number;
  defectos: string[];
}

// === Quality Control ===
export interface QCInspeccion {
  id: string;
  loteId: string;
  variedad: string;
  fecha: string;
  inspector: string;
  brix: number;
  firmeza: number;
  calibrePromedio: number;
  calibreDistribucion: { rango: string; porcentaje: number }[];
  defectosPct: number;
  defectosTipo: { tipo: string; porcentaje: number }[];
  resultado: 'aprobado' | 'aprobado-condicional' | 'rechazado';
  notas: string;
}

export interface VarietyBenchmark {
  variedad: string;
  brixMin: number;
  brixMax: number;
  brixOptimo: number;
  firmezaMin: number;
  firmezaMax: number;
  firmezaOptimo: number;
  calibreRango: string;
  tempOptima: number;
  tempTolerance: number;
  vidaUtilDias: number;
}

// === Cold Chain ===
export interface CamaraFrioStatus {
  id: string;
  nombre: string;
  tempActual: number;
  setPoint: number;
  deltaTemp: number;
  humedadPct: number;
  palletsActuales: number;
  palletsCapacidad: number;
  horasOperacion: number;
  estado: 'normal' | 'alerta' | 'critico' | 'apagada';
  ultimaLectura: string;
}

export interface ExcursionEvent {
  id: string;
  fecha: string;
  ubicacion: string;
  duracion: string;
  tempMax: number;
  productoAfectado: string;
  impacto: 'leve' | 'moderado' | 'severo';
  accionTomada: string;
}

// === Widget Types ===
export interface ColumnDef {
  key: string;
  label: string;
  sortable?: boolean;
  type?: 'text' | 'number' | 'date' | 'badge' | 'mini-gauge';
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: unknown, row: unknown) => React.ReactNode;
}

export interface GaugeColorZones {
  green: [number, number];
  amber: [number, number];
  red: [number, number];
}
```

### Files you own (ONLY modify these)
- components/widgets/*.tsx + .module.css (ALL NEW — 9 components)
- components/widgets/index.ts (NEW)
- app/page.tsx (UPDATE — add dashboard routing + overlay)
- app/page.module.css (UPDATE — add overlay styles)
- lib/types.ts (ADD new types at end — don't remove anything)

### Files you must NOT touch
- components/layout/Sidebar.tsx (KEEP AS-IS — do NOT restructure tabs)
- components/layout/* (all other layout files)
- components/three/* (working 3D)
- components/panels/* (working Phase 2 panels)
- components/cinematic/* (working)
- lib/stores/* (T2-T4 may update)
- lib/data/* (T2-T4 create new mock data)
- lib/constants.ts (don't change NAV_ITEMS)

### Constraints
- Named exports only. CSS Modules. 'use client' on every hook-using component.
- CircularGauge MUST be SVG (viewBox-based, scales with container)
- DataTable MUST paginate at 10 rows by default
- ALL widget text is via props (no hardcoded Spanish — the dashboards handle that)
- Responsive: widgets reflow from 4→2→1 columns based on container width
- Gauge animation: CSS transition on stroke-dashoffset, 1s ease-out
- Dashboard overlay must have smooth fade-in (0.3s)
- Dashboard overlay has a thin scrollbar styled to match the dark theme

### When done
1. `npx tsc --noEmit` — must pass
2. `npm run build` — must pass (dashboards won't exist yet — use try/catch on dynamic imports or conditional checks)
3. Update COMMS.md: T1-Phase3 ✅ DONE
4. List all widget exports in COMMS.md: CircularGauge, StatCard, DataTable, TrendSparkline, AlertBanner, MiniGauge, VarietySelector, SectionHeader, DashboardShell — all from '@/components/widgets'
