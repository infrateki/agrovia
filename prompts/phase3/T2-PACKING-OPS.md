Read COMMS.md and CLAUDE.md. You are T2 — Packing Operations Dashboard owner for Phase 3.

ultrathink

Your job is to build the Packing Operations dashboard that renders when the user clicks "Centro de Comando" in the sidebar. This ENHANCES the existing Centro de Comando view by adding hard operational data below the existing KPIs. A packing house manager opens this at 6am to answer: "¿Cuántas cajas salieron? ¿A qué velocidad? ¿Cuál es el rendimiento? ¿Alguna línea parada?"

### What to build:

**`components/dashboards/PackingDashboard.tsx`** ('use client')

This component renders inside the "Centro de Comando" overlay, BELOW the existing DashboardView content. T1's page.tsx will import and render it.

Use DashboardShell from '@/components/widgets' as the wrapper.

**Section 1: Packing Gauges Row (4 CircularGauges)**

```
1. "Cajas / Hora"
   value: 487, min: 0, max: 800, target: 500
   colorZones: { green: [400, 650], amber: [200, 400], red: [0, 200] }
   unit: "cajas/h", size: 'lg'

2. "Rendimiento"
   value: 87.3, min: 0, max: 100, target: 90
   colorZones: { green: [85, 100], amber: [70, 85], red: [0, 70] }
   unit: "%", size: 'lg'

3. "Velocidad de Línea"
   value: 12.5, min: 0, max: 20, target: 14
   colorZones: { green: [10, 16], amber: [6, 10], red: [0, 6] }
   unit: "m/min", size: 'lg'

4. "Descarte"
   value: 8.2, min: 0, max: 30, target: 5
   colorZones: { green: [0, 8], amber: [8, 15], red: [15, 30] }
   invertZones: true  // low is good for descarte
   unit: "%", size: 'lg'
```

Display these 4 gauges in a responsive row (4 across on desktop, 2x2 on tablet, 1 column on mobile).

**Section 2: Quick Stats Row (6 StatCards)**

```
1. label: "Cajas Hoy", value: "3,847", delta: "+12%", deltaType: 'up', target: "Meta: 4,200"
   sparklineData: [280, 380, 465, 520, 510, 487, 495, 490] (hourly)

2. label: "Kg Procesados", value: "12,450", unit: "kg", delta: "+8% vs ayer", deltaType: 'up'

3. label: "Kg Empacados", value: "10,840", unit: "kg", delta: "Merma: 12.9%"

4. label: "Líneas Activas", value: "3 de 4", delta: "1 detenida", deltaType: 'down'

5. label: "Turno Actual", value: "Día", delta: "06:00 — 18:00"

6. label: "Eficiencia Turno", value: "91.5%", target: "Meta: 95%", delta: "+2.3%", deltaType: 'up'
   sparklineData: [85, 87, 89, 90, 91, 91.5] (last 6 shifts)
```

**Section 3: Production Trend Chart**

SectionHeader: "Producción por hora — Hoy" with BarChart icon

Recharts BarChart:
- X axis: hours from "06:00" to current (~"14:00"), 8-10 bars
- Y axis: cajas count
- Each bar colored: green if >= target (500), amber if 80-99% of target, red if < 80%
- ReferenceLine at target=500, dashed, labeled "Meta"
- Tooltip showing exact count per hour
- ResponsiveContainer height 250px
- Below chart: text "Ayer mismo horario: 3,200 cajas (+20.2%)" in muted text

Mock data for chart:
```typescript
const HOURLY_DATA = [
  { hora: '06:00', cajas: 380 }, { hora: '07:00', cajas: 465 },
  { hora: '08:00', cajas: 520 }, { hora: '09:00', cajas: 510 },
  { hora: '10:00', cajas: 487 }, { hora: '11:00', cajas: 495 },
  { hora: '12:00', cajas: 478 }, { hora: '13:00', cajas: 512 },
];
```

**Section 4: Lines Status Table**

SectionHeader: "Estado de líneas de packing"

DataTable:
- Columns: Línea, Turno (badge), Variedad, Cajas/h (+ mini-gauge vs target), Rendimiento % (+ mini-gauge), Velocidad m/min, Estado (badge: activa=green, pausa=amber, detenida=red, mantenimiento=gray), Hora Inicio
- 4 rows of data
- Row with estado='detenida' highlighted with subtle red left border

**Section 5: Lotes in Process Table**

SectionHeader: "Lotes en proceso" with count badge

DataTable:
- Columns: Lote ID (bold, clickable), Variedad (badge colored by variety), Calibre, Hora Entrada, Cajas Producidas, Rendimiento % (mini-gauge), Descarte % (mini-gauge, inverted color), Defectos
- 8 rows
- Click lote → dispatch useSelectionStore.setSelectedObjectId → opens RightPanel

**Alert banner at top (if any line stopped):**
AlertBanner type='warning': "⚠️ Línea 2 detenida desde 09:45 — Motivo: cambio de variedad (uva → arándano). Tiempo estimado: 25 min."

### Mock Data File

**`lib/data/mock-packing.ts`** — All packing operational mock data:

```typescript
import type { PackingLineStatus, PackingLoteProcess } from '@/lib/types';

export const MOCK_PACKING_LINES: PackingLineStatus[] = [
  {
    id: 'PL-01', linea: 'Línea 1', turno: 'dia', variedad: 'Arándano',
    cajasHora: 520, cajasHoraTarget: 500, rendimientoPct: 91.2,
    velocidadLinea: 14.2, cajasProducidas: 2340, kgEntrada: 7800, kgSalida: 7120,
    horaInicio: '06:00', estado: 'activa'
  },
  {
    id: 'PL-02', linea: 'Línea 2', turno: 'dia', variedad: 'Uva',
    cajasHora: 0, cajasHoraTarget: 450, rendimientoPct: 0,
    velocidadLinea: 0, cajasProducidas: 890, kgEntrada: 3200, kgSalida: 2780,
    horaInicio: '06:00', estado: 'detenida'
  },
  {
    id: 'PL-03', linea: 'Línea 3', turno: 'dia', variedad: 'Arándano',
    cajasHora: 487, cajasHoraTarget: 500, rendimientoPct: 87.3,
    velocidadLinea: 12.5, cajasProducidas: 1517, kgEntrada: 4650, kgSalida: 3940,
    horaInicio: '08:00', estado: 'activa'
  },
  {
    id: 'PL-04', linea: 'Línea 4', turno: 'dia', variedad: 'Palta',
    cajasHora: 310, cajasHoraTarget: 350, rendimientoPct: 82.5,
    velocidadLinea: 8.3, cajasProducidas: 1100, kgEntrada: 5200, kgSalida: 4290,
    horaInicio: '07:00', estado: 'activa'
  },
];

export const MOCK_PACKING_LOTES: PackingLoteProcess[] = [
  { id: 'PP-01', loteId: 'L-1001', variedad: 'Arándano', calibre: '12-14mm', horaEntrada: '06:15', horaSalida: '08:30', cajasProducidas: 420, rendimientoPct: 92.1, descartePct: 5.2, defectos: ['Blandura 2.1%', 'Color 1.8%'] },
  { id: 'PP-02', loteId: 'L-1002', variedad: 'Arándano', calibre: '14-16mm', horaEntrada: '06:30', cajasProducidas: 380, rendimientoPct: 88.5, descartePct: 7.8, defectos: ['Deshidratación 3.2%', 'Calibre bajo 2.1%'] },
  { id: 'PP-03', loteId: 'L-1005', variedad: 'Uva', calibre: '18-20mm', horaEntrada: '07:00', horaSalida: '09:15', cajasProducidas: 560, rendimientoPct: 90.3, descartePct: 6.4, defectos: ['Desgrane 3.8%'] },
  { id: 'PP-04', loteId: 'L-1008', variedad: 'Palta', calibre: 'Cal. 14', horaEntrada: '07:30', cajasProducidas: 290, rendimientoPct: 82.5, descartePct: 11.2, defectos: ['Golpe 5.1%', 'Madurez 3.4%'] },
  { id: 'PP-05', loteId: 'L-1003', variedad: 'Arándano', calibre: '12-14mm', horaEntrada: '08:45', cajasProducidas: 195, rendimientoPct: 89.7, descartePct: 6.1, defectos: ['Blandura 2.8%'] },
  { id: 'PP-06', loteId: 'L-1010', variedad: 'Mango', calibre: '9-10cm', horaEntrada: '09:00', cajasProducidas: 145, rendimientoPct: 78.2, descartePct: 14.5, defectos: ['Madurez 8.2%', 'Mancha 3.1%'] },
  { id: 'PP-07', loteId: 'L-1012', variedad: 'Arándano', calibre: '14-16mm', horaEntrada: '10:00', cajasProducidas: 87, rendimientoPct: 91.0, descartePct: 4.8, defectos: ['Color 2.3%'] },
  { id: 'PP-08', loteId: 'L-1015', variedad: 'Uva', calibre: '20-22mm', horaEntrada: '10:30', cajasProducidas: 42, rendimientoPct: 85.6, descartePct: 9.1, defectos: ['Desgrane 4.2%', 'Calibre bajo 2.5%'] },
];

export const MOCK_HOURLY_PRODUCTION = [
  { hora: '06:00', cajas: 380, target: 500 },
  { hora: '07:00', cajas: 465, target: 500 },
  { hora: '08:00', cajas: 520, target: 500 },
  { hora: '09:00', cajas: 510, target: 500 },
  { hora: '10:00', cajas: 487, target: 500 },
  { hora: '11:00', cajas: 495, target: 500 },
  { hora: '12:00', cajas: 478, target: 500 },
  { hora: '13:00', cajas: 512, target: 500 },
];
```

Update `lib/data/index.ts` to add: `export * from './mock-packing';`

### Files you own
- components/dashboards/PackingDashboard.tsx + .module.css (NEW)
- lib/data/mock-packing.ts (NEW)
- lib/data/index.ts (UPDATE — add packing exports)

### Files you must NOT touch
- components/widgets/* (T1 — import only)
- components/three/*, components/layout/*, components/panels/*, components/cinematic/*
- lib/types.ts (T1 adds types — import only)
- lib/stores/* (import only)
- app/page.tsx (T1 handles routing)

### Dependencies
- T1 must finish first: import { CircularGauge, StatCard, DataTable, AlertBanner, SectionHeader, DashboardShell, MiniGauge, TrendSparkline } from '@/components/widgets'
- Recharts: BarChart, Bar, XAxis, YAxis, Tooltip, ReferenceLine, ResponsiveContainer, CartesianGrid

### Constraints
- ALL text labels in Spanish
- Named exports only. CSS Modules. 'use client'.
- Numbers must feel REAL: a packing house manager should look at "487 cajas/hora" and think "that's about right for our Línea 3"
- The dashboard must answer in < 5 seconds:
  1. ¿Cuántas cajas hoy? → StatCard "3,847"
  2. ¿Vamos bien? → Gauges (green = sí, red = no)
  3. ¿Alguna línea parada? → AlertBanner + table row in red
  4. ¿Cuál es el rendimiento? → Gauge "87.3%"
  5. ¿Cómo vamos vs ayer? → Chart + delta "+12%"

### When done
1. `npx tsc --noEmit` — must pass
2. `npm run build` — must pass
3. Update COMMS.md: T2-Phase3 ✅ DONE
