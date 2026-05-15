import type { ReactNode } from 'react';

// === Zone & View Types ===
export type PipelineZone =
  | 'cosecha'
  | 'seleccion'
  | 'packing'
  | 'frio'
  | 'embarque'
  | 'transito'
  | 'llegada';

export type ViewMode = 'pipeline' | 'zone' | 'object';

export type DataFlowType =
  | 'trazabilidad'
  | 'temperatura'
  | 'documentos'
  | 'senales'
  | 'reclamos';

export type BadgeVariant = 'good' | 'warn' | 'bad' | 'info';

export type SignalSource = 'internal' | 'market' | 'client' | 'regulatory';

export type ClaimStatus = 'open' | 'investigating' | 'resolved' | 'closed';

export type DefenseItemStatus = 'ready' | 'draft' | 'missing';

export type NavViewId =
  | 'comando'
  | 'operador'
  | 'cuentas'
  | 'calidad'
  | 'frio'
  | 'radar'
  | 'social'
  | 'grafo'
  | 'config';

export type Variedad = 'arandano' | 'uva' | 'palta' | 'mango' | 'citricos';

export type EmbarqueStatus =
  | 'en-camara'
  | 'cargado'
  | 'en-transito'
  | 'en-puerto'
  | 'entregado';

export type ClienteSegmento = 'premium' | 'standard' | 'emergente';

export type ReclamoTipo =
  | 'calidad'
  | 'temperatura'
  | 'calibre'
  | 'documentacion'
  | 'demora';

export type SenalTipo = 'riesgo' | 'mercado' | 'calidad' | 'regulatorio';

// === Domain Entities ===
export interface Lote {
  id: string;
  parcela: string;
  variedad: Variedad;
  calibre: string;
  brix: number;
  dryMatter: number;
  fechaCosecha: string; // ISO date
  riskScore: number; // 0-100
  zone: PipelineZone;
  embarqueId?: string;
}

export interface Embarque {
  id: string;
  contenedor: string;
  naviera: string;
  setPointTemp: number;
  fechaZarpe: string;
  eta: string;
  clienteId: string;
  loteIds: string[];
  status: EmbarqueStatus;
  riskScore: number;
  currentZone: PipelineZone;
}

export interface Cliente {
  id: string;
  nombre: string;
  pais: string;
  segmento: ClienteSegmento;
  score: number; // 0-100
  preferencias: string[];
  totalReclamos: number;
  totalEmbarques: number;
  montoReclamosUsd: number;
}

export interface Reclamo {
  id: string;
  embarqueId: string;
  clienteId: string;
  tipo: ReclamoTipo;
  monto: number;
  fecha: string;
  status: ClaimStatus;
  evidenciaUrls: string[];
  descripcion: string;
}

export interface Temperatura {
  id: string;
  embarqueId: string;
  timestamp: string;
  valor: number;
  sensorId: string;
  zona: PipelineZone;
}

export interface Senal {
  id: string;
  tipo: SenalTipo;
  fuente: SignalSource;
  score: number; // 0-100
  titulo: string;
  descripcion: string;
  accion: string;
  fecha: string;
}

// === UI Data Types ===
export interface KpiData {
  id: string;
  label: string;
  value: string;
  badge: string;
  badgeVariant: BadgeVariant;
  icon: string; // Lucide icon name
}

export interface ClaimDefenseItem {
  id: string;
  nombre: string;
  fuente: string;
  status: DefenseItemStatus;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'bot';
  text: string;
  timestamp: string;
}

// === 3D Types ===
export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface Size3 {
  w: number;
  h: number;
  d: number;
}

export interface ZoneConfig {
  id: PipelineZone;
  label: string; // Spanish display name
  description: string; // Spanish description
  position: Vec3;
  size: Size3;
  color: string; // hex
  accentColor: string; // hex for lighting
}

export interface LayerVisibility {
  flow: boolean;
  temperatura: boolean;
  riesgo: boolean;
  documentos: boolean;
  senales: boolean;
  grafo: boolean;
}

export interface NavItem {
  id: NavViewId;
  label: string;
  iconName: string;
}

// === Decision Intelligence (Phase 2) ===
export type RiskLevel = 'BAJO' | 'MEDIO' | 'ALTO' | 'CRÍTICO';
export type FichaTargetType = 'zone' | 'embarque' | 'lote';
export type DecisionUrgencia = 'alta' | 'media' | 'baja';
export type DataConfidence = 'high' | 'medium' | 'low';

export interface FichaResponsable {
  nombre: string;
  rol: string;
  avatar?: string;
}

export interface FichaImpacto {
  valorEmbarque: number;
  probabilidadReclamo: number; // 0-1
  montoEstimado: number;
  moneda?: string;
}

export interface FichaOperativa {
  id: string;
  targetType: FichaTargetType;
  targetId: string;
  zona: PipelineZone;
  riskScore: number; // 0-100
  riskLabel: RiskLevel;
  titulo: string;
  resumenRiesgo: string;
  causasProbables: string[];
  accionesRecomendadas: string[];
  responsable: FichaResponsable;
  impacto: FichaImpacto;
}

export interface DecisionPendiente {
  id: string;
  urgencia: DecisionUrgencia;
  descripcion: string;
  fichaId: string;
  responsable: string;
  deadline: string; // ISO date
}

export interface DataSourceInfo {
  source: string;
  timestamp: string; // ISO
  confidence: DataConfidence;
  isMock?: boolean;
}

// === Packing Operations (Phase 3) ===
export interface PackingLineStatus {
  id: string;
  linea: string;
  turno: 'dia' | 'noche';
  variedad: string;
  cajasHora: number;
  cajasHoraTarget: number;
  rendimientoPct: number;
  velocidadLinea: number;
  cajasProducidas: number;
  kgEntrada: number;
  kgSalida: number;
  horaInicio: string;
  estado: 'activa' | 'pausa' | 'detenida' | 'mantenimiento';
}

export interface PackingLoteProcess {
  id: string;
  loteId: string;
  variedad: string;
  calibre: string;
  horaEntrada: string;
  horaSalida?: string;
  cajasProducidas: number;
  rendimientoPct: number;
  descartePct: number;
  defectos: string[];
}

// === Quality Control (Phase 3) ===
export interface QCInspeccion {
  id: string;
  loteId: string;
  variedad: string;
  fecha: string;
  inspector: string;
  brix: number;
  firmeza: number;
  calibrePromedio: number;
  calibreDistribucion: { rango: string; porcentaje: number }[];
  defectosPct: number;
  defectosTipo: { tipo: string; porcentaje: number }[];
  resultado: 'aprobado' | 'aprobado-condicional' | 'rechazado';
  notas: string;
}

export interface VarietyBenchmark {
  variedad: string;
  brixMin: number;
  brixMax: number;
  brixOptimo: number;
  firmezaMin: number;
  firmezaMax: number;
  firmezaOptimo: number;
  calibreRango: string;
  tempOptima: number;
  tempTolerance: number;
  vidaUtilDias: number;
}

// === Cold Chain (Phase 3) ===
export interface CamaraFrioStatus {
  id: string;
  nombre: string;
  tempActual: number;
  setPoint: number;
  deltaTemp: number;
  humedadPct: number;
  palletsActuales: number;
  palletsCapacidad: number;
  horasOperacion: number;
  estado: 'normal' | 'alerta' | 'critico' | 'apagada';
  ultimaLectura: string;
}

export interface ExcursionEvent {
  id: string;
  fecha: string;
  ubicacion: string;
  duracion: string;
  tempMax: number;
  productoAfectado: string;
  impacto: 'leve' | 'moderado' | 'severo';
  accionTomada: string;
}

// === Widget Types (Phase 3) ===
export interface ColumnDef {
  key: string;
  label: string;
  sortable?: boolean;
  type?: 'text' | 'number' | 'date' | 'badge' | 'mini-gauge';
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: unknown, row: unknown) => ReactNode;
}

export interface GaugeColorZones {
  green: [number, number];
  amber: [number, number];
  red: [number, number];
}
