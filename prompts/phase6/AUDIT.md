# Phase 6 Audit — Data Architecture Inventory

**Date:** 2026-05-15
**Author:** T2
**Purpose:** Working artifact that drove the `lib/architecture/schema-map.ts` registry. Every node in `ARCH_NODES` traces back to a line in this file.

---

## 1. Foundation — TypeScript types & entities

### Type unions (lib/types.ts)
- `PipelineZone` — `'cosecha' | 'seleccion' | 'packing' | 'frio' | 'embarque' | 'transito' | 'llegada'`
- `ViewMode` — `'pipeline' | 'zone' | 'object'`
- `DataFlowType` — trazabilidad/temperatura/documentos/senales/reclamos
- `BadgeVariant` — good/warn/bad/info
- `SignalSource` — internal/market/client/regulatory
- `ClaimStatus` — open/investigating/resolved/closed
- `DefenseItemStatus` — ready/draft/missing
- `NavViewId` — comando/operador/cuentas/calidad/frio/radar/social/sim/grafo/config (**10 — DATA GRID & SCHEMA missing**)
- `Variedad` — arandano/uva/palta/mango/citricos
- `EmbarqueStatus` — en-camara/cargado/en-transito/en-puerto/entregado
- `ClienteSegmento` — premium/standard/emergente
- `ReclamoTipo` — calidad/temperatura/calibre/documentacion/demora
- `SenalTipo` — riesgo/mercado/calidad/regulatorio
- `RiskLevel` — BAJO/MEDIO/ALTO/CRÍTICO
- `FichaTargetType`, `DecisionUrgencia`, `DataConfidence`

### Ontology types (lib/ontology/schema.ts)
- `NodeKind` (12): Customer, Shipment, Lot, Product, Container, Sensor, TempEvent, Claim, AccountManager, Route, Port, Document
- `EdgeKind` (14): RECEIVES, CONTAINS, OF_PRODUCT, USES, MONITORED_BY, GENERATED, TRIGGERED, FILED_BY, ABOUT, MANAGES, FOLLOWS, ORIGIN, DESTINATION, ATTACHED
- Metadata: `NODE_META`, `EDGE_META`, `getNodeAccent`, `getNodeIcon`, `getNodeLabelES`, `getNodeDiameter`

### Domain entity interfaces (lib/types.ts)
| Interface | Status in code | Backing mock | Maps to ontology kind |
|---|---|---|---|
| `Lote` | full TS interface | mock-lotes | `Lot` |
| `Embarque` | full TS interface | mock-embarques | `Shipment` |
| `Cliente` | full TS interface | mock-clientes | `Customer` |
| `Reclamo` | full TS interface | mock-reclamos | `Claim` |
| `Temperatura` | full TS interface | mock-temperaturas | `TempEvent` (partial) |
| `Senal` | full TS interface | mock-senales | — (not in ontology) |
| `KpiData` | UI shape | mock-kpis | — |
| `ChatMessage` | UI shape | mock-chat | — |
| `FichaOperativa` + `DecisionPendiente` | Phase 2 | mock-fichas, mock-decisiones | — |
| `PackingLineStatus`, `PackingLoteProcess` | Phase 3 | mock-packing | — |
| `QCInspeccion`, `VarietyBenchmark` | Phase 3 | mock-quality | — |
| `CamaraFrioStatus`, `ExcursionEvent` | Phase 3 | mock-coldchain | — |
| `ColumnDef`, `GaugeColorZones` | widget DTOs | n/a | — |
| `Product` | **no TS interface**, graph-only | mock-graph (products) | `Product` |
| `Container` | **no TS interface**, graph-only | mock-graph (containers) | `Container` |
| `Sensor` | **no TS interface**, graph-only | mock-graph (sensors) | `Sensor` |
| `AccountManager` | **no TS interface**, graph-only | mock-graph (accountManagers) | `AccountManager` |
| `Route` | **no TS interface**, graph-only | mock-graph (routes) | `Route` |
| `Port` | **no TS interface**, graph-only | mock-graph (ports) | `Port` |
| `Document` | **no TS interface**, graph-only | mock-graph (documents) | `Document` |

**Gap:** 7 of the 12 ontology kinds have no proper TS interface — they only exist as `GraphNodeData.meta` records. Storage phase needs to formalize.

---

## 2. Sources — `lib/data/*.ts`

| File | Status | Purpose |
|---|---|---|
| `mock-lotes.ts` | mock/implemented | Cosecha lot fixtures |
| `mock-embarques.ts` | mock/implemented | Shipment fixtures |
| `mock-clientes.ts` | mock/implemented | Customer fixtures |
| `mock-reclamos.ts` | mock/implemented | Claim fixtures |
| `mock-temperaturas.ts` | mock/implemented | Temperature reading fixtures |
| `mock-senales.ts` | mock/implemented | Radar signal fixtures |
| `mock-kpis.ts` | mock/implemented | KPI cards |
| `mock-chat.ts` | mock/implemented | Operator chat seed |
| `mock-defense.ts` | mock/implemented | Claim defense checklist |
| `mock-fichas.ts` | mock/implemented | Phase-2 decision fichas |
| `mock-decisiones.ts` | mock/implemented | Phase-2 pending decisions |
| `mock-packing.ts` | mock/implemented | Phase-3 packing ops |
| `mock-quality.ts` | mock/implemented | Phase-3 QC inspections + benchmarks |
| `mock-coldchain.ts` | mock/implemented | Phase-3 cold-chain cámaras + excursions |
| `mock-graph.ts` | mock/implemented | Phase-5 ontology + instance graph (35 nodes, ~50 edges) |

**External / planned (per phase brief):**
- Nisira ERP REST (planned, Phase 9)
- Reefer logger webhooks (planned, Phase 8)
- CRM postventa (planned, Phase 9)
- Portal reclamos cliente (planned, Phase 9)
- AIS shipping tracker / MarineTraffic (needed, Phase 8)
- Weather API / OpenWeather (needed, Phase 8)

---

## 3. Integration — none implemented today

- ETL pipeline (needed, Phase 9)
- Webhook receiver (planned, Phase 8)
- GraphRAG indexer (mock — dressed in Habita context per the "GraphRAG · ERP Nisira (mock)" pill — owner Phase 9)
- MCP server for agent read access (planned, Phase 10)
- Operator stream handler (implemented — `lib/operator/stream-handler.ts`; this is the only integration component in code today)

---

## 4. Storage — none implemented today

- Supabase Postgres — entities (planned, Phase 7)
- TimescaleDB extension — sensor streams (planned, Phase 8)
- Vercel Blob — documents (planned, Phase 7)
- Neo4j Aura — actual ontology graph backing GRAFO (planned, Phase 9)

---

## 5. API — `app/api/**/route.ts`

| Route | Method(s) | Status | Notes |
|---|---|---|---|
| `/api/health` | GET | implemented | Health-check |
| `/api/chat` | POST | implemented | SSE streaming, Claude operator |
| `/api/export` | GET/POST | implemented | HTML/PDF export |
| `/api/import` | — | **NOT a route** — `app/import/page.tsx` is a Next.js page (CSV import UI), not an API route. Sources route through `lib/import/csv-parser.ts`. |
| Entity CRUD endpoints | — | needed, Phase 7 |
| Sensor stream ingestion endpoint | — | needed, Phase 8 |
| ERP sync endpoints | — | planned, Phase 9 |

---

## 6. Views — `components/dashboards/*.tsx` + panels routed in `app/page.tsx`

Current ViewRouter switch wires 10 of the 12 tabs the phase prompt expects. Adding two:

| ActiveView | Component | Status | Phase |
|---|---|---|---|
| `comando` | `DashboardView` + `PackingDashboard` stacked | implemented | 2/3 |
| `operador` | `OperatorChat` | implemented | 2 |
| `cuentas` | `EmptyView` placeholder | partial | — |
| `calidad` | `QualityDashboard` | implemented | 3 |
| `frio` | `ColdChainDashboard` | implemented | 3 |
| `radar` | `SignalQueue` | implemented | 1 |
| `social` | `EmptyView` placeholder | partial | — |
| `sim` | `OperationsSimView` | implemented | 5 |
| `grafo` | `GraphIntelligenceView` (force-directed) | implemented | 5 |
| `config` | `ConfigToggles` | implemented | 1 |
| **`data-grid`** | new in this phase — dagre LR view of the ontology | new, this phase | 6 |
| **`schema`** | new in this phase — `SchemaView` | new, this phase | 6 |

**Discrepancy flagged & resolved per user decision:** Phase prompt assumed DATA GRID was already shipped in Phase 5.1; audit shows it was not. Building it in this phase alongside SCHEMA.

---

## 7. BI — none implemented

- Power BI dataset (planned, Phase 10)
- Customer portal with embedded dashboards (planned, Phase 10)
- Looker Studio / Metabase secondary (planned, Phase 10)
- Agent-readable MCP for analytics (planned, Phase 10)

---

## 8. Summary count

| Layer | Implemented | Mock | Partial | Planned | Needed | Total |
|---|---:|---:|---:|---:|---:|---:|
| foundation | 2 type-bundles + 12 entities = 14 (all coded; status "mock" because populated from mocks) | 14 | 0 | 0 | 0 | 14 |
| sources | — | 15 | 0 | 4 | 2 | 21 |
| integration | 1 (operator stream) | 1 | 0 | 2 | 1 | 5 |
| storage | 0 | 0 | 0 | 4 | 0 | 4 |
| api | 3 | 0 | 0 | 1 | 2 | 6 |
| views | 9 | 0 | 2 | 1 (data-grid this phase) | 0 | 12 |
| bi | 0 | 0 | 0 | 4 | 0 | 4 |
| **Total** | — | — | — | — | — | **66** |

Foundation entries count as "mock" status per phase brief ("defined in TS, populated from mocks").

---

## 9. Notes & gaps

- **English vs Spanish entity names:** ontology uses English (`Shipment`, `Lot`, `Customer`...), domain interfaces use Spanish (`Embarque`, `Lote`, `Cliente`...). Registry uses the English ontology names since the prompt explicitly names them and they are the canonical kinds for the graph. `filePath` on each foundation node points to both files where relevant.
- **`/api/import` does not exist** — the prompt assumed it did. CSV import is a client-side page (`app/import/page.tsx`) using `lib/import/csv-parser.ts`. Registered as a single "import-csv" api node (status: implemented) pointing at the page, not as a `/api/import` REST route.
- **`Status` enum** referenced in the prompt's foundation list doesn't exist as a single union — there are several status-style unions (`EmbarqueStatus`, `ClaimStatus`, `DefenseItemStatus`). Registered as one `status-enums` foundation node bundling them.
- **`/import` page** (CSV UI) is registered under `api` layer for parity with the prompt's mental model, even though it's a Next.js page, since it's a data ingress point.
