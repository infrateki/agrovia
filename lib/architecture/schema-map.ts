// =============================================================================
//  Architecture registry — single source of truth for the data architecture.
//  Every TS interface, mock file, API route, view, storage target, and BI
//  integration is registered here. The SCHEMA tab is a read-only visualization
//  of this file. New entities/sources/endpoints/storages/BI integrations MUST
//  be added here in the same commit they're introduced (see CLAUDE.md).
//
//  See prompts/phase6/AUDIT.md for the inventory work that produced this file.
// =============================================================================

export type Layer =
  | 'foundation' //  TS types, enums, schema constants
  | 'sources' //     where data originates (mocks, sensors, ERP, CRM, APIs)
  | 'integration' // ETL, webhooks, indexers, agents
  | 'storage' //     DBs, object storage, graph DB
  | 'api' //         REST/GraphQL endpoints, MCP servers
  | 'views' //       the app tabs
  | 'bi'; //         Power BI, customer portal, embedded dashboards

export type Status =
  | 'implemented' // Live and working
  | 'partial' //    Some functionality, gaps known
  | 'mock' //       Hardcoded mock data only
  | 'planned' //    Designed, not built
  | 'needed'; //    Identified gap, no design yet

export type FieldSource =
  | 'manual'
  | 'mock'
  | 'erp'
  | 'sensor'
  | 'crm'
  | 'computed'
  | 'external';

export interface SchemaField {
  name: string;
  type: string; // TS type as a display string
  required: boolean;
  source: FieldSource;
  notes?: string;
}

export interface ArchNode {
  id: string; //          slug, unique across the registry
  layer: Layer;
  label: string;
  description: string; // one-line, shown on hover/in cards
  status: Status;
  tech?: string; //       'TypeScript' | 'Supabase' | 'Power BI' | etc.
  filePath?: string; //   repo path if implemented
  consumes?: string[]; // ids this depends on
  exposes?: string[]; //  ids this provides for
  fields?: SchemaField[]; // when this represents a data entity
  nextStep?: string; //   one-line on what advances the status
  ownerPhase?: number; // which phase builds this (6, 7, 8, 9, 10)
}

export const LAYER_LABELS: Record<Layer, string> = {
  foundation: 'Fundamentos',
  sources: 'Fuentes',
  integration: 'Integración',
  storage: 'Almacenamiento',
  api: 'API',
  views: 'Vistas',
  bi: 'Business Intelligence',
};

export const LAYER_ORDER: Layer[] = [
  'foundation',
  'sources',
  'integration',
  'storage',
  'api',
  'views',
  'bi',
];

export const STATUS_COLORS: Record<Status, string> = {
  implemented: '#3a7a52', // green
  partial: '#b8a584', //    tan
  mock: '#76a09c', //       teal
  planned: '#8699ad', //    slate
  needed: '#cc6868', //     muted red
};

export const STATUS_LABELS: Record<Status, string> = {
  implemented: 'Implementado',
  partial: 'Parcial',
  mock: 'Mock',
  planned: 'Planificado',
  needed: 'Necesario',
};

// =============================================================================
//  ARCH_NODES — the registry. Ordered by layer per LAYER_ORDER, then logically
//  within each layer (entity-by-entity for foundation, file-by-file for sources,
//  etc.).
// =============================================================================

export const ARCH_NODES: ArchNode[] = [
  // ---------------------------------------------------------------------------
  // FOUNDATION
  // ---------------------------------------------------------------------------
  {
    id: 'foundation.type-unions',
    layer: 'foundation',
    label: 'Type Unions',
    description:
      'NavViewId, PipelineZone, Variedad, EmbarqueStatus, ClienteSegmento, ReclamoTipo, SenalTipo, RiskLevel + ~10 more.',
    status: 'implemented',
    tech: 'TypeScript',
    filePath: 'lib/types.ts',
    exposes: ['views.comando', 'views.operador', 'views.calidad', 'views.frio'],
    nextStep: 'Add data-grid and schema to NavViewId (this phase).',
    ownerPhase: 6,
  },
  {
    id: 'foundation.ontology-schema',
    layer: 'foundation',
    label: 'Ontology Schema',
    description:
      'NodeKind (12 kinds), EdgeKind (14 kinds), NODE_META, EDGE_META — canonical ontology.',
    status: 'implemented',
    tech: 'TypeScript',
    filePath: 'lib/ontology/schema.ts',
    exposes: [
      'sources.mock-graph',
      'views.grafo',
      'views.data-grid',
      'integration.graphrag-indexer',
    ],
    nextStep:
      'Mirror node and edge kinds as Postgres tables once Supabase lands (Phase 7).',
    ownerPhase: 7,
  },
  {
    id: 'foundation.status-enums',
    layer: 'foundation',
    label: 'Status Enums',
    description:
      'EmbarqueStatus, ClaimStatus, DefenseItemStatus, DataConfidence, DecisionUrgencia — domain-specific status unions.',
    status: 'implemented',
    tech: 'TypeScript',
    filePath: 'lib/types.ts',
    nextStep: 'Constrain to DB check constraints once persisted.',
    ownerPhase: 7,
  },

  // ---- 12 ontology entities ----
  {
    id: 'foundation.Shipment',
    layer: 'foundation',
    label: 'Shipment',
    description:
      'Embarque — contenedor reefer con uno o varios lotes, ruta y cliente. Núcleo del modelo.',
    status: 'mock',
    tech: 'TypeScript interface',
    filePath: 'lib/types.ts (interface Embarque)',
    consumes: ['foundation.Lot', 'foundation.Customer'],
    exposes: [
      'views.comando',
      'views.cuentas',
      'views.frio',
      'views.grafo',
      'views.data-grid',
    ],
    fields: [
      { name: 'id', type: 'string', required: true, source: 'manual', notes: 'PK' },
      { name: 'contenedor', type: 'string', required: true, source: 'erp' },
      { name: 'naviera', type: 'string', required: true, source: 'erp' },
      { name: 'setPointTemp', type: 'number', required: true, source: 'erp' },
      { name: 'fechaZarpe', type: 'string (ISO)', required: true, source: 'erp' },
      { name: 'eta', type: 'string (ISO)', required: true, source: 'erp' },
      { name: 'clienteId', type: 'string', required: true, source: 'erp', notes: '→ Customer' },
      { name: 'loteIds', type: 'string[]', required: true, source: 'erp', notes: '→ Lot' },
      { name: 'status', type: 'EmbarqueStatus', required: true, source: 'erp' },
      { name: 'riskScore', type: 'number', required: true, source: 'computed' },
      { name: 'currentZone', type: 'PipelineZone', required: true, source: 'computed' },
    ],
    nextStep: 'Persist to Supabase + sync from Nisira ERP nightly.',
    ownerPhase: 7,
  },
  {
    id: 'foundation.Customer',
    layer: 'foundation',
    label: 'Customer',
    description: 'Cliente final — supermarket, distribuidor o importador.',
    status: 'mock',
    tech: 'TypeScript interface',
    filePath: 'lib/types.ts (interface Cliente)',
    exposes: ['views.cuentas', 'views.comando', 'views.grafo'],
    fields: [
      { name: 'id', type: 'string', required: true, source: 'manual', notes: 'PK' },
      { name: 'nombre', type: 'string', required: true, source: 'crm' },
      { name: 'pais', type: 'string', required: true, source: 'crm' },
      { name: 'segmento', type: 'ClienteSegmento', required: true, source: 'manual' },
      { name: 'score', type: 'number', required: true, source: 'computed' },
      { name: 'preferencias', type: 'string[]', required: true, source: 'crm' },
      { name: 'totalReclamos', type: 'number', required: true, source: 'computed' },
      { name: 'totalEmbarques', type: 'number', required: true, source: 'computed' },
      { name: 'montoReclamosUsd', type: 'number', required: true, source: 'computed' },
    ],
    nextStep: 'Sync from CRM postventa once integration lands.',
    ownerPhase: 9,
  },
  {
    id: 'foundation.Lot',
    layer: 'foundation',
    label: 'Lot',
    description: 'Lote — unidad de cosecha trazable hasta parcela y fecha.',
    status: 'mock',
    tech: 'TypeScript interface',
    filePath: 'lib/types.ts (interface Lote)',
    consumes: ['foundation.Product'],
    exposes: ['views.calidad', 'views.comando', 'views.grafo'],
    fields: [
      { name: 'id', type: 'string', required: true, source: 'manual', notes: 'PK' },
      { name: 'parcela', type: 'string', required: true, source: 'erp' },
      { name: 'variedad', type: 'Variedad', required: true, source: 'erp', notes: '→ Product' },
      { name: 'calibre', type: 'string', required: true, source: 'manual' },
      { name: 'brix', type: 'number', required: true, source: 'sensor' },
      { name: 'dryMatter', type: 'number', required: true, source: 'sensor' },
      { name: 'fechaCosecha', type: 'string (ISO)', required: true, source: 'erp' },
      { name: 'riskScore', type: 'number', required: true, source: 'computed' },
      { name: 'zone', type: 'PipelineZone', required: true, source: 'computed' },
      { name: 'embarqueId', type: 'string?', required: false, source: 'erp', notes: '→ Shipment' },
    ],
    nextStep: 'Persist + tie QC inspections by foreign key.',
    ownerPhase: 7,
  },
  {
    id: 'foundation.Product',
    layer: 'foundation',
    label: 'Product',
    description: 'Producto/variedad comercial — Arándano, Uva Red Globe, Palta Hass, etc.',
    status: 'mock',
    tech: 'graph-only (NodeKind=Product, no TS interface yet)',
    filePath: 'lib/data/mock-graph.ts (products)',
    exposes: ['foundation.Lot', 'views.calidad', 'views.grafo'],
    fields: [
      { name: 'id', type: 'string', required: true, source: 'manual', notes: 'PK' },
      { name: 'label', type: 'string', required: true, source: 'manual' },
    ],
    nextStep: 'Promote to a real TS interface and DB table (catalog + benchmarks).',
    ownerPhase: 7,
  },
  {
    id: 'foundation.Container',
    layer: 'foundation',
    label: 'Container',
    description: 'Contenedor reefer físico — REEF-7724, etc. Identificado por matrícula.',
    status: 'mock',
    tech: 'graph-only',
    filePath: 'lib/data/mock-graph.ts (containers)',
    consumes: ['foundation.Sensor'],
    exposes: ['foundation.Shipment'],
    fields: [
      { name: 'id', type: 'string', required: true, source: 'manual', notes: 'PK' },
      { name: 'tipo', type: 'string', required: true, source: 'erp', notes: 'eg "40RH"' },
      { name: 'setPoint', type: 'number', required: true, source: 'erp' },
      { name: 'naviera', type: 'string', required: true, source: 'erp' },
    ],
    nextStep: 'Promote to TS interface + ERP sync.',
    ownerPhase: 9,
  },
  {
    id: 'foundation.Sensor',
    layer: 'foundation',
    label: 'Sensor',
    description: 'Sensor de temperatura/humedad — emite lecturas que se materializan en TempEvent.',
    status: 'mock',
    tech: 'graph-only',
    filePath: 'lib/data/mock-graph.ts (sensors)',
    exposes: ['foundation.TempEvent', 'sources.reefer-webhooks'],
    fields: [
      { name: 'id', type: 'string', required: true, source: 'manual', notes: 'PK' },
      { name: 'tipo', type: 'string', required: true, source: 'manual', notes: '"temperatura"' },
      { name: 'fabricante', type: 'string', required: true, source: 'manual' },
    ],
    nextStep: 'Stream readings via webhook → TimescaleDB.',
    ownerPhase: 8,
  },
  {
    id: 'foundation.TempEvent',
    layer: 'foundation',
    label: 'TempEvent',
    description: 'Excursión térmica — ventana en la que la temperatura excedió el rango óptimo.',
    status: 'mock',
    tech: 'TypeScript interface (parcial: Temperatura) + graph payload',
    filePath: 'lib/types.ts (interface Temperatura) + lib/data/mock-graph.ts (tempEvents)',
    consumes: ['foundation.Sensor'],
    exposes: ['foundation.Claim', 'views.frio'],
    fields: [
      { name: 'id', type: 'string', required: true, source: 'manual', notes: 'PK' },
      { name: 'embarqueId', type: 'string', required: true, source: 'computed', notes: '→ Shipment' },
      { name: 'inicio', type: 'string (ISO)', required: true, source: 'sensor' },
      { name: 'duracion', type: 'string', required: true, source: 'computed' },
      { name: 'pico', type: 'number', required: true, source: 'sensor' },
      { name: 'rangoOptimo', type: 'string', required: true, source: 'computed' },
      { name: 'severidad', type: '"leve"|"moderada"|"severa"', required: true, source: 'computed' },
    ],
    nextStep: 'Compute server-side from raw sensor streams (Phase 8).',
    ownerPhase: 8,
  },
  {
    id: 'foundation.Claim',
    layer: 'foundation',
    label: 'Claim',
    description: 'Reclamo del cliente — vincula incidencia con embarque, monto y estado.',
    status: 'mock',
    tech: 'TypeScript interface',
    filePath: 'lib/types.ts (interface Reclamo)',
    consumes: ['foundation.Customer', 'foundation.Shipment'],
    exposes: ['views.cuentas', 'views.grafo'],
    fields: [
      { name: 'id', type: 'string', required: true, source: 'manual', notes: 'PK' },
      { name: 'embarqueId', type: 'string', required: true, source: 'manual', notes: '→ Shipment' },
      { name: 'clienteId', type: 'string', required: true, source: 'manual', notes: '→ Customer' },
      { name: 'tipo', type: 'ReclamoTipo', required: true, source: 'manual' },
      { name: 'monto', type: 'number (USD)', required: true, source: 'manual' },
      { name: 'fecha', type: 'string (ISO)', required: true, source: 'manual' },
      { name: 'status', type: 'ClaimStatus', required: true, source: 'manual' },
      { name: 'evidenciaUrls', type: 'string[]', required: true, source: 'manual' },
      { name: 'descripcion', type: 'string', required: true, source: 'manual' },
    ],
    nextStep: 'Ingest from portal de reclamos + auto-attach defense docs.',
    ownerPhase: 9,
  },
  {
    id: 'foundation.AccountManager',
    layer: 'foundation',
    label: 'AccountManager',
    description: 'Ejecutivo de cuenta — humano responsable de la relación con un cliente.',
    status: 'mock',
    tech: 'graph-only',
    filePath: 'lib/data/mock-graph.ts (accountManagers)',
    exposes: ['foundation.Customer', 'views.cuentas'],
    fields: [
      { name: 'id', type: 'string', required: true, source: 'manual', notes: 'PK' },
      { name: 'label', type: 'string', required: true, source: 'manual', notes: 'nombre' },
      { name: 'cuenta', type: 'string', required: true, source: 'crm' },
      { name: 'antiguedad', type: 'string', required: true, source: 'crm' },
    ],
    nextStep: 'Promote to TS interface; sync from CRM.',
    ownerPhase: 9,
  },
  {
    id: 'foundation.Route',
    layer: 'foundation',
    label: 'Route',
    description: 'Ruta marítima — Callao → Philadelphia, Felixstowe, etc.',
    status: 'mock',
    tech: 'graph-only',
    filePath: 'lib/data/mock-graph.ts (routes)',
    consumes: ['foundation.Port'],
    exposes: ['foundation.Shipment'],
    fields: [
      { name: 'id', type: 'string', required: true, source: 'manual', notes: 'PK' },
      { name: 'label', type: 'string', required: true, source: 'manual' },
      { name: 'transitoDias', type: 'number', required: true, source: 'manual' },
      { name: 'distanciaMillas', type: 'number', required: true, source: 'manual' },
    ],
    nextStep: 'Wire live ETA via AIS tracker (Phase 8).',
    ownerPhase: 8,
  },
  {
    id: 'foundation.Port',
    layer: 'foundation',
    label: 'Port',
    description: 'Puerto de carga o destino con código ISO.',
    status: 'mock',
    tech: 'graph-only',
    filePath: 'lib/data/mock-graph.ts (ports)',
    exposes: ['foundation.Route'],
    fields: [
      { name: 'id', type: 'string', required: true, source: 'manual', notes: 'PK' },
      { name: 'label', type: 'string', required: true, source: 'manual' },
      { name: 'pais', type: 'string', required: true, source: 'manual' },
      { name: 'codigo', type: 'string', required: true, source: 'manual', notes: 'UN/LOCODE' },
    ],
    nextStep: 'Persist + enrich with port-call data from AIS.',
    ownerPhase: 8,
  },
  {
    id: 'foundation.Document',
    layer: 'foundation',
    label: 'Document',
    description: 'Documento adjunto — QC report, foto, carpeta de defensa, factura.',
    status: 'mock',
    tech: 'graph-only',
    filePath: 'lib/data/mock-graph.ts (documents)',
    exposes: ['foundation.Claim', 'foundation.Shipment'],
    fields: [
      { name: 'id', type: 'string', required: true, source: 'manual', notes: 'PK' },
      { name: 'label', type: 'string', required: true, source: 'manual' },
      { name: 'tipo', type: 'string', required: true, source: 'manual' },
      { name: 'size', type: 'string', required: true, source: 'computed' },
      { name: 'fecha', type: 'string (ISO)', required: true, source: 'manual' },
    ],
    nextStep: 'Move binaries to Vercel Blob; index references in Postgres.',
    ownerPhase: 7,
  },

  // ---------------------------------------------------------------------------
  // SOURCES
  // ---------------------------------------------------------------------------
  {
    id: 'sources.mock-graph',
    layer: 'sources',
    label: 'mock-graph',
    description: '35 nodes + ~50 edges centrados en la historia S-8842.',
    status: 'mock',
    tech: 'TypeScript fixtures',
    filePath: 'lib/data/mock-graph.ts',
    consumes: ['foundation.ontology-schema'],
    exposes: ['views.grafo', 'views.data-grid'],
    nextStep: 'Replace with Neo4j queries once Aura is provisioned.',
    ownerPhase: 9,
  },
  {
    id: 'sources.mock-lotes',
    layer: 'sources',
    label: 'mock-lotes',
    description: 'Fixtures de lotes cosechados.',
    status: 'mock',
    tech: 'TypeScript fixtures',
    filePath: 'lib/data/mock-lotes.ts',
    exposes: ['foundation.Lot', 'views.calidad'],
    nextStep: 'Reemplazar con SELECT * FROM lots once Supabase lands.',
    ownerPhase: 7,
  },
  {
    id: 'sources.mock-embarques',
    layer: 'sources',
    label: 'mock-embarques',
    description: 'Fixtures de embarques activos y completos.',
    status: 'mock',
    tech: 'TypeScript fixtures',
    filePath: 'lib/data/mock-embarques.ts',
    exposes: ['foundation.Shipment', 'views.comando', 'views.cuentas'],
    nextStep: 'Sustituir por sync nightly desde Nisira ERP.',
    ownerPhase: 9,
  },
  {
    id: 'sources.mock-clientes',
    layer: 'sources',
    label: 'mock-clientes',
    description: 'Fixtures de clientes — Walmart, Tesco, Mercadona, Costco.',
    status: 'mock',
    tech: 'TypeScript fixtures',
    filePath: 'lib/data/mock-clientes.ts',
    exposes: ['foundation.Customer', 'views.cuentas'],
    nextStep: 'Reemplazar con sync desde CRM.',
    ownerPhase: 9,
  },
  {
    id: 'sources.mock-reclamos',
    layer: 'sources',
    label: 'mock-reclamos',
    description: 'Fixtures de reclamos con monto y estado.',
    status: 'mock',
    tech: 'TypeScript fixtures',
    filePath: 'lib/data/mock-reclamos.ts',
    exposes: ['foundation.Claim'],
    nextStep: 'Ingerir desde portal de reclamos cliente.',
    ownerPhase: 9,
  },
  {
    id: 'sources.mock-temperaturas',
    layer: 'sources',
    label: 'mock-temperaturas',
    description: 'Series de lecturas térmicas por embarque.',
    status: 'mock',
    tech: 'TypeScript fixtures',
    filePath: 'lib/data/mock-temperaturas.ts',
    exposes: ['foundation.TempEvent', 'views.frio'],
    nextStep: 'Stream live readings vía webhooks → TimescaleDB.',
    ownerPhase: 8,
  },
  {
    id: 'sources.mock-senales',
    layer: 'sources',
    label: 'mock-senales',
    description: 'Señales del Radar — riesgos, mercado, calidad, regulatorio.',
    status: 'mock',
    tech: 'TypeScript fixtures',
    filePath: 'lib/data/mock-senales.ts',
    exposes: ['views.radar'],
    nextStep: 'Generar desde escucha social + análisis interno.',
    ownerPhase: 9,
  },
  {
    id: 'sources.mock-kpis',
    layer: 'sources',
    label: 'mock-kpis',
    description: 'KPI cards para Centro de Comando.',
    status: 'mock',
    tech: 'TypeScript fixtures',
    filePath: 'lib/data/mock-kpis.ts',
    exposes: ['views.comando'],
    nextStep: 'Computar desde Supabase + Postgres (Phase 7).',
    ownerPhase: 7,
  },
  {
    id: 'sources.mock-chat',
    layer: 'sources',
    label: 'mock-chat',
    description: 'Mensajes seed para el Operador.',
    status: 'mock',
    tech: 'TypeScript fixtures',
    filePath: 'lib/data/mock-chat.ts',
    exposes: ['views.operador'],
    nextStep: 'Persistir conversaciones en Supabase.',
    ownerPhase: 7,
  },
  {
    id: 'sources.mock-defense',
    layer: 'sources',
    label: 'mock-defense',
    description: 'Checklist de defensa para reclamos.',
    status: 'mock',
    tech: 'TypeScript fixtures',
    filePath: 'lib/data/mock-defense.ts',
    exposes: ['views.cuentas'],
    nextStep: 'Generar dinámicamente desde Documents + Claim attachments.',
    ownerPhase: 9,
  },
  {
    id: 'sources.mock-fichas',
    layer: 'sources',
    label: 'mock-fichas',
    description: 'Fichas operativas (Phase 2 decision intelligence).',
    status: 'mock',
    tech: 'TypeScript fixtures',
    filePath: 'lib/data/mock-fichas.ts',
    exposes: ['views.comando', 'views.operador'],
    nextStep: 'Generar desde reglas + LLM una vez los datos sean live.',
    ownerPhase: 9,
  },
  {
    id: 'sources.mock-decisiones',
    layer: 'sources',
    label: 'mock-decisiones',
    description: 'Decisiones pendientes con responsable y deadline.',
    status: 'mock',
    tech: 'TypeScript fixtures',
    filePath: 'lib/data/mock-decisiones.ts',
    exposes: ['views.comando'],
    nextStep: 'Persistir + workflow approval.',
    ownerPhase: 7,
  },
  {
    id: 'sources.mock-packing',
    layer: 'sources',
    label: 'mock-packing',
    description: 'Estado de líneas de packing + lotes en proceso + producción horaria.',
    status: 'mock',
    tech: 'TypeScript fixtures',
    filePath: 'lib/data/mock-packing.ts',
    exposes: ['views.comando'],
    nextStep: 'Ingerir lecturas reales del MES de packing.',
    ownerPhase: 8,
  },
  {
    id: 'sources.mock-quality',
    layer: 'sources',
    label: 'mock-quality',
    description: 'QC inspecciones + benchmarks + trends por variedad.',
    status: 'mock',
    tech: 'TypeScript fixtures',
    filePath: 'lib/data/mock-quality.ts',
    exposes: ['views.calidad'],
    nextStep: 'Reemplazar con datos del laboratorio (Phase 9).',
    ownerPhase: 9,
  },
  {
    id: 'sources.mock-coldchain',
    layer: 'sources',
    label: 'mock-coldchain',
    description: 'Cámaras de frío + curva 24h + excursiones.',
    status: 'mock',
    tech: 'TypeScript fixtures',
    filePath: 'lib/data/mock-coldchain.ts',
    exposes: ['views.frio'],
    nextStep: 'Stream telemetría real de las cámaras.',
    ownerPhase: 8,
  },
  {
    id: 'sources.nisira-erp',
    layer: 'sources',
    label: 'Nisira ERP',
    description: 'ERP master para lotes, embarques, contenedores, navieras.',
    status: 'planned',
    tech: 'Nisira ERP REST',
    consumes: [],
    exposes: [
      'foundation.Shipment',
      'foundation.Lot',
      'foundation.Container',
      'integration.etl-pipeline',
    ],
    nextStep: 'Confirmar endpoint + auth con equipo IT de Nisira.',
    ownerPhase: 9,
  },
  {
    id: 'sources.reefer-webhooks',
    layer: 'sources',
    label: 'Reefer logger webhooks',
    description: 'Sensitech / Emerson / Carrier — lecturas live de los reefers en tránsito.',
    status: 'planned',
    tech: 'HTTP webhook',
    exposes: ['integration.webhook-receiver', 'foundation.TempEvent'],
    nextStep: 'Stand up webhook endpoint + registrar URL en cada proveedor.',
    ownerPhase: 8,
  },
  {
    id: 'sources.crm-postventa',
    layer: 'sources',
    label: 'CRM postventa',
    description: 'CRM para cuentas, contactos, contratos y SLA.',
    status: 'planned',
    tech: 'TBD (HubSpot/Salesforce)',
    exposes: ['foundation.Customer', 'foundation.AccountManager'],
    nextStep: 'Decidir CRM + diseñar sync.',
    ownerPhase: 9,
  },
  {
    id: 'sources.portal-reclamos',
    layer: 'sources',
    label: 'Portal de reclamos cliente',
    description: 'Front público donde el cliente abre reclamos con evidencia.',
    status: 'planned',
    tech: 'Next.js subdomain',
    exposes: ['foundation.Claim', 'foundation.Document'],
    nextStep: 'Diseño UX + auth (single-use links iniciales).',
    ownerPhase: 9,
  },
  {
    id: 'sources.ais-shipping',
    layer: 'sources',
    label: 'AIS shipping tracker',
    description: 'Posición live de buques — MarineTraffic / VesselFinder.',
    status: 'needed',
    tech: 'MarineTraffic API',
    exposes: ['foundation.Route', 'foundation.Shipment'],
    nextStep: 'Evaluar tarifa + decidir polling vs websocket.',
    ownerPhase: 8,
  },
  {
    id: 'sources.weather-api',
    layer: 'sources',
    label: 'Weather API',
    description: 'Pronóstico y eventos extremos en puertos y rutas.',
    status: 'needed',
    tech: 'OpenWeather',
    exposes: ['foundation.Route', 'views.radar'],
    nextStep: 'API key + diseñar trigger de señales en Radar.',
    ownerPhase: 8,
  },

  // ---------------------------------------------------------------------------
  // INTEGRATION
  // ---------------------------------------------------------------------------
  {
    id: 'integration.operator-stream',
    layer: 'integration',
    label: 'Operator stream handler',
    description: 'SSE handler que orquesta el chat del Operador con Claude.',
    status: 'implemented',
    tech: 'Server-sent events',
    filePath: 'lib/operator/stream-handler.ts',
    consumes: ['sources.mock-chat'],
    exposes: ['api.api-chat', 'views.operador'],
    nextStep: 'Persistir conversaciones + agregar herramientas MCP.',
    ownerPhase: 7,
  },
  {
    id: 'integration.etl-pipeline',
    layer: 'integration',
    label: 'ETL pipeline',
    description: 'Pipeline batch que sincroniza ERP/CRM → Postgres.',
    status: 'needed',
    tech: 'TBD (dbt? cron + scripts?)',
    consumes: ['sources.nisira-erp', 'sources.crm-postventa'],
    exposes: ['storage.supabase-postgres'],
    nextStep: 'Decidir orquestador + cadencia.',
    ownerPhase: 9,
  },
  {
    id: 'integration.webhook-receiver',
    layer: 'integration',
    label: 'Webhook receiver',
    description: 'Endpoint que recibe lecturas de reefers + las normaliza.',
    status: 'planned',
    tech: 'Next route + Edge function',
    consumes: ['sources.reefer-webhooks'],
    exposes: ['storage.timescaledb', 'api.sensor-ingestion'],
    nextStep: 'Implementar /api/ingest/reefer con validación HMAC.',
    ownerPhase: 8,
  },
  {
    id: 'integration.graphrag-indexer',
    layer: 'integration',
    label: 'GraphRAG indexer',
    description:
      'Indexa el grafo + documentos para respuestas grounded del Operador. Hoy dressing en Habita context (pill "GraphRAG · ERP Nisira (mock)").',
    status: 'mock',
    tech: 'TBD',
    consumes: ['foundation.ontology-schema', 'storage.neo4j-aura'],
    exposes: ['api.api-chat'],
    nextStep: 'Decidir stack (LangGraph? Neo4j GDS? Llama Index?).',
    ownerPhase: 9,
  },
  {
    id: 'integration.mcp-server',
    layer: 'integration',
    label: 'MCP server (agent read)',
    description: 'Servidor MCP que expone lectura del registry + KPIs para agentes externos.',
    status: 'planned',
    tech: 'MCP SDK',
    consumes: ['storage.supabase-postgres'],
    exposes: ['bi.mcp-analytics'],
    nextStep: 'Definir tool schema + auth por org.',
    ownerPhase: 10,
  },

  // ---------------------------------------------------------------------------
  // STORAGE
  // ---------------------------------------------------------------------------
  {
    id: 'storage.supabase-postgres',
    layer: 'storage',
    label: 'Supabase Postgres',
    description: 'Postgres administrado — entidades de dominio + RLS multi-org.',
    status: 'planned',
    tech: 'Supabase',
    consumes: ['integration.etl-pipeline'],
    exposes: ['api.entity-crud', 'bi.power-bi-dataset', 'integration.mcp-server'],
    nextStep: 'Provisionar proyecto + migrations iniciales (schema mirror ontology).',
    ownerPhase: 7,
  },
  {
    id: 'storage.timescaledb',
    layer: 'storage',
    label: 'TimescaleDB extension',
    description: 'Series temporales — lecturas de sensores con compresión + downsampling.',
    status: 'planned',
    tech: 'TimescaleDB sobre Supabase',
    consumes: ['integration.webhook-receiver'],
    exposes: ['api.sensor-ingestion', 'views.frio'],
    nextStep: 'Habilitar extensión + crear hypertable temp_readings.',
    ownerPhase: 8,
  },
  {
    id: 'storage.vercel-blob',
    layer: 'storage',
    label: 'Vercel Blob',
    description: 'Object storage para documentos, fotos y carpetas de defensa.',
    status: 'planned',
    tech: 'Vercel Blob',
    exposes: ['foundation.Document'],
    nextStep: 'Configurar store + signed-URL helper.',
    ownerPhase: 7,
  },
  {
    id: 'storage.neo4j-aura',
    layer: 'storage',
    label: 'Neo4j Aura',
    description: 'Grafo real que respalda GRAFO + GraphRAG (hoy es mock-graph in-memory).',
    status: 'planned',
    tech: 'Neo4j Aura',
    consumes: ['integration.etl-pipeline'],
    exposes: ['views.grafo', 'views.data-grid', 'integration.graphrag-indexer'],
    nextStep: 'Provisionar Aura free → mirror ontology + 35 nodes seed.',
    ownerPhase: 9,
  },

  // ---------------------------------------------------------------------------
  // API
  // ---------------------------------------------------------------------------
  {
    id: 'api.api-health',
    layer: 'api',
    label: 'GET /api/health',
    description: 'Health check para Vercel + monitoring externo.',
    status: 'implemented',
    tech: 'Next route handler',
    filePath: 'app/api/health/route.ts',
    nextStep: 'Añadir checks de upstream (Supabase + Neo4j) cuando existan.',
    ownerPhase: 7,
  },
  {
    id: 'api.api-chat',
    layer: 'api',
    label: 'POST /api/chat',
    description: 'Streaming SSE para el Operador — Claude con system prompt grounded.',
    status: 'implemented',
    tech: 'Next route + SSE',
    filePath: 'app/api/chat/route.ts',
    consumes: ['integration.operator-stream', 'integration.graphrag-indexer'],
    exposes: ['views.operador'],
    nextStep: 'Migrar grounding a Neo4j Aura + persistir threads.',
    ownerPhase: 9,
  },
  {
    id: 'api.api-export',
    layer: 'api',
    label: '/api/export',
    description: 'Genera HTML/PDF para fichas, carpetas de defensa y reportes.',
    status: 'implemented',
    tech: 'Next route',
    filePath: 'app/api/export/route.ts',
    nextStep: 'Persistir exports en Vercel Blob + URL firmada.',
    ownerPhase: 7,
  },
  {
    id: 'api.import-csv',
    layer: 'api',
    label: '/import (CSV)',
    description: 'Página Next para subir CSVs de lotes, embarques, clientes, temperaturas.',
    status: 'implemented',
    tech: 'Next page + lib/import/csv-parser.ts',
    filePath: 'app/import/page.tsx',
    nextStep: 'Mover validación al server + commit a Supabase tras schema.',
    ownerPhase: 7,
  },
  {
    id: 'api.entity-crud',
    layer: 'api',
    label: 'Entity CRUD endpoints',
    description: 'CRUD REST para Shipment, Lot, Customer, Claim, Document.',
    status: 'needed',
    tech: 'Next route handlers',
    consumes: ['storage.supabase-postgres'],
    exposes: ['views.comando', 'views.cuentas'],
    nextStep: 'Auto-generar desde tipos + Supabase tras migrations.',
    ownerPhase: 7,
  },
  {
    id: 'api.sensor-ingestion',
    layer: 'api',
    label: 'POST /api/ingest/reefer',
    description: 'Endpoint que acepta lecturas reefer y las persiste en TimescaleDB.',
    status: 'needed',
    tech: 'Next Edge + HMAC verify',
    consumes: ['integration.webhook-receiver'],
    exposes: ['storage.timescaledb'],
    nextStep: 'Definir payload spec con cada proveedor (Sensitech, Emerson, Carrier).',
    ownerPhase: 8,
  },
  {
    id: 'api.erp-sync',
    layer: 'api',
    label: 'ERP sync endpoints',
    description: 'Endpoints internos que el ETL llama para empujar/jalar de Nisira.',
    status: 'planned',
    tech: 'Next route',
    consumes: ['sources.nisira-erp', 'integration.etl-pipeline'],
    exposes: ['storage.supabase-postgres'],
    nextStep: 'Esperar especificación de Nisira.',
    ownerPhase: 9,
  },

  // ---------------------------------------------------------------------------
  // VIEWS (12 tabs)
  // ---------------------------------------------------------------------------
  {
    id: 'views.comando',
    layer: 'views',
    label: 'Comando',
    description: 'Centro de Comando — KPIs + DashboardView + PackingDashboard.',
    status: 'implemented',
    tech: 'React',
    filePath: 'components/panels/DashboardView.tsx + components/dashboards/PackingDashboard.tsx',
    consumes: [
      'foundation.Shipment',
      'foundation.Lot',
      'sources.mock-kpis',
      'sources.mock-fichas',
      'sources.mock-decisiones',
      'sources.mock-packing',
    ],
    nextStep: 'Conectar KPIs a queries reales (Phase 7).',
    ownerPhase: 7,
  },
  {
    id: 'views.operador',
    layer: 'views',
    label: 'Operador',
    description: 'Chat de Claude grounded en datos del proyecto.',
    status: 'implemented',
    tech: 'React + SSE',
    filePath: 'components/panels/OperatorChat.tsx',
    consumes: ['api.api-chat', 'integration.operator-stream', 'sources.mock-chat'],
    nextStep: 'Tool use vía MCP (Phase 10).',
    ownerPhase: 10,
  },
  {
    id: 'views.cuentas',
    layer: 'views',
    label: 'Cuentas',
    description: 'Cartera de clientes, ranking de riesgo y exposición — placeholder hoy.',
    status: 'partial',
    tech: 'React',
    filePath: 'components/dashboards/EmptyView.tsx (placeholder)',
    consumes: ['foundation.Customer', 'foundation.Claim', 'foundation.AccountManager'],
    nextStep: 'Implementar dashboard real con ranking de cuentas.',
    ownerPhase: 7,
  },
  {
    id: 'views.calidad',
    layer: 'views',
    label: 'Calidad',
    description: 'Quality Control — gauges, inspecciones, benchmarks por variedad.',
    status: 'implemented',
    tech: 'React + Recharts',
    filePath: 'components/dashboards/QualityDashboard.tsx',
    consumes: ['foundation.Lot', 'foundation.Product', 'sources.mock-quality'],
    nextStep: 'Wire al lab data once available.',
    ownerPhase: 9,
  },
  {
    id: 'views.frio',
    layer: 'views',
    label: 'Cadena de Frío',
    description: 'ColdChainDashboard — cámaras, curvas 24h, excursiones.',
    status: 'implemented',
    tech: 'React + Recharts',
    filePath: 'components/dashboards/ColdChainDashboard.tsx',
    consumes: [
      'foundation.TempEvent',
      'foundation.Sensor',
      'sources.mock-coldchain',
      'sources.mock-temperaturas',
    ],
    nextStep: 'Cambiar fuente a TimescaleDB streams.',
    ownerPhase: 8,
  },
  {
    id: 'views.radar',
    layer: 'views',
    label: 'Radar',
    description: 'Señales — riesgos, mercado, calidad, regulatorio.',
    status: 'implemented',
    tech: 'React',
    filePath: 'components/panels/SignalQueue.tsx',
    consumes: ['sources.mock-senales', 'sources.weather-api'],
    nextStep: 'Generar señales desde escucha social + Weather API.',
    ownerPhase: 9,
  },
  {
    id: 'views.social',
    layer: 'views',
    label: 'Escucha Social',
    description: 'Menciones, reviews y patrones — placeholder hoy.',
    status: 'partial',
    tech: 'React',
    filePath: 'components/dashboards/EmptyView.tsx (placeholder)',
    nextStep: 'Diseñar + implementar el listening dashboard.',
    ownerPhase: 9,
  },
  {
    id: 'views.sim',
    layer: 'views',
    label: 'SIM',
    description: 'Simulación de planta · Cosecha → Llegada.',
    status: 'implemented',
    tech: 'React',
    filePath: 'components/dashboards/OperationsSimView.tsx',
    consumes: ['foundation.Shipment', 'foundation.Lot'],
    nextStep: 'Wire a datos reales tras Supabase.',
    ownerPhase: 7,
  },
  {
    id: 'views.data-grid',
    layer: 'views',
    label: 'DATA GRID',
    description:
      'Ontología en layout dagre LR — los 12 tipos de nodo y 14 tipos de arista del modelo.',
    status: 'implemented',
    tech: 'React + @xyflow/react + dagre',
    filePath: 'components/dashboards/DataGridView.tsx',
    consumes: [
      'foundation.ontology-schema',
      'sources.mock-graph',
    ],
    nextStep: 'Sincronizar con Neo4j Aura una vez provisionado.',
    ownerPhase: 6,
  },
  {
    id: 'views.grafo',
    layer: 'views',
    label: 'Grafo',
    description: 'Knowledge graph force-directed de las instancias.',
    status: 'implemented',
    tech: 'React + @xyflow/react + d3-force',
    filePath: 'components/dashboards/GraphIntelligenceView.tsx',
    consumes: ['foundation.ontology-schema', 'sources.mock-graph'],
    nextStep: 'Backend con Neo4j Aura.',
    ownerPhase: 9,
  },
  {
    id: 'views.schema',
    layer: 'views',
    label: 'SCHEMA',
    description:
      'Mapa interactivo de la arquitectura — 4 modos: Stack, ERD, Flow, Maturity.',
    status: 'implemented',
    tech: 'React + @xyflow/react',
    filePath: 'components/dashboards/SchemaView.tsx',
    consumes: ['foundation.ontology-schema'],
    nextStep:
      'Phase 6.1 — editor inline + verificación CI de que cada cambio se registra.',
    ownerPhase: 6,
  },
  {
    id: 'views.config',
    layer: 'views',
    label: 'Config',
    description: 'Toggles de layers + tema + ajustes globales.',
    status: 'implemented',
    tech: 'React',
    filePath: 'components/panels/ConfigToggles.tsx',
    nextStep: 'Persistir preferencias por usuario (Phase 7).',
    ownerPhase: 7,
  },

  // ---------------------------------------------------------------------------
  // BI
  // ---------------------------------------------------------------------------
  {
    id: 'bi.power-bi-dataset',
    layer: 'bi',
    label: 'Power BI dataset',
    description: 'Dataset semántico de Power BI con conexión a Supabase.',
    status: 'planned',
    tech: 'Power BI Service',
    consumes: ['storage.supabase-postgres', 'storage.timescaledb'],
    nextStep: 'Crear workspace + dataset baseline (lotes, embarques, claims).',
    ownerPhase: 10,
  },
  {
    id: 'bi.customer-portal',
    layer: 'bi',
    label: 'Portal cliente',
    description: 'Portal cliente con embedded dashboards y descarga de docs.',
    status: 'planned',
    tech: 'Next.js + Power BI Embedded',
    consumes: ['bi.power-bi-dataset', 'storage.vercel-blob'],
    nextStep: 'Diseño UX + auth por cuenta cliente.',
    ownerPhase: 10,
  },
  {
    id: 'bi.looker-metabase',
    layer: 'bi',
    label: 'Looker Studio / Metabase',
    description: 'Layer secundaria para análisis ad-hoc + dashboards internos.',
    status: 'planned',
    tech: 'Looker Studio o Metabase',
    consumes: ['storage.supabase-postgres'],
    nextStep: 'Decidir herramienta + permisos.',
    ownerPhase: 10,
  },
  {
    id: 'bi.mcp-analytics',
    layer: 'bi',
    label: 'MCP analytics endpoint',
    description: 'MCP server para que agentes externos lean KPIs y series.',
    status: 'planned',
    tech: 'MCP SDK',
    consumes: ['integration.mcp-server'],
    nextStep: 'Definir tool schema + auth por org.',
    ownerPhase: 10,
  },
];

// =============================================================================
//  Index — count nodes per layer for the toolbar summary.
// =============================================================================

export function countNodesByLayer(): Record<Layer, number> {
  const out: Record<Layer, number> = {
    foundation: 0,
    sources: 0,
    integration: 0,
    storage: 0,
    api: 0,
    views: 0,
    bi: 0,
  };
  for (const n of ARCH_NODES) out[n.layer]++;
  return out;
}

export function countNodesByStatus(): Record<Status, number> {
  const out: Record<Status, number> = {
    implemented: 0,
    partial: 0,
    mock: 0,
    planned: 0,
    needed: 0,
  };
  for (const n of ARCH_NODES) out[n.status]++;
  return out;
}
