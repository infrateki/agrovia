// Agrovia ontology — single source of truth for the knowledge graph.
// Node kinds and edge kinds are typed unions; the metadata is held in a
// frozen table that we can index by kind for accent color / icon / label.

export type NodeKind =
  | 'Customer'
  | 'Shipment'
  | 'Lot'
  | 'Product'
  | 'Container'
  | 'Sensor'
  | 'TempEvent'
  | 'Claim'
  | 'AccountManager'
  | 'Route'
  | 'Port'
  | 'Document';

export type EdgeKind =
  | 'RECEIVES'
  | 'CONTAINS'
  | 'OF_PRODUCT'
  | 'USES'
  | 'MONITORED_BY'
  | 'GENERATED'
  | 'TRIGGERED'
  | 'FILED_BY'
  | 'ABOUT'
  | 'MANAGES'
  | 'FOLLOWS'
  | 'ORIGIN'
  | 'DESTINATION'
  | 'ATTACHED';

// Lucide icon names — string keys we resolve to actual components at the
// component layer. Keeping them as strings here lets this file stay free
// of any React import.
export type NodeIcon =
  | 'building-2'
  | 'ship'
  | 'package'
  | 'cherry'
  | 'container'
  | 'radio'
  | 'thermometer'
  | 'alert-triangle'
  | 'user'
  | 'route'
  | 'anchor'
  | 'file-text';

export interface NodeMeta {
  kind: NodeKind;
  labelES: string;
  accent: string; // hex
  icon: NodeIcon;
  diameter: number; // px, controls visual importance in the canvas
}

// Phase 5.1 — Neo4j Browser look. Diameters bumped: default 100, customer/
// shipment 120, sensor/tempevent 80, document/port 90. Accents saturated
// ~+15% to read against the dark canvas.
export const NODE_META: Readonly<Record<NodeKind, NodeMeta>> = Object.freeze({
  Customer: {
    kind: 'Customer',
    labelES: 'Cliente',
    accent: '#e3c08f',
    icon: 'building-2',
    diameter: 120,
  },
  Shipment: {
    kind: 'Shipment',
    labelES: 'Embarque',
    accent: '#c19372',
    icon: 'ship',
    diameter: 120,
  },
  Lot: {
    kind: 'Lot',
    labelES: 'Lote',
    accent: '#ad8765',
    icon: 'package',
    diameter: 100,
  },
  Product: {
    kind: 'Product',
    labelES: 'Producto',
    accent: '#95a884',
    icon: 'cherry',
    diameter: 100,
  },
  Container: {
    kind: 'Container',
    labelES: 'Contenedor',
    accent: '#76a09c',
    icon: 'container',
    diameter: 100,
  },
  Sensor: {
    kind: 'Sensor',
    labelES: 'Sensor',
    accent: '#8699ad',
    icon: 'radio',
    diameter: 80,
  },
  TempEvent: {
    kind: 'TempEvent',
    labelES: 'Excursión Térmica',
    accent: '#d68470',
    icon: 'thermometer',
    diameter: 80,
  },
  Claim: {
    kind: 'Claim',
    labelES: 'Reclamo',
    accent: '#cc6868',
    icon: 'alert-triangle',
    diameter: 100,
  },
  AccountManager: {
    kind: 'AccountManager',
    labelES: 'Account Manager',
    accent: '#e3c08f',
    icon: 'user',
    diameter: 100,
  },
  Route: {
    kind: 'Route',
    labelES: 'Ruta',
    accent: '#9a9a9a',
    icon: 'route',
    diameter: 100,
  },
  Port: {
    kind: 'Port',
    labelES: 'Puerto',
    accent: '#6e8a9c',
    icon: 'anchor',
    diameter: 90,
  },
  Document: {
    kind: 'Document',
    labelES: 'Documento',
    accent: '#b8a584',
    icon: 'file-text',
    diameter: 90,
  },
});

export interface EdgeMeta {
  kind: EdgeKind;
  from: NodeKind;
  to: NodeKind | 'Any';
}

export const EDGE_META: Readonly<Record<EdgeKind, EdgeMeta>> = Object.freeze({
  RECEIVES: { kind: 'RECEIVES', from: 'Customer', to: 'Shipment' },
  CONTAINS: { kind: 'CONTAINS', from: 'Shipment', to: 'Lot' },
  OF_PRODUCT: { kind: 'OF_PRODUCT', from: 'Lot', to: 'Product' },
  USES: { kind: 'USES', from: 'Shipment', to: 'Container' },
  MONITORED_BY: { kind: 'MONITORED_BY', from: 'Container', to: 'Sensor' },
  GENERATED: { kind: 'GENERATED', from: 'Sensor', to: 'TempEvent' },
  TRIGGERED: { kind: 'TRIGGERED', from: 'TempEvent', to: 'Claim' },
  FILED_BY: { kind: 'FILED_BY', from: 'Claim', to: 'Customer' },
  ABOUT: { kind: 'ABOUT', from: 'Claim', to: 'Shipment' },
  MANAGES: { kind: 'MANAGES', from: 'AccountManager', to: 'Customer' },
  FOLLOWS: { kind: 'FOLLOWS', from: 'Shipment', to: 'Route' },
  ORIGIN: { kind: 'ORIGIN', from: 'Route', to: 'Port' },
  DESTINATION: { kind: 'DESTINATION', from: 'Route', to: 'Port' },
  ATTACHED: { kind: 'ATTACHED', from: 'Document', to: 'Any' },
});

export const ALL_NODE_KINDS: readonly NodeKind[] = Object.freeze([
  'Customer',
  'Shipment',
  'Lot',
  'Product',
  'Container',
  'Sensor',
  'TempEvent',
  'Claim',
  'AccountManager',
  'Route',
  'Port',
  'Document',
]);

export const ALL_EDGE_KINDS: readonly EdgeKind[] = Object.freeze([
  'RECEIVES',
  'CONTAINS',
  'OF_PRODUCT',
  'USES',
  'MONITORED_BY',
  'GENERATED',
  'TRIGGERED',
  'FILED_BY',
  'ABOUT',
  'MANAGES',
  'FOLLOWS',
  'ORIGIN',
  'DESTINATION',
  'ATTACHED',
]);

export function getNodeAccent(kind: NodeKind): string {
  return NODE_META[kind].accent;
}

export function getNodeIcon(kind: NodeKind): NodeIcon {
  return NODE_META[kind].icon;
}

export function getNodeLabelES(kind: NodeKind): string {
  return NODE_META[kind].labelES;
}

export function getNodeDiameter(kind: NodeKind): number {
  return NODE_META[kind].diameter;
}
