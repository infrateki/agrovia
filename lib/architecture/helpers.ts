// Helpers that read from the schema-map registry. Keep these pure and free of
// React imports so they're easy to use from any layer (UI, tests, scripts).

import {
  ARCH_NODES,
  LAYER_ORDER,
  STATUS_COLORS,
  type ArchNode,
  type Layer,
  type Status,
} from './schema-map';

export function getNode(id: string): ArchNode | undefined {
  return ARCH_NODES.find((n) => n.id === id);
}

export function getNodesByLayer(layer: Layer): ArchNode[] {
  return ARCH_NODES.filter((n) => n.layer === layer);
}

export function getStatusColor(status: Status): string {
  return STATUS_COLORS[status];
}

// All nodes that this id consumes (resolved against the registry).
export function getConsumers(id: string): ArchNode[] {
  const node = getNode(id);
  if (!node?.consumes) return [];
  return node.consumes
    .map((cid) => getNode(cid))
    .filter((n): n is ArchNode => Boolean(n));
}

// All nodes that consume this id (inverse of consumes).
export function getConsumedBy(id: string): ArchNode[] {
  return ARCH_NODES.filter((n) => n.consumes?.includes(id));
}

// All nodes this id exposes to (resolved).
export function getExposedTo(id: string): ArchNode[] {
  const node = getNode(id);
  if (!node?.exposes) return [];
  return node.exposes
    .map((eid) => getNode(eid))
    .filter((n): n is ArchNode => Boolean(n));
}

// === Maturity matrix ===
// For an entity (a foundation node), look up which other layer-nodes "support"
// that entity, and return the resulting cell info.
//
// The mapping is:
//  - Mock     → sources.mock-* that exposes the entity
//  - Storage  → storage.* that exposes the entity
//  - API      → api.* whose consumes includes a sources-node that exposes the entity
//  - UI       → views.* whose consumes includes the entity
//  - BI       → bi.* whose downstream chain consumes the entity (via storage)
//  - Live     → "implemented" across all of: Mock + Storage + API + UI
//
// "Type" column is always implemented (the entity exists in TS) when the
// entity itself is a foundation node, so we mirror its own status.

export type MaturityColumn =
  | 'type'
  | 'mock'
  | 'storage'
  | 'api'
  | 'ui'
  | 'bi'
  | 'live';

export interface MaturityCell {
  status: Status;
  sourceNodeId?: string;
  nextStep?: string;
}

const MATURITY_COLUMN_LABELS: Record<MaturityColumn, string> = {
  type: 'Type',
  mock: 'Mock',
  storage: 'Storage',
  api: 'API',
  ui: 'UI',
  bi: 'BI',
  live: 'Live',
};

export const MATURITY_COLUMNS: MaturityColumn[] = [
  'type',
  'mock',
  'storage',
  'api',
  'ui',
  'bi',
  'live',
];

export function maturityColumnLabel(col: MaturityColumn): string {
  return MATURITY_COLUMN_LABELS[col];
}

// Pick the "best" status among a set of candidates. Order: implemented > partial > mock > planned > needed.
const STATUS_RANK: Record<Status, number> = {
  implemented: 4,
  partial: 3,
  mock: 2,
  planned: 1,
  needed: 0,
};

function bestStatusOf(nodes: ArchNode[]): { status: Status; source?: ArchNode } {
  if (nodes.length === 0) return { status: 'needed' };
  let best = nodes[0]!;
  for (const n of nodes) {
    if (STATUS_RANK[n.status] > STATUS_RANK[best.status]) best = n;
  }
  return { status: best.status, source: best };
}

export function getMaturityCell(
  entityId: string,
  column: MaturityColumn,
): MaturityCell {
  const entity = getNode(entityId);
  if (!entity) return { status: 'needed' };

  if (column === 'type') {
    return {
      status: entity.status,
      sourceNodeId: entity.id,
      nextStep: entity.nextStep,
    };
  }

  if (column === 'mock') {
    const sources = getNodesByLayer('sources').filter((s) =>
      s.exposes?.includes(entityId),
    );
    const { status, source } = bestStatusOf(sources);
    return {
      status,
      sourceNodeId: source?.id,
      nextStep: source?.nextStep,
    };
  }

  if (column === 'storage') {
    const storages = getNodesByLayer('storage').filter((s) =>
      s.exposes?.includes(entityId),
    );
    const { status, source } = bestStatusOf(storages);
    return {
      status,
      sourceNodeId: source?.id,
      nextStep: source?.nextStep,
    };
  }

  if (column === 'api') {
    // An entity is covered by API when any api node consumes a source/storage that exposes it,
    // OR when the api node itself exposes the entity.
    const apis = getNodesByLayer('api').filter((a) => {
      if (a.exposes?.includes(entityId)) return true;
      if (!a.consumes) return false;
      return a.consumes.some((cid) => {
        const c = getNode(cid);
        return c?.exposes?.includes(entityId);
      });
    });
    // Also: any api whose consumes includes a storage node that exposes the entity.
    const storages = getNodesByLayer('storage')
      .filter((s) => s.exposes?.includes(entityId))
      .map((s) => s.id);
    const apisViaStorage = getNodesByLayer('api').filter((a) =>
      a.consumes?.some((cid) => storages.includes(cid)),
    );
    const all = Array.from(new Set([...apis, ...apisViaStorage]));
    const { status, source } = bestStatusOf(all);
    return {
      status,
      sourceNodeId: source?.id,
      nextStep: source?.nextStep,
    };
  }

  if (column === 'ui') {
    const views = getNodesByLayer('views').filter((v) =>
      v.consumes?.includes(entityId),
    );
    const { status, source } = bestStatusOf(views);
    return {
      status,
      sourceNodeId: source?.id,
      nextStep: source?.nextStep,
    };
  }

  if (column === 'bi') {
    // BI is reached if any bi node's transitive consumes chain includes a storage that exposes the entity.
    const storageIds = getNodesByLayer('storage')
      .filter((s) => s.exposes?.includes(entityId))
      .map((s) => s.id);
    const bis = getNodesByLayer('bi').filter((b) =>
      b.consumes?.some((cid) => storageIds.includes(cid)),
    );
    const { status, source } = bestStatusOf(bis);
    return {
      status,
      sourceNodeId: source?.id,
      nextStep: source?.nextStep,
    };
  }

  if (column === 'live') {
    // Live = all of mock + storage + api + ui at "implemented".
    const cols: MaturityColumn[] = ['mock', 'storage', 'api', 'ui'];
    let worst: Status = 'implemented';
    for (const c of cols) {
      const cell = getMaturityCell(entityId, c);
      if (STATUS_RANK[cell.status] < STATUS_RANK[worst]) worst = cell.status;
    }
    return {
      status: worst,
      nextStep:
        worst === 'implemented'
          ? 'Activar conexión live — el entity ya está soportado en todos los layers.'
          : 'Esperando capas faltantes (storage, API, o UI).',
    };
  }

  return { status: 'needed' };
}

// Entities for the maturity matrix = foundation nodes that have `fields`
// (i.e., real data entities, not type bundles).
export function getMaturityEntities(): ArchNode[] {
  return getNodesByLayer('foundation').filter(
    (n) => n.fields && n.fields.length > 0,
  );
}

// Build edges for the Flow mode: for every (a → b) where b is in a.consumes
// AND we want sources → ... → bi direction. We invert: a node's consumes are
// inputs (drawn from-left); exposes are outputs (drawn-to-right). The Flow
// mode renders left = sources, right = bi, so for each node we draw edges
// to every id in its `exposes`.

export interface FlowEdge {
  id: string;
  source: string; // ArchNode id
  target: string; // ArchNode id
  status: Status;
}

export function getFlowEdges(): FlowEdge[] {
  const edges: FlowEdge[] = [];
  for (const node of ARCH_NODES) {
    if (!node.exposes) continue;
    for (const target of node.exposes) {
      if (!getNode(target)) continue;
      edges.push({
        id: `${node.id}->${target}`,
        source: node.id,
        target,
        status: node.status,
      });
    }
  }
  return edges;
}

// ERD edges: between foundation entities only, derived from field notes like
// "→ EntityName" or known references. We parse the `notes` field looking for
// `→ Foo` patterns; failing that, common naming conventions (clienteId → Customer).
export interface ErdEdge {
  id: string;
  source: string; // entity ArchNode id (e.g., foundation.Shipment)
  target: string;
  cardinality: '1:1' | '1:N' | 'N:M';
  label: string; // field name that creates the link
}

const NAME_TO_ENTITY: Record<string, string> = {
  Shipment: 'foundation.Shipment',
  Embarque: 'foundation.Shipment',
  Customer: 'foundation.Customer',
  Cliente: 'foundation.Customer',
  Lot: 'foundation.Lot',
  Lote: 'foundation.Lot',
  Product: 'foundation.Product',
  Container: 'foundation.Container',
  Sensor: 'foundation.Sensor',
  TempEvent: 'foundation.TempEvent',
  Claim: 'foundation.Claim',
  Reclamo: 'foundation.Claim',
  AccountManager: 'foundation.AccountManager',
  Route: 'foundation.Route',
  Port: 'foundation.Port',
  Document: 'foundation.Document',
};

export function getErdEdges(): ErdEdge[] {
  const edges: ErdEdge[] = [];
  const entities = getMaturityEntities();
  for (const entity of entities) {
    for (const field of entity.fields ?? []) {
      const notes = field.notes ?? '';
      const m = notes.match(/→\s*([A-Z][A-Za-z]+)/);
      if (!m) continue;
      const targetEntity = NAME_TO_ENTITY[m[1]!];
      if (!targetEntity) continue;
      if (targetEntity === entity.id) continue;
      const isArray = field.type.includes('[]');
      edges.push({
        id: `${entity.id}:${field.name}->${targetEntity}`,
        source: entity.id,
        target: targetEntity,
        cardinality: isArray ? '1:N' : '1:1',
        label: field.name,
      });
    }
  }
  return edges;
}

export { LAYER_ORDER };
