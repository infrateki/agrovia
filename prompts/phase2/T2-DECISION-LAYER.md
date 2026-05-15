Read COMMS.md and CLAUDE.md. You are T2 — Decision Intelligence Layer owner for Phase 2.

ultrathink

Your job is to build the panels and components that make every 3D interaction end in a decision. When a user clicks a zone or object, they must see: WHAT is the risk, WHY it happened, WHAT to do about it, and WHO is responsible. The "60 seconds to decision" flow.

This is what converts the 3D wow factor into a product that closes pilots.

### New components to create:

**`components/panels/FichaOperativa.tsx`** ('use client') — THE key component. When a zone or object is selected, this replaces the generic RightPanel content:

Layout (top to bottom):
1. **Header**: Zone/object name (h2), zone icon, risk badge (0-100 score with color)
2. **Risk Summary Card**: "Nivel de riesgo: ALTO" with colored bar (0-100), one-sentence explanation: "Convergencia de temperatura irregular, tránsito largo y patrón histórico de reclamos."
3. **Causa Probable Card**: amber border, lightbulb icon, 2-3 bullet points explaining WHY. Example: "• Excursión de temperatura detectada día 4 (+5.8°C por 2 horas) • Cliente Tesco tiene 5 reclamos en últimas 6 semanas • Variedad arándano sensible a quiebre de frío"
4. **Acción Recomendada Card**: green border, play icon, numbered action steps. Example: "1. Avisar al responsable de cuenta (Carlos M.) 2. Preparar carpeta de defensa con evidencia QC + temperatura 3. Solicitar fotos de llegada al agente en destino 4. Preparar respuesta comercial proactiva"
5. **Responsable**: Avatar circle + name + role. "Carlos Mendoza — Gerente Comercial"
6. **Impacto Económico**: dollar icon, "Exposición: $85,000 USD" with breakdown (valor embarque, probabilidad reclamo, monto estimado)
7. **Acciones rápidas**: 3 buttons: "Generar Brief" (green), "Carpeta Defensa" (amber), "Contactar" (blue)

All data comes from mock — create a `lib/data/mock-fichas.ts` with pre-built ficha data per zone and for the high-risk embarque S-8842.

**`components/panels/FichaOperativa.module.css`** — Glassmorphism cards stacked vertically, scrollable.

**`components/panels/TrazabilidadTimeline.tsx`** ('use client') — Visual timeline of a lote's journey through the pipeline:

- Horizontal timeline with 7 dots (one per zone), connected by lines
- Filled/green dots for completed zones, current zone pulsing, future zones gray
- Below each dot: timestamp and brief status
- Click a dot to jump camera to that zone
- For the selected lote, show which zone it's currently in
- If there was an incident in any zone, that dot is red/amber with a tooltip explaining what happened

This component shows inside FichaOperativa when a specific lote or embarque is selected.

**`components/panels/TemperaturaCurve.tsx`** ('use client') — Recharts LineChart showing temperature over time:
- X axis: timestamps over 7 days
- Y axis: temperature in °C
- Green band showing acceptable range for the variety (e.g., -1°C to +1°C for blueberries)
- Blue line: actual temperature readings from mock-temperaturas
- Red highlighted zone where excursion happened (day 4, +5.8°C)
- Tooltip on hover showing exact value + timestamp
- "Excursión detectada" label at the peak
- Height: 200px, responsive width
- Use ReferenceLine and ReferenceArea from Recharts for the range band

This shows inside FichaOperativa when viewing an embarque or when activeView is 'frio'.

**`components/panels/DataSourceBadge.tsx`** ('use client') — Small badge showing data provenance:
- Props: { source: string, timestamp: string, confidence?: 'high' | 'medium' | 'low' }
- Layout: small icon (Database for real, FlaskConical for mock) + source name + relative time ("hace 2h")
- Confidence dot: green (high), amber (medium), red (low)
- Goes on every KPI card and every data panel to build trust

**`components/panels/CausaAccionCard.tsx`** ('use client') — Reusable card for cause-action pairs:
- Props: { type: 'causa' | 'accion', icon, title, items: string[], borderColor }
- Causa cards have amber left border, lightbulb icon
- Acción cards have green left border, play icon
- Items rendered as numbered/bulleted list

**`components/panels/ImpactoEconomico.tsx`** ('use client') — Economic impact breakdown:
- Props: { valorEmbarque, probabilidadReclamo, montoEstimado, moneda }
- Shows as a mini table: Valor embarque $XXX, Prob. reclamo XX%, Exposición estimada $XXX
- Color-coded by severity

### Updates to existing components:

**`components/panels/RightPanel.tsx`** — UPDATE (you can modify this file):
- When selectedZone is set AND there's a high-risk embarque in that zone: show FichaOperativa
- When selectedZone is set but no specific risk: show zone summary with TrazabilidadTimeline
- When activeView is 'frio': show TemperaturaCurve for the active embarque
- Add DataSourceBadge to every data section

**`components/panels/KpiCards.tsx`** — UPDATE:
- Add DataSourceBadge below each KPI showing "Datos mock · hace 0s" for now
- Add subtle pulse animation to the "bad" variant KPIs to draw attention

**`components/panels/DashboardView.tsx`** — UPDATE:
- Add a "Alerta Prioritaria" banner at the top when there's a high-risk embarque
- Banner shows: risk icon + "S-8842: Arándanos a EE.UU. — Riesgo convergente detectado" + "Ver ficha" button
- Below KPIs, add a new section: "Decisiones Pendientes" showing 3 action items from the fichas

### New mock data:

**`lib/data/mock-fichas.ts`** — Pre-built ficha operativa data:
```typescript
export interface FichaOperativa {
  id: string;
  targetType: 'zone' | 'embarque' | 'lote';
  targetId: string;
  riskScore: number;
  riskLabel: string; // 'BAJO' | 'MEDIO' | 'ALTO' | 'CRÍTICO'
  resumenRiesgo: string;
  causasProbables: string[];
  accionesRecomendadas: string[];
  responsable: { nombre: string; rol: string; avatar?: string };
  impacto: { valorEmbarque: number; probabilidadReclamo: number; montoEstimado: number };
  zona: PipelineZone;
}
```

Create fichas for:
- Embarque S-8842 (CRÍTICO, score 91): the flagship alert about blueberry temperature excursion
- Embarque S-8845 (BAJO, score 22): normal grape shipment
- Each of the 7 zones (general zone-level risk summaries)

**`lib/data/mock-decisiones.ts`** — Pending decisions:
```typescript
export interface DecisionPendiente {
  id: string;
  urgencia: 'alta' | 'media' | 'baja';
  descripcion: string;
  fichaId: string;
  responsable: string;
  deadline: string;
}
```
3-5 pending decisions tied to fichas.

### Update types:

**`lib/types.ts`** — ADD (don't replace existing types, only add):
- FichaOperativa interface
- DecisionPendiente interface
- DataSourceInfo interface: { source: string, timestamp: string, confidence: 'high' | 'medium' | 'low' }

### Files you own
- components/panels/FichaOperativa.tsx + .module.css (NEW)
- components/panels/TrazabilidadTimeline.tsx + .module.css (NEW)
- components/panels/TemperaturaCurve.tsx + .module.css (NEW)
- components/panels/DataSourceBadge.tsx + .module.css (NEW)
- components/panels/CausaAccionCard.tsx + .module.css (NEW)
- components/panels/ImpactoEconomico.tsx + .module.css (NEW)
- components/panels/RightPanel.tsx + .module.css (UPDATE existing)
- components/panels/KpiCards.tsx + .module.css (UPDATE existing)
- components/panels/DashboardView.tsx + .module.css (UPDATE existing)
- lib/data/mock-fichas.ts (NEW)
- lib/data/mock-decisiones.ts (NEW)
- lib/data/index.ts (UPDATE to add new exports)
- lib/types.ts (ADD new interfaces only, don't remove anything)

### Files you must NOT touch
- components/three/* (T1 phase 2 is modifying zones)
- components/layout/* (T4 phase 2)
- app/* (T5 phase 2)
- lib/stores/* (add new store if needed, but don't modify existing)
- lib/constants.ts (don't modify)

### Constraints
- ALL text in Spanish
- Named exports only
- CSS Modules, colors via custom properties
- 'use client' on all components
- Recharts for TemperaturaCurve
- Every data display must have a DataSourceBadge
- FichaOperativa must feel like a professional intelligence brief, not a data dump

### When done
1. `npx tsc --noEmit` — must pass
2. `npm run build` — must pass
3. Update COMMS.md: mark T2-Phase2 as ✅ DONE
