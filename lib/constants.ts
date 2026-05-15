import type {
  DataFlowType,
  LayerVisibility,
  NavItem,
  PipelineZone,
  Size3,
  Vec3,
  ZoneConfig,
} from './types';

export const ZONE_CONFIGS: ZoneConfig[] = [
  {
    id: 'cosecha',
    label: 'Cosecha',
    description:
      'Recolección en parcela. Cuadrillas, lotes recién cortados y registro de origen.',
    position: { x: -30, y: 0, z: 0 },
    size: { w: 8, h: 4, d: 8 },
    color: '#2D5A1E',
    accentColor: '#4CAF50',
  },
  {
    id: 'seleccion',
    label: 'Selección',
    description:
      'Línea de selección. Calibre, color y descarte de fruta no apta para exportación.',
    position: { x: -20, y: 0, z: 0 },
    size: { w: 8, h: 3, d: 6 },
    color: '#5D4E37',
    accentColor: '#D4A843',
  },
  {
    id: 'packing',
    label: 'Packing',
    description:
      'Empaque y etiquetado. Clamshells, cajas master y trazabilidad por lote.',
    position: { x: -10, y: 0, z: 0 },
    size: { w: 8, h: 3, d: 6 },
    color: '#3E2723',
    accentColor: '#FF8800',
  },
  {
    id: 'frio',
    label: 'Frío',
    description:
      'Cámara de frío. Pre-enfriamiento y mantenimiento de cadena de frío antes de embarque.',
    position: { x: 0, y: 0, z: 0 },
    size: { w: 8, h: 5, d: 8 },
    color: '#1A3A5C',
    accentColor: '#4488FF',
  },
  {
    id: 'embarque',
    label: 'Embarque',
    description:
      'Carga en contenedor reefer. Set point, sellos y documentación de exportación.',
    position: { x: 10, y: 0, z: 0 },
    size: { w: 10, h: 4, d: 6 },
    color: '#4A3728',
    accentColor: '#FF8800',
  },
  {
    id: 'transito',
    label: 'Tránsito',
    description:
      'Transporte marítimo. Monitoreo de loggers, naviera y eventos durante la travesía.',
    position: { x: 20, y: 0, z: 0 },
    size: { w: 12, h: 4, d: 8 },
    color: '#1B3A4B',
    accentColor: '#4488FF',
  },
  {
    id: 'llegada',
    label: 'Llegada',
    description:
      'Puerto destino. Inspección, descarga y entrega final al cliente.',
    position: { x: 32, y: 0, z: 0 },
    size: { w: 8, h: 3, d: 6 },
    color: '#1A5C3A',
    accentColor: '#2D8B5E',
  },
];

// Convenience lookups
export const ZONE_POSITIONS: Record<PipelineZone, Vec3> = Object.fromEntries(
  ZONE_CONFIGS.map((z) => [z.id, z.position]),
) as Record<PipelineZone, Vec3>;

export const ZONE_SIZES: Record<PipelineZone, Size3> = Object.fromEntries(
  ZONE_CONFIGS.map((z) => [z.id, z.size]),
) as Record<PipelineZone, Size3>;

export const ZONE_COLORS: Record<PipelineZone, string> = Object.fromEntries(
  ZONE_CONFIGS.map((z) => [z.id, z.color]),
) as Record<PipelineZone, string>;

export const ZONE_ACCENTS: Record<PipelineZone, string> = Object.fromEntries(
  ZONE_CONFIGS.map((z) => [z.id, z.accentColor]),
) as Record<PipelineZone, string>;

export const ZONE_LABELS: Record<PipelineZone, string> = Object.fromEntries(
  ZONE_CONFIGS.map((z) => [z.id, z.label]),
) as Record<PipelineZone, string>;

export const ZONE_ORDER: PipelineZone[] = ZONE_CONFIGS.map((z) => z.id);

export const PARTICLE_COLORS: Record<DataFlowType, string> = {
  trazabilidad: '#1A5C3A',
  temperatura: '#FF4444',
  documentos: '#D4A843',
  senales: '#6B5CE7',
  reclamos: '#FF8800',
};

export const NAV_ITEMS: NavItem[] = [
  { id: 'comando', label: 'Centro de Comando', iconName: 'Gauge' },
  { id: 'operador', label: 'Operador Diario', iconName: 'MessageSquareText' },
  { id: 'cuentas', label: 'Cuentas', iconName: 'UsersRound' },
  { id: 'calidad', label: 'Calidad', iconName: 'PackageCheck' },
  { id: 'frio', label: 'Cadena de Frío', iconName: 'Thermometer' },
  { id: 'radar', label: 'Radar de Señales', iconName: 'Radar' },
  { id: 'social', label: 'Escucha Social', iconName: 'Ear' },
  { id: 'grafo', label: 'Inteligencia de Grafo', iconName: 'Network' },
  { id: 'config', label: 'Configuración', iconName: 'Settings' },
];

export const DEFAULT_LAYER_VISIBILITY: LayerVisibility = {
  flow: true,
  temperatura: true,
  riesgo: true,
  documentos: false,
  senales: true,
  grafo: false,
};

export const BRAND_COLORS = {
  agroGreen: '#1A5C3A',
  harvestGold: '#D4A843',
  alertRed: '#FF4444',
  warningAmber: '#FF8800',
  coldBlue: '#4488FF',
  signalPurple: '#6B5CE7',
  darkBase: '#1A1A2E',
  lightSurface: '#F0F4EC',
} as const;
