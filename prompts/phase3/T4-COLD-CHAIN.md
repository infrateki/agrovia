Read COMMS.md and CLAUDE.md. You are T4 — Cold Chain Dashboard owner for Phase 3.

ultrathink

Your job is to build the Cold Chain dashboard that renders when the user clicks "Cadena de Frío" in the sidebar. This is the view a cold chain manager uses to answer: "¿Alguna cámara fuera de rango? ¿Cuál es el delta del set point? ¿Hay excursiones en tránsito? ¿Cuántas horas de pre-cooling lleva?"

### What to build:

**`components/dashboards/ColdChainDashboard.tsx`** ('use client')

Use DashboardShell from '@/components/widgets'.

**Alert Banner (top, conditional):**
AlertBanner type='critical': "⚠️ Excursión activa: Contenedor MSCU-7842190 (S-8842) — Temp: +5.8°C durante 2h — Arándano exportación EE.UU."
Only show when there's an active excursion (mock: always show for S-8842).

**Section 1: Cold Chain Gauges (4 CircularGauges)**
1. "Cámaras Operativas" — value: 5, min: 0, max: 6, green: [5,6], amber: [3,5], red: [0,3], unit: "de 6"
2. "Temp Promedio" — value: 0.3, min: -5, max: 15, green: [-2,2], amber: [2,5], red: [5,15], unit: "°C"
3. "Adherencia Set Point" — value: 94.5, min: 0, max: 100, target: 98, green: [95,100], amber: [85,95], red: [0,85], unit: "%"
4. "Excursiones (7d)" — value: 3, min: 0, max: 20, green: [0,2], amber: [2,5], red: [5,20], unit: "eventos", invertZones: true

**Section 2: Stat Cards (6 cards)**
1. "Contenedores en Tránsito" — value: "12", delta: "2 con alerta", deltaType: 'down'
2. "Pre-Cooling Activo" — value: "3 lotes", delta: "Est. 4h restantes"
3. "Hrs Promedio en Cámara" — value: "18.5h", target: "Óptimo: 24h"
4. "Humedad Promedio" — value: "92%", target: "Rango: 90-95%"
5. "Pallets en Frío" — value: "142 de 180", delta: "79% capacidad"
6. "Próximo Despacho" — value: "14:30", delta: "MSCU-7842190"

**Section 3: HERO CHART — Temperature Monitor 24h**

SectionHeader: "Monitoreo de temperatura — Últimas 24 horas" with Thermometer icon

This is THE most important visualization in this dashboard. Recharts LineChart:
- X axis: timestamps every 30 min for 24 hours (48 data points)
- Y axis: temperature °C (range -3 to 15)
- 6 lines, one per cámara, each a different color:
  - Cámara 1 (Arándano): #6B21A8 (purple)
  - Cámara 2 (Arándano): #8B5CF6
  - Cámara 3 (Uva): #2D6B30 (green)
  - Cámara 4 (Palta): #D4A843 (gold) — this one drifts upward
  - Cámara 5 (Mango): #FF8800 (orange)
  - Cámara 6 (Pre-Cool): #4488FF (blue)
- Green ReferenceArea band from -1°C to +1°C (normal range for berries)
- Red ReferenceLine at +4°C (critical threshold)
- Tooltip: shows all 6 chamber temps at hovered timestamp
- Legend at bottom with chamber names and colors
- ResponsiveContainer height: 320px (bigger than other charts — this is the hero)

Mock data: Cámara 4 (palta) should gradually drift from 5.5°C to 6.8°C over the last 4 hours, showing the alert condition developing in real-time.

**Section 4: Cámaras Status DataTable**

SectionHeader: "Estado de cámaras de frío"

DataTable columns:
- Cámara (text), Producto (badge by variety color), Set Point °C (number), Temp Actual °C (number — render with color: green if delta < 0.5, amber if 0.5-1.0, red if >1.0), Delta °C (text, e.g. "+0.2°C" colored green/amber/red), Humedad % (mini-gauge, target 90-95), Pallets (text: "28/30" + mini-gauge), Horas Op (number), Estado (badge: normal=green, alerta=amber, crítico=red, apagada=gray), Última Lectura (time)

6 rows:
```
CF-01 | Arándano  | 0.0°C | 0.2°C  | +0.2°C ✅ | 93% | 28/30 | 18.5h | normal | 11:45
CF-02 | Arándano  | 0.0°C | 0.5°C  | +0.5°C ✅ | 91% | 24/30 | 12.0h | normal | 11:45
CF-03 | Uva       | -1.0°C| -0.8°C | +0.2°C ✅ | 94% | 30/30 | 24.0h | normal | 11:45
CF-04 | Palta     | 5.5°C | 6.8°C  | +1.3°C ⚠️ | 88% | 22/30 | 8.0h  | alerta | 11:42
CF-05 | Mango     | 10.0°C| 10.2°C | +0.2°C ✅ | 90% | 18/24 | 6.0h  | normal | 11:45
CF-06 | Pre-Cool  | 0.0°C | 2.1°C  | +2.1°C ⚠️ | 95% | 12/24 | 3.5h  | normal | 11:45
```

Click row → camera flies to ZoneFrio in 3D.

**Section 5: Embarques en Tránsito Monitor**

SectionHeader: "Contenedores en tránsito — Monitoreo de frío" with Ship icon

DataTable columns:
- Embarque (bold), Contenedor, Destino, Set Point °C, Temp Actual °C (colored), Delta °C, Días Tránsito, ETA, Alertas (count badge), Estado (badge)

8 rows from mock embarques. S-8842 highlighted with red left border and alertas badge "1".

Click row → camera to ZoneTransito.

**Section 6: Excursion History**

SectionHeader: "Historial de excursiones — Últimos 7 días" with AlertTriangle icon

DataTable columns:
- Fecha, Ubicación, Duración, Temp Máxima (red text), Producto, Impacto (badge: leve=blue, moderado=amber, severo=red), Acción Tomada

5 rows, most recent first. S-8842 excursion is row 1, marked 'severo'.

### Mock Data

**`lib/data/mock-coldchain.ts`**:

```typescript
import type { CamaraFrioStatus, ExcursionEvent } from '@/lib/types';

export const MOCK_CAMARAS: CamaraFrioStatus[] = [ /* 6 chambers as specified above */ ];

export const MOCK_TEMP_24H: { timestamp: string; cf01: number; cf02: number; cf03: number; cf04: number; cf05: number; cf06: number }[] = [
  // 48 entries (every 30 min for 24h)
  // Generate realistic data:
  // CF-01/02: stable around 0.0-0.5°C with ±0.3 noise
  // CF-03: stable around -0.8°C
  // CF-04: starts at 5.5°C, stable for 20h, then DRIFTS up to 6.8°C in last 4h
  // CF-05: stable around 10.0-10.3°C
  // CF-06: dropping from 15°C (ambient) toward 0°C over the last 3.5h (pre-cooling curve)
];

export const MOCK_EMBARQUE_TEMP_MONITOR = [
  // 8 embarques matching existing data, with current temp readings
  // S-8842: tempActual: 1.2 (post-excursion drift), alertas: ['Excursión +5.8°C día 4']
];

export const MOCK_EXCURSION_HISTORY: ExcursionEvent[] = [
  { id: 'EX-01', fecha: '2026-05-14 09:30', ubicacion: 'Contenedor MSCU-7842190 (S-8842)', duracion: '2h 15min', tempMax: 5.8, productoAfectado: 'Arándano — EE.UU.', impacto: 'severo', accionTomada: 'Carpeta de defensa en preparación' },
  { id: 'EX-02', fecha: '2026-05-13 14:20', ubicacion: 'Cámara 4 — Palta', duracion: '45min', tempMax: 7.2, productoAfectado: 'Palta Hass — Francia', impacto: 'moderado', accionTomada: 'Sensor recalibrado, técnico notificado' },
  { id: 'EX-03', fecha: '2026-05-11 03:15', ubicacion: 'Cámara 6 — Pre-Cool', duracion: '1h 30min', tempMax: 4.1, productoAfectado: 'Arándano — Japón', impacto: 'leve', accionTomada: 'Compresor reiniciado automáticamente' },
  { id: 'EX-04', fecha: '2026-05-09 22:45', ubicacion: 'Contenedor HLXU-3391028', duracion: '30min', tempMax: 3.2, productoAfectado: 'Uva — UK', impacto: 'leve', accionTomada: 'Ventilación ajustada por naviera' },
  { id: 'EX-05', fecha: '2026-05-07 11:00', ubicacion: 'Cámara 2 — Arándano', duracion: '20min', tempMax: 2.8, productoAfectado: 'Arándano — EE.UU.', impacto: 'leve', accionTomada: 'Puerta dejada abierta, protocolo reforzado' },
];
```

IMPORTANT: Generate the full 48-entry temperature array. Each entry should have realistic values with small random noise. For CF-04 (palta), the drift should be clearly visible — going from 5.5 at the start to 6.8 at the end, with a steeper rise in the last 4 hours.

Update `lib/data/index.ts` to add coldchain exports.

### Files you own
- components/dashboards/ColdChainDashboard.tsx + .module.css (NEW)
- lib/data/mock-coldchain.ts (NEW)
- lib/data/index.ts (UPDATE)

### Files you must NOT touch
- components/widgets/* (T1), components/three/*, components/layout/*, components/panels/*
- lib/types.ts (T1 — import only)

### Dependencies
- T1: CircularGauge, StatCard, DataTable, AlertBanner, SectionHeader, DashboardShell, MiniGauge
- Recharts: LineChart, Line, XAxis, YAxis, Tooltip, Legend, ReferenceArea, ReferenceLine, ResponsiveContainer, CartesianGrid

### Constraints
- ALL Spanish. Named exports. CSS Modules. 'use client'.
- The 24h temperature chart is THE hero — make it beautiful. Multiple colored lines, green band, red threshold.
- Delta column rendering: green text for <0.5°C, amber for 0.5-1.0°C, red bold for >1.0°C
- Chamber 4 drift must be VISIBLE on the chart (gradually rising line)
- Must answer in <5 seconds: "¿Alguna cámara con problema?" → Gauge shows 5/6 + CF-04 row in amber

### When done
1. `npx tsc --noEmit` — must pass
2. `npm run build` — must pass
3. Update COMMS.md: T4-Phase3 ✅ DONE
