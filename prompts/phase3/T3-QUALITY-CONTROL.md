Read COMMS.md and CLAUDE.md. You are T3 — Quality Control Dashboard owner for Phase 3.

ultrathink

Your job is to build the Quality Control dashboard that renders when the user clicks "Calidad" in the sidebar. This is the view a QC manager uses to answer: "¿Cuál es el Brix del arándano? ¿La firmeza está cayendo? ¿Cuántos lotes rechazamos? ¿Cuál es la distribución de calibre?"

### What to build:

**`components/dashboards/QualityDashboard.tsx`** ('use client')

Use DashboardShell from '@/components/widgets'.

**Top: VarietySelector**
- Default: 'Arándano' (Perú's #1 export berry)
- ALL data below filters by selected variety
- When 'Todos' selected, show aggregate across varieties

**Section 1: Quality Gauges (4 CircularGauges) — dynamic per variety**

For Arándano (default):
1. "Brix Promedio" — value: 13.2, min: 8, max: 20, target: 12.5, green: [11,16], amber: [9,11], red: [8,9], unit: "°Bx"
2. "Firmeza" — value: 185, min: 50, max: 300, target: 170, green: [150,250], amber: [100,150], red: [50,100], unit: "g/mm"
3. "Calibre Promedio" — value: 14.8, min: 8, max: 22, target: 14, green: [12,18], amber: [10,12], red: [8,10], unit: "mm"
4. "Tasa Aprobación" — value: 92.5, min: 0, max: 100, target: 95, green: [90,100], amber: [75,90], red: [0,75], unit: "%"

For Uva: Brix value: 17.1 (range 14-22), Firmeza: 285 g/mm (range 200-400), Calibre: 20.2mm (range 18-26), Aprobación: 94.1%
For Palta: Replace Brix with "Materia Seca" value: 23.8% (target 23%, range 18-30), Firmeza: 72 N (different scale), Calibre: 65mm, Aprobación: 88.5%
For Mango: Brix: 15.8 (range 12-22), Firmeza: 58 g/mm (softer), Calibre: 11.2cm, Aprobación: 82.3%
For Cítricos: Brix: 11.4 (range 9-14), Replace Firmeza with "Acidez" value: 1.2% (range 0.5-2.5), Calibre: 72mm, Aprobación: 91.0%

Store these as a Record<string, GaugeConfig[]> in the mock data file.

**Section 2: Stat Cards (6 cards)**
1. "Lotes Inspeccionados Hoy" — value: "18", delta: "+3 vs ayer", deltaType: 'up'
2. "Aprobados" — value: "15", delta: "83.3%", deltaType: 'up'
3. "Rechazados" — value: "1", delta: "Palta L-1008", deltaType: 'down'
4. "Condicional" — value: "2", delta: "Firmeza límite"
5. "Defectos Promedio" — value: "4.8%", target: "Meta: <5%"
6. "Inspectores Activos" — value: "3", delta: "de 4 programados"

**Section 3: Two Charts Side by Side**

Left: "Distribución de Calibre" — Recharts BarChart
- X: ranges ("8-10", "10-12", "12-14", "14-16", "16-18", "18+")
- Y: percentage
- Bars colored by variety color
- ReferenceArea showing target range in green
- Height: 220px

Right: "Tipos de Defectos" — Recharts horizontal BarChart (or PieChart)
- Blandura 35%, Deshidratación 20%, Daño mecánico 18%, Color 15%, Otros 12%
- Each bar/segment colored differently
- Height: 220px

**Section 4: Trend Charts (2 side by side)**

Left: "Brix — Tendencia 7 días" — Recharts LineChart
- Line colored by variety, ReferenceArea for optimal range
- Height: 200px

Right: "Firmeza — Tendencia 7 días"
- Same structure, different data

**Section 5: Inspections DataTable**
- Title: "Inspecciones QC — Últimas 24 horas"
- Columns: Lote ID, Variedad (badge), Hora, Inspector, Brix (number), Firmeza (number + mini-gauge), Calibre, Defectos % (mini-gauge, inverted), Resultado (badge: aprobado=green, condicional=amber, rechazado=red), Notas
- 12 rows, sortable, searchable
- Click row → highlight lote in 3D

**Section 6: Variety Benchmarks Reference**
- Title: "Parámetros de referencia por variedad"
- Small static table: Variedad | Brix (min–óptimo–max) | Firmeza | Calibre | Temp Óptima | Vida Útil
- 5 rows (one per variety)
- Useful for new inspectors and for demo context

### Mock Data

**`lib/data/mock-quality.ts`**:

Create comprehensive mock data including:
- 12 QCInspeccion records across varieties (8 aprobado, 2 condicional, 1 rechazado, 1 aprobado)
- VarietyBenchmark for all 5 varieties with realistic Peruvian agroexport values
- Gauge values per variety (Record<string, {brix, firmeza, calibre, aprobacion}>)
- Brix trend 7 days (array of {fecha, valor})
- Firmeza trend 7 days
- Calibre distribution (array of {rango, porcentaje})
- Defect distribution (array of {tipo, porcentaje})

ALL values must be realistic for Peruvian export-grade fruit:
- Arándano: Brix 10-16, firmeza 120-280 g/mm, calibre 12-18mm
- Uva Red Globe: Brix 14-22, firmeza 200-400, calibre 18-26mm
- Palta Hass: Dry matter 21-26%, firmeza 60-120N, calibre 60-75mm
- Mango Kent: Brix 12-22, firmeza 40-100, calibre 9-14cm
- Mandarina: Brix 9-14, acidez 0.5-2.5%, calibre 55-80mm

Update `lib/data/index.ts` to add quality exports.

### Files you own
- components/dashboards/QualityDashboard.tsx + .module.css (NEW)
- lib/data/mock-quality.ts (NEW)
- lib/data/index.ts (UPDATE)

### Files you must NOT touch
- components/widgets/* (T1), components/three/*, components/layout/*, components/panels/*
- lib/types.ts (T1 adds types — import only)

### Dependencies
- T1: CircularGauge, StatCard, DataTable, VarietySelector, SectionHeader, DashboardShell, MiniGauge, TrendSparkline
- Recharts: BarChart, LineChart, PieChart, Bar, Line, XAxis, YAxis, Tooltip, ReferenceArea, ReferenceLine, ResponsiveContainer, CartesianGrid, Cell

### Constraints
- ALL Spanish text. Named exports. CSS Modules. 'use client'.
- Variety selector must filter EVERYTHING (gauges, charts, stats, table)
- For Palta: NO Brix gauge — replace with "Materia Seca" (Dry Matter)
- For Cítricos: NO Firmeza gauge — replace with "Acidez"
- Benchmarks must match actual Peruvian export standards (SENASA/APHIS requirements)
- Must answer in <5 seconds: "¿Cómo está la calidad del arándano hoy?" → Gauges show green/amber/red instantly

### When done
1. `npx tsc --noEmit` — must pass
2. `npm run build` — must pass
3. Update COMMS.md: T3-Phase3 ✅ DONE
