// Mock instance graph — seeded around the S-8842 story so the demo narrative
// stays continuous with Phase 1-4. ~35 nodes, ~50 edges.

import type { EdgeKind, NodeKind } from '../ontology/schema';

export interface GraphNodeData {
  id: string;
  kind: NodeKind;
  label: string; // human-readable display label (Spanish or alphanumeric)
  // Free-form payload — different per kind. Rendered by NodeDetailPanel.
  meta?: Record<string, string | number | boolean>;
}

export interface GraphEdgeData {
  id: string;
  source: string;
  target: string;
  kind: EdgeKind;
}

// ---------- Customers ----------
const customers: GraphNodeData[] = [
  {
    id: 'C-WALMART',
    kind: 'Customer',
    label: 'Walmart US',
    meta: {
      pais: 'Estados Unidos',
      segmento: 'premium',
      embarquesActivos: 2,
      reclamos90d: 3,
      ratioReclamos: '3 / 12 (25%)',
    },
  },
  {
    id: 'C-TESCO',
    kind: 'Customer',
    label: 'Tesco UK',
    meta: {
      pais: 'Reino Unido',
      segmento: 'premium',
      embarquesActivos: 1,
      reclamos90d: 0,
    },
  },
  {
    id: 'C-MERCADONA',
    kind: 'Customer',
    label: 'Mercadona ES',
    meta: {
      pais: 'España',
      segmento: 'standard',
      embarquesActivos: 1,
      reclamos90d: 1,
    },
  },
  {
    id: 'C-COSTCO',
    kind: 'Customer',
    label: 'Costco CA',
    meta: {
      pais: 'Canadá',
      segmento: 'premium',
      embarquesActivos: 2,
      reclamos90d: 0,
    },
  },
];

// ---------- Account Managers ----------
const accountManagers: GraphNodeData[] = [
  {
    id: 'AM-CMENDOZA',
    kind: 'AccountManager',
    label: 'Carlos Mendoza',
    meta: { cuenta: 'Walmart US', antiguedad: '4 años' },
  },
  {
    id: 'AM-ATORRES',
    kind: 'AccountManager',
    label: 'Ana Torres',
    meta: { cuenta: 'Tesco UK', antiguedad: '2 años' },
  },
  {
    id: 'AM-DRAMOS',
    kind: 'AccountManager',
    label: 'Diego Ramos',
    meta: { cuenta: 'Mercadona ES', antiguedad: '3 años' },
  },
];

// ---------- Products ----------
const products: GraphNodeData[] = [
  { id: 'P-ARANDANO', kind: 'Product', label: 'Arándano' },
  { id: 'P-UVA', kind: 'Product', label: 'Uva Red Globe' },
  { id: 'P-MANGO', kind: 'Product', label: 'Mango Kent' },
  { id: 'P-PALTA', kind: 'Product', label: 'Palta Hass' },
  { id: 'P-ESPARRAGO', kind: 'Product', label: 'Espárrago Verde' },
];

// ---------- Shipments ----------
const shipments: GraphNodeData[] = [
  {
    id: 'S-8842',
    kind: 'Shipment',
    label: 'S-8842',
    meta: {
      cliente: 'Walmart US',
      producto: 'Arándano',
      contenedor: 'REEF-7724',
      ruta: 'Callao → Philadelphia',
      estado: 'en-tránsito',
      riesgo: 87,
    },
  },
  {
    id: 'S-8843',
    kind: 'Shipment',
    label: 'S-8843',
    meta: {
      cliente: 'Tesco UK',
      producto: 'Uva Red Globe',
      ruta: 'Callao → Felixstowe',
      estado: 'en-cámara',
      riesgo: 32,
    },
  },
  {
    id: 'S-8844',
    kind: 'Shipment',
    label: 'S-8844',
    meta: {
      cliente: 'Mercadona ES',
      producto: 'Palta Hass',
      ruta: 'Callao → Algeciras',
      estado: 'en-tránsito',
      riesgo: 58,
    },
  },
  {
    id: 'S-8845',
    kind: 'Shipment',
    label: 'S-8845',
    meta: {
      cliente: 'Costco CA',
      producto: 'Arándano',
      ruta: 'Callao → Long Beach',
      estado: 'en-puerto',
      riesgo: 21,
    },
  },
  {
    id: 'S-8846',
    kind: 'Shipment',
    label: 'S-8846',
    meta: {
      cliente: 'Walmart US',
      producto: 'Mango Kent',
      ruta: 'Callao → Philadelphia',
      estado: 'en-cámara',
      riesgo: 44,
    },
  },
  {
    id: 'S-8847',
    kind: 'Shipment',
    label: 'S-8847',
    meta: {
      cliente: 'Costco CA',
      producto: 'Espárrago Verde',
      ruta: 'Callao → Long Beach',
      estado: 'cargado',
      riesgo: 18,
    },
  },
];

// ---------- Lots ----------
const lots: GraphNodeData[] = [
  // S-8842 — three lots (the richest cluster)
  { id: 'L-1001', kind: 'Lot', label: 'L-1001', meta: { variedad: 'Arándano', calibre: '14-16mm', brix: 13.2 } },
  { id: 'L-1002', kind: 'Lot', label: 'L-1002', meta: { variedad: 'Arándano', calibre: '12-14mm', brix: 12.8 } },
  { id: 'L-1004', kind: 'Lot', label: 'L-1004', meta: { variedad: 'Arándano', calibre: '14-16mm', brix: 11.2 } },
  // S-8843
  { id: 'L-2001', kind: 'Lot', label: 'L-2001', meta: { variedad: 'Uva Red Globe', calibre: '20-22mm', brix: 17.1 } },
  { id: 'L-2003', kind: 'Lot', label: 'L-2003', meta: { variedad: 'Uva Red Globe', calibre: '18-20mm', brix: 16.4 } },
  // S-8844
  { id: 'L-1007', kind: 'Lot', label: 'L-1007', meta: { variedad: 'Palta Hass', calibre: '65mm', dryMatter: 24.2 } },
  { id: 'L-1009', kind: 'Lot', label: 'L-1009', meta: { variedad: 'Palta Hass', calibre: '70mm', dryMatter: 23.1 } },
  // S-8845
  { id: 'L-1005', kind: 'Lot', label: 'L-1005', meta: { variedad: 'Arándano', calibre: '12-14mm', brix: 12.6 } },
  { id: 'L-1006', kind: 'Lot', label: 'L-1006', meta: { variedad: 'Arándano', calibre: '14-16mm', brix: 13.0 } },
  // S-8846
  { id: 'L-1010', kind: 'Lot', label: 'L-1010', meta: { variedad: 'Mango Kent', calibre: '11.5cm', brix: 16.4 } },
  { id: 'L-1011', kind: 'Lot', label: 'L-1011', meta: { variedad: 'Mango Kent', calibre: '10.8cm', brix: 14.8 } },
  // S-8847
  { id: 'L-3001', kind: 'Lot', label: 'L-3001', meta: { variedad: 'Espárrago Verde', calibre: 'XL', humedad: 92 } },
];

// ---------- Containers ----------
const containers: GraphNodeData[] = [
  { id: 'CT-REEF-7724', kind: 'Container', label: 'REEF-7724', meta: { tipo: '40RH', setPoint: 0.5, naviera: 'Maersk' } },
  { id: 'CT-REEF-7811', kind: 'Container', label: 'REEF-7811', meta: { tipo: '40RH', setPoint: -0.5, naviera: 'Hapag-Lloyd' } },
  { id: 'CT-REEF-7903', kind: 'Container', label: 'REEF-7903', meta: { tipo: '40RH', setPoint: 5, naviera: 'CMA CGM' } },
  { id: 'CT-REEF-7950', kind: 'Container', label: 'REEF-7950', meta: { tipo: '40RH', setPoint: 0.5, naviera: 'Maersk' } },
  { id: 'CT-REEF-8012', kind: 'Container', label: 'REEF-8012', meta: { tipo: '40RH', setPoint: 8, naviera: 'ONE' } },
  { id: 'CT-REEF-8077', kind: 'Container', label: 'REEF-8077', meta: { tipo: '40RH', setPoint: 4, naviera: 'Hapag-Lloyd' } },
];

// ---------- Sensors ----------
const sensors: GraphNodeData[] = [
  { id: 'SN-7724-A', kind: 'Sensor', label: 'SN-7724-A', meta: { tipo: 'temperatura', fabricante: 'Sensitech' } },
  { id: 'SN-7811-A', kind: 'Sensor', label: 'SN-7811-A', meta: { tipo: 'temperatura', fabricante: 'Sensitech' } },
  { id: 'SN-7903-A', kind: 'Sensor', label: 'SN-7903-A', meta: { tipo: 'temperatura', fabricante: 'Emerson' } },
  { id: 'SN-7950-A', kind: 'Sensor', label: 'SN-7950-A', meta: { tipo: 'temperatura', fabricante: 'Sensitech' } },
  { id: 'SN-8012-A', kind: 'Sensor', label: 'SN-8012-A', meta: { tipo: 'temperatura', fabricante: 'Carrier' } },
  { id: 'SN-8077-A', kind: 'Sensor', label: 'SN-8077-A', meta: { tipo: 'temperatura', fabricante: 'Emerson' } },
];

// ---------- TempEvents ----------
const tempEvents: GraphNodeData[] = [
  {
    id: 'TE-8842-01',
    kind: 'TempEvent',
    label: 'Excursión +5.8°C',
    meta: {
      embarque: 'S-8842',
      inicio: '2026-05-12 14:22',
      duracion: '2h 04min',
      pico: '+5.8°C',
      rangoOptimo: '−1°C a +1°C',
      severidad: 'severa',
    },
  },
  {
    id: 'TE-8844-01',
    kind: 'TempEvent',
    label: 'Excursión +1.4°C',
    meta: {
      embarque: 'S-8844',
      inicio: '2026-05-13 03:11',
      duracion: '38 min',
      pico: '+1.4°C',
      rangoOptimo: '+4°C a +6°C',
      severidad: 'leve',
    },
  },
  {
    id: 'TE-8846-01',
    kind: 'TempEvent',
    label: 'Excursión +2.1°C',
    meta: {
      embarque: 'S-8846',
      inicio: '2026-05-14 09:45',
      duracion: '1h 12min',
      pico: '+2.1°C',
      rangoOptimo: '+7°C a +9°C',
      severidad: 'moderada',
    },
  },
];

// ---------- Claims ----------
const claims: GraphNodeData[] = [
  {
    id: 'CL-8842',
    kind: 'Claim',
    label: 'CL-8842',
    meta: { embarque: 'S-8842', cliente: 'Walmart US', monto: '$48,200', tipo: 'calidad/temperatura', estado: 'abierto' },
  },
  {
    id: 'CL-7991',
    kind: 'Claim',
    label: 'CL-7991',
    meta: { embarque: 'S-7991', cliente: 'Walmart US', monto: '$12,400', tipo: 'calibre', estado: 'resuelto' },
  },
  {
    id: 'CL-8030',
    kind: 'Claim',
    label: 'CL-8030',
    meta: { embarque: 'S-8030', cliente: 'Mercadona ES', monto: '$22,800', tipo: 'documentación', estado: 'en-investigación' },
  },
];

// ---------- Routes ----------
const routes: GraphNodeData[] = [
  { id: 'R-CLP', kind: 'Route', label: 'Callao → Philadelphia', meta: { transitoDias: 16, distanciaMillas: 3850 } },
  { id: 'R-CLF', kind: 'Route', label: 'Callao → Felixstowe', meta: { transitoDias: 28, distanciaMillas: 6420 } },
  { id: 'R-CLA', kind: 'Route', label: 'Callao → Algeciras', meta: { transitoDias: 22, distanciaMillas: 5380 } },
  { id: 'R-CLLB', kind: 'Route', label: 'Callao → Long Beach', meta: { transitoDias: 12, distanciaMillas: 4220 } },
];

// ---------- Ports ----------
const ports: GraphNodeData[] = [
  { id: 'PT-CALLAO', kind: 'Port', label: 'Callao', meta: { pais: 'Perú', codigo: 'PECLL' } },
  { id: 'PT-PHILA', kind: 'Port', label: 'Philadelphia', meta: { pais: 'Estados Unidos', codigo: 'USPHL' } },
  { id: 'PT-FELIX', kind: 'Port', label: 'Felixstowe', meta: { pais: 'Reino Unido', codigo: 'GBFXT' } },
  { id: 'PT-ALG', kind: 'Port', label: 'Algeciras', meta: { pais: 'España', codigo: 'ESALG' } },
  { id: 'PT-LB', kind: 'Port', label: 'Long Beach', meta: { pais: 'Estados Unidos', codigo: 'USLGB' } },
];

// ---------- Documents (S-8842 carpeta de defensa) ----------
const documents: GraphNodeData[] = [
  { id: 'D-QC-8842-A', kind: 'Document', label: 'QC Cosecha · L-1001', meta: { tipo: 'QC report', size: '412 KB', fecha: '2026-05-08' } },
  { id: 'D-QC-8842-B', kind: 'Document', label: 'QC Packing · L-1002', meta: { tipo: 'QC report', size: '378 KB', fecha: '2026-05-09' } },
  { id: 'D-QC-8842-C', kind: 'Document', label: 'QC Frío · L-1004', meta: { tipo: 'QC report', size: '441 KB', fecha: '2026-05-11' } },
  { id: 'D-PH-8842-A', kind: 'Document', label: 'Foto pre-zarpe', meta: { tipo: 'foto', size: '2.1 MB', fecha: '2026-05-12' } },
  { id: 'D-PH-8842-B', kind: 'Document', label: 'Foto post-llegada', meta: { tipo: 'foto', size: '2.4 MB', fecha: '2026-05-14' } },
  { id: 'D-DEF-8842', kind: 'Document', label: 'Carpeta defensa CL-8842', meta: { tipo: 'defensa', size: '6.8 MB', fecha: '2026-05-14' } },
];

export const GRAPH_NODES: GraphNodeData[] = [
  ...customers,
  ...accountManagers,
  ...products,
  ...shipments,
  ...lots,
  ...containers,
  ...sensors,
  ...tempEvents,
  ...claims,
  ...routes,
  ...ports,
  ...documents,
];

// ---------- Edges ----------
function edge(id: string, source: string, target: string, kind: EdgeKind): GraphEdgeData {
  return { id, source, target, kind };
}

export const GRAPH_EDGES: GraphEdgeData[] = [
  // MANAGES — Account Managers → Customers
  edge('e-am-1', 'AM-CMENDOZA', 'C-WALMART', 'MANAGES'),
  edge('e-am-2', 'AM-ATORRES', 'C-TESCO', 'MANAGES'),
  edge('e-am-3', 'AM-DRAMOS', 'C-MERCADONA', 'MANAGES'),

  // RECEIVES — Customer → Shipment
  edge('e-rc-1', 'C-WALMART', 'S-8842', 'RECEIVES'),
  edge('e-rc-2', 'C-WALMART', 'S-8846', 'RECEIVES'),
  edge('e-rc-3', 'C-TESCO', 'S-8843', 'RECEIVES'),
  edge('e-rc-4', 'C-MERCADONA', 'S-8844', 'RECEIVES'),
  edge('e-rc-5', 'C-COSTCO', 'S-8845', 'RECEIVES'),
  edge('e-rc-6', 'C-COSTCO', 'S-8847', 'RECEIVES'),

  // CONTAINS — Shipment → Lot
  edge('e-co-1', 'S-8842', 'L-1001', 'CONTAINS'),
  edge('e-co-2', 'S-8842', 'L-1002', 'CONTAINS'),
  edge('e-co-3', 'S-8842', 'L-1004', 'CONTAINS'),
  edge('e-co-4', 'S-8843', 'L-2001', 'CONTAINS'),
  edge('e-co-5', 'S-8843', 'L-2003', 'CONTAINS'),
  edge('e-co-6', 'S-8844', 'L-1007', 'CONTAINS'),
  edge('e-co-7', 'S-8844', 'L-1009', 'CONTAINS'),
  edge('e-co-8', 'S-8845', 'L-1005', 'CONTAINS'),
  edge('e-co-9', 'S-8845', 'L-1006', 'CONTAINS'),
  edge('e-co-10', 'S-8846', 'L-1010', 'CONTAINS'),
  edge('e-co-11', 'S-8846', 'L-1011', 'CONTAINS'),
  edge('e-co-12', 'S-8847', 'L-3001', 'CONTAINS'),

  // OF_PRODUCT — Lot → Product
  edge('e-op-1', 'L-1001', 'P-ARANDANO', 'OF_PRODUCT'),
  edge('e-op-2', 'L-1002', 'P-ARANDANO', 'OF_PRODUCT'),
  edge('e-op-3', 'L-1004', 'P-ARANDANO', 'OF_PRODUCT'),
  edge('e-op-4', 'L-1005', 'P-ARANDANO', 'OF_PRODUCT'),
  edge('e-op-5', 'L-1006', 'P-ARANDANO', 'OF_PRODUCT'),
  edge('e-op-6', 'L-2001', 'P-UVA', 'OF_PRODUCT'),
  edge('e-op-7', 'L-2003', 'P-UVA', 'OF_PRODUCT'),
  edge('e-op-8', 'L-1007', 'P-PALTA', 'OF_PRODUCT'),
  edge('e-op-9', 'L-1009', 'P-PALTA', 'OF_PRODUCT'),
  edge('e-op-10', 'L-1010', 'P-MANGO', 'OF_PRODUCT'),
  edge('e-op-11', 'L-1011', 'P-MANGO', 'OF_PRODUCT'),
  edge('e-op-12', 'L-3001', 'P-ESPARRAGO', 'OF_PRODUCT'),

  // USES — Shipment → Container
  edge('e-us-1', 'S-8842', 'CT-REEF-7724', 'USES'),
  edge('e-us-2', 'S-8843', 'CT-REEF-7811', 'USES'),
  edge('e-us-3', 'S-8844', 'CT-REEF-7903', 'USES'),
  edge('e-us-4', 'S-8845', 'CT-REEF-7950', 'USES'),
  edge('e-us-5', 'S-8846', 'CT-REEF-8012', 'USES'),
  edge('e-us-6', 'S-8847', 'CT-REEF-8077', 'USES'),

  // MONITORED_BY — Container → Sensor
  edge('e-mb-1', 'CT-REEF-7724', 'SN-7724-A', 'MONITORED_BY'),
  edge('e-mb-2', 'CT-REEF-7811', 'SN-7811-A', 'MONITORED_BY'),
  edge('e-mb-3', 'CT-REEF-7903', 'SN-7903-A', 'MONITORED_BY'),
  edge('e-mb-4', 'CT-REEF-7950', 'SN-7950-A', 'MONITORED_BY'),
  edge('e-mb-5', 'CT-REEF-8012', 'SN-8012-A', 'MONITORED_BY'),
  edge('e-mb-6', 'CT-REEF-8077', 'SN-8077-A', 'MONITORED_BY'),

  // GENERATED — Sensor → TempEvent
  edge('e-ge-1', 'SN-7724-A', 'TE-8842-01', 'GENERATED'),
  edge('e-ge-2', 'SN-7903-A', 'TE-8844-01', 'GENERATED'),
  edge('e-ge-3', 'SN-8012-A', 'TE-8846-01', 'GENERATED'),

  // TRIGGERED — TempEvent → Claim
  edge('e-tr-1', 'TE-8842-01', 'CL-8842', 'TRIGGERED'),

  // FILED_BY — Claim → Customer
  edge('e-fb-1', 'CL-8842', 'C-WALMART', 'FILED_BY'),
  edge('e-fb-2', 'CL-7991', 'C-WALMART', 'FILED_BY'),
  edge('e-fb-3', 'CL-8030', 'C-MERCADONA', 'FILED_BY'),

  // ABOUT — Claim → Shipment
  edge('e-ab-1', 'CL-8842', 'S-8842', 'ABOUT'),

  // FOLLOWS — Shipment → Route
  edge('e-fl-1', 'S-8842', 'R-CLP', 'FOLLOWS'),
  edge('e-fl-2', 'S-8843', 'R-CLF', 'FOLLOWS'),
  edge('e-fl-3', 'S-8844', 'R-CLA', 'FOLLOWS'),
  edge('e-fl-4', 'S-8845', 'R-CLLB', 'FOLLOWS'),
  edge('e-fl-5', 'S-8846', 'R-CLP', 'FOLLOWS'),
  edge('e-fl-6', 'S-8847', 'R-CLLB', 'FOLLOWS'),

  // ORIGIN / DESTINATION — Route → Port
  edge('e-or-1', 'R-CLP', 'PT-CALLAO', 'ORIGIN'),
  edge('e-de-1', 'R-CLP', 'PT-PHILA', 'DESTINATION'),
  edge('e-or-2', 'R-CLF', 'PT-CALLAO', 'ORIGIN'),
  edge('e-de-2', 'R-CLF', 'PT-FELIX', 'DESTINATION'),
  edge('e-or-3', 'R-CLA', 'PT-CALLAO', 'ORIGIN'),
  edge('e-de-3', 'R-CLA', 'PT-ALG', 'DESTINATION'),
  edge('e-or-4', 'R-CLLB', 'PT-CALLAO', 'ORIGIN'),
  edge('e-de-4', 'R-CLLB', 'PT-LB', 'DESTINATION'),

  // ATTACHED — Document → Shipment (S-8842 defense folder)
  edge('e-at-1', 'D-QC-8842-A', 'S-8842', 'ATTACHED'),
  edge('e-at-2', 'D-QC-8842-B', 'S-8842', 'ATTACHED'),
  edge('e-at-3', 'D-QC-8842-C', 'S-8842', 'ATTACHED'),
  edge('e-at-4', 'D-PH-8842-A', 'S-8842', 'ATTACHED'),
  edge('e-at-5', 'D-PH-8842-B', 'S-8842', 'ATTACHED'),
  edge('e-at-6', 'D-DEF-8842', 'CL-8842', 'ATTACHED'),
];

// Convenience: ontology-mode graph (one node per kind + canonical edges).
import { ALL_NODE_KINDS, EDGE_META, ALL_EDGE_KINDS } from '../ontology/schema';
import { getNodeLabelES } from '../ontology/schema';

export const ONTOLOGY_NODES: GraphNodeData[] = ALL_NODE_KINDS.map((kind) => ({
  id: `O-${kind}`,
  kind,
  label: getNodeLabelES(kind),
}));

export const ONTOLOGY_EDGES: GraphEdgeData[] = ALL_EDGE_KINDS.flatMap((kind) => {
  const meta = EDGE_META[kind];
  if (meta.to === 'Any') {
    // ATTACHED has no fixed target — render as Document → Shipment as the
    // canonical visual example, mirrored from the instance graph.
    return [
      { id: `oe-${kind}`, source: `O-${meta.from}`, target: 'O-Shipment', kind },
    ];
  }
  return [
    { id: `oe-${kind}`, source: `O-${meta.from}`, target: `O-${meta.to}`, kind },
  ];
});
