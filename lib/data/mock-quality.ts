import type {
  GaugeColorZones,
  QCInspeccion,
  VarietyBenchmark,
} from '../types';

// ============================================================
//  Quality Control mock data (T3 — Phase 3)
//  All values calibrated to realistic Peruvian export-grade
//  ranges (SENASA / APHIS reference, Pro Hass, ProArándanos).
// ============================================================

export interface GaugeConfig {
  key:
    | 'brix'
    | 'firmeza'
    | 'calibre'
    | 'aprobacion'
    | 'materiaSeca'
    | 'acidez';
  label: string;
  value: number;
  min: number;
  max: number;
  target: number;
  unit: string;
  colorZones: GaugeColorZones;
  invertZones?: boolean;
}

export interface VarietyStats {
  inspeccionadosHoy: number;
  inspeccionadosDelta: number; // signed delta vs yesterday
  aprobados: number;
  aprobadosPct: number;
  rechazados: number;
  rechazadosNota?: string;
  condicional: number;
  condicionalNota?: string;
  defectosPromedio: number;
  defectosTarget: number;
  inspectoresActivos: number;
  inspectoresProgramados: number;
}

export interface TrendPoint {
  fecha: string; // ISO date
  valor: number;
}

export interface CalibreSlice {
  rango: string;
  porcentaje: number;
}

export interface DefectSlice {
  tipo: string;
  porcentaje: number;
}

// ---------- Variety colors (mirror VarietySelector palette) ----------
export const varietyColors: Record<string, string> = {
  Todos: '#8B949E',
  Arándano: '#6B21A8',
  Uva: '#2D6B30',
  Palta: '#1A5C3A',
  Mango: '#D4A843',
  Cítricos: '#FF8800',
};

// Color zones expressed as percentage of the gauge's [min..max] range.
// The CircularGauge interprets zones monotonically (ascending upper bound),
// so we pick thresholds that produce the right color band for typical
// export-grade values.

const BRIX_LIKE_ZONES: GaugeColorZones = {
  green: [0, 60],
  amber: [60, 85],
  red: [85, 100],
};

const APROB_ZONES: GaugeColorZones = {
  green: [0, 75],
  amber: [75, 90],
  red: [90, 100],
};

const DEFECTOS_ZONES: GaugeColorZones = {
  green: [0, 40],
  amber: [40, 70],
  red: [70, 100],
};

const MATERIA_SECA_ZONES: GaugeColorZones = {
  green: [0, 20],
  amber: [20, 40],
  red: [40, 45],
};

// ---------- Gauges per variety ----------
export const gaugeConfigByVariety: Record<string, GaugeConfig[]> = {
  Todos: [
    {
      key: 'aprobacion',
      label: 'Aprobación Global',
      value: 89.7,
      min: 0,
      max: 100,
      target: 95,
      unit: '%',
      colorZones: APROB_ZONES,
      invertZones: true,
    },
    {
      key: 'brix',
      label: 'Brix Promedio',
      value: 14.4,
      min: 8,
      max: 22,
      target: 14,
      unit: '°Bx',
      colorZones: BRIX_LIKE_ZONES,
    },
    {
      key: 'firmeza',
      label: 'Firmeza Promedio',
      value: 158,
      min: 50,
      max: 350,
      target: 170,
      unit: 'g/mm',
      colorZones: BRIX_LIKE_ZONES,
    },
    {
      key: 'calibre',
      label: 'Defectos Promedio',
      value: 4.8,
      min: 0,
      max: 15,
      target: 5,
      unit: '%',
      colorZones: DEFECTOS_ZONES,
    },
  ],
  Arándano: [
    {
      key: 'brix',
      label: 'Brix Promedio',
      value: 13.2,
      min: 8,
      max: 20,
      target: 12.5,
      unit: '°Bx',
      colorZones: { green: [0, 55], amber: [55, 80], red: [80, 100] },
    },
    {
      key: 'firmeza',
      label: 'Firmeza',
      value: 185,
      min: 50,
      max: 300,
      target: 170,
      unit: 'g/mm',
      colorZones: { green: [0, 65], amber: [65, 85], red: [85, 100] },
    },
    {
      key: 'calibre',
      label: 'Calibre Promedio',
      value: 14.8,
      min: 8,
      max: 22,
      target: 14,
      unit: 'mm',
      colorZones: { green: [0, 60], amber: [60, 80], red: [80, 100] },
    },
    {
      key: 'aprobacion',
      label: 'Tasa Aprobación',
      value: 92.5,
      min: 0,
      max: 100,
      target: 95,
      unit: '%',
      colorZones: APROB_ZONES,
      invertZones: true,
    },
  ],
  Uva: [
    {
      key: 'brix',
      label: 'Brix Promedio',
      value: 17.1,
      min: 14,
      max: 22,
      target: 16.5,
      unit: '°Bx',
      colorZones: BRIX_LIKE_ZONES,
    },
    {
      key: 'firmeza',
      label: 'Firmeza',
      value: 285,
      min: 200,
      max: 400,
      target: 270,
      unit: 'g/mm',
      colorZones: BRIX_LIKE_ZONES,
    },
    {
      key: 'calibre',
      label: 'Calibre Promedio',
      value: 20.2,
      min: 18,
      max: 26,
      target: 20,
      unit: 'mm',
      colorZones: BRIX_LIKE_ZONES,
    },
    {
      key: 'aprobacion',
      label: 'Tasa Aprobación',
      value: 94.1,
      min: 0,
      max: 100,
      target: 95,
      unit: '%',
      colorZones: APROB_ZONES,
      invertZones: true,
    },
  ],
  Palta: [
    {
      key: 'materiaSeca',
      label: 'Materia Seca',
      value: 23.8,
      min: 18,
      max: 30,
      target: 23,
      unit: '%',
      colorZones: MATERIA_SECA_ZONES,
      invertZones: true,
    },
    {
      key: 'firmeza',
      label: 'Firmeza',
      value: 72,
      min: 40,
      max: 130,
      target: 75,
      unit: 'N',
      colorZones: { green: [0, 50], amber: [50, 80], red: [80, 100] },
    },
    {
      key: 'calibre',
      label: 'Calibre Promedio',
      value: 65,
      min: 50,
      max: 90,
      target: 65,
      unit: 'mm',
      colorZones: { green: [0, 55], amber: [55, 80], red: [80, 100] },
    },
    {
      key: 'aprobacion',
      label: 'Tasa Aprobación',
      value: 88.5,
      min: 0,
      max: 100,
      target: 95,
      unit: '%',
      colorZones: APROB_ZONES,
      invertZones: true,
    },
  ],
  Mango: [
    {
      key: 'brix',
      label: 'Brix Promedio',
      value: 15.8,
      min: 12,
      max: 22,
      target: 15,
      unit: '°Bx',
      colorZones: BRIX_LIKE_ZONES,
    },
    {
      key: 'firmeza',
      label: 'Firmeza',
      value: 58,
      min: 30,
      max: 100,
      target: 60,
      unit: 'g/mm',
      colorZones: { green: [0, 60], amber: [60, 85], red: [85, 100] },
    },
    {
      key: 'calibre',
      label: 'Calibre Promedio',
      value: 11.2,
      min: 9,
      max: 14,
      target: 11,
      unit: 'cm',
      colorZones: BRIX_LIKE_ZONES,
    },
    {
      key: 'aprobacion',
      label: 'Tasa Aprobación',
      value: 82.3,
      min: 0,
      max: 100,
      target: 95,
      unit: '%',
      colorZones: APROB_ZONES,
      invertZones: true,
    },
  ],
  Cítricos: [
    {
      key: 'brix',
      label: 'Brix Promedio',
      value: 11.4,
      min: 9,
      max: 14,
      target: 11,
      unit: '°Bx',
      colorZones: BRIX_LIKE_ZONES,
    },
    {
      key: 'acidez',
      label: 'Acidez',
      value: 1.2,
      min: 0.5,
      max: 2.5,
      target: 1.1,
      unit: '%',
      colorZones: { green: [0, 50], amber: [50, 80], red: [80, 100] },
    },
    {
      key: 'calibre',
      label: 'Calibre Promedio',
      value: 72,
      min: 55,
      max: 80,
      target: 70,
      unit: 'mm',
      colorZones: { green: [0, 75], amber: [75, 90], red: [90, 100] },
    },
    {
      key: 'aprobacion',
      label: 'Tasa Aprobación',
      value: 91.0,
      min: 0,
      max: 100,
      target: 95,
      unit: '%',
      colorZones: APROB_ZONES,
      invertZones: true,
    },
  ],
};

// ---------- Daily stats per variety ----------
export const varietyStatsByVariety: Record<string, VarietyStats> = {
  Todos: {
    inspeccionadosHoy: 18,
    inspeccionadosDelta: 3,
    aprobados: 15,
    aprobadosPct: 83.3,
    rechazados: 1,
    rechazadosNota: 'Palta L-1008',
    condicional: 2,
    condicionalNota: 'Firmeza al límite',
    defectosPromedio: 4.8,
    defectosTarget: 5,
    inspectoresActivos: 3,
    inspectoresProgramados: 4,
  },
  Arándano: {
    inspeccionadosHoy: 6,
    inspeccionadosDelta: 1,
    aprobados: 5,
    aprobadosPct: 83.3,
    rechazados: 0,
    condicional: 1,
    condicionalNota: 'Lote L-1004 — Brix bajo',
    defectosPromedio: 3.8,
    defectosTarget: 5,
    inspectoresActivos: 1,
    inspectoresProgramados: 1,
  },
  Uva: {
    inspeccionadosHoy: 5,
    inspeccionadosDelta: 2,
    aprobados: 5,
    aprobadosPct: 100,
    rechazados: 0,
    condicional: 0,
    defectosPromedio: 2.9,
    defectosTarget: 5,
    inspectoresActivos: 1,
    inspectoresProgramados: 1,
  },
  Palta: {
    inspeccionadosHoy: 3,
    inspeccionadosDelta: 0,
    aprobados: 2,
    aprobadosPct: 66.7,
    rechazados: 1,
    rechazadosNota: 'L-1008 — MS 19.4%',
    condicional: 0,
    defectosPromedio: 8.2,
    defectosTarget: 5,
    inspectoresActivos: 1,
    inspectoresProgramados: 1,
  },
  Mango: {
    inspeccionadosHoy: 2,
    inspeccionadosDelta: 0,
    aprobados: 1,
    aprobadosPct: 50,
    rechazados: 0,
    condicional: 1,
    condicionalNota: 'L-1011 — Antracnosis incipiente',
    defectosPromedio: 6.5,
    defectosTarget: 5,
    inspectoresActivos: 0,
    inspectoresProgramados: 1,
  },
  Cítricos: {
    inspeccionadosHoy: 2,
    inspeccionadosDelta: 0,
    aprobados: 2,
    aprobadosPct: 100,
    rechazados: 0,
    condicional: 0,
    defectosPromedio: 4.1,
    defectosTarget: 5,
    inspectoresActivos: 1,
    inspectoresProgramados: 1,
  },
};

// ---------- QC inspections (12 rows) ----------
const today = '2026-05-15';
const yesterday = '2026-05-14';

export const mockQCInspecciones: QCInspeccion[] = [
  {
    id: 'QC-001',
    loteId: 'L-1001',
    variedad: 'Arándano',
    fecha: `${today}T07:42:00-05:00`,
    inspector: 'María Quispe',
    brix: 13.8,
    firmeza: 198,
    calibrePromedio: 15.2,
    calibreDistribucion: [
      { rango: '10-12', porcentaje: 4 },
      { rango: '12-14', porcentaje: 18 },
      { rango: '14-16', porcentaje: 52 },
      { rango: '16-18', porcentaje: 22 },
      { rango: '18+', porcentaje: 4 },
    ],
    defectosPct: 3.1,
    defectosTipo: [
      { tipo: 'Blandura', porcentaje: 45 },
      { tipo: 'Color', porcentaje: 25 },
      { tipo: 'Otros', porcentaje: 30 },
    ],
    resultado: 'aprobado',
    notas: 'Calibre excelente, firmeza por encima del estándar.',
  },
  {
    id: 'QC-002',
    loteId: 'L-1002',
    variedad: 'Arándano',
    fecha: `${today}T08:15:00-05:00`,
    inspector: 'María Quispe',
    brix: 12.6,
    firmeza: 172,
    calibrePromedio: 14.1,
    calibreDistribucion: [
      { rango: '10-12', porcentaje: 8 },
      { rango: '12-14', porcentaje: 34 },
      { rango: '14-16', porcentaje: 41 },
      { rango: '16-18', porcentaje: 14 },
      { rango: '18+', porcentaje: 3 },
    ],
    defectosPct: 4.2,
    defectosTipo: [
      { tipo: 'Blandura', porcentaje: 50 },
      { tipo: 'Deshidratación', porcentaje: 30 },
      { tipo: 'Otros', porcentaje: 20 },
    ],
    resultado: 'aprobado',
    notas: 'Brix dentro del rango, lote uniforme.',
  },
  {
    id: 'QC-003',
    loteId: 'L-1004',
    variedad: 'Arándano',
    fecha: `${today}T09:33:00-05:00`,
    inspector: 'Carlos Ñahui',
    brix: 11.2,
    firmeza: 158,
    calibrePromedio: 13.6,
    calibreDistribucion: [
      { rango: '8-10', porcentaje: 3 },
      { rango: '10-12', porcentaje: 18 },
      { rango: '12-14', porcentaje: 44 },
      { rango: '14-16', porcentaje: 28 },
      { rango: '16-18', porcentaje: 7 },
    ],
    defectosPct: 4.8,
    defectosTipo: [
      { tipo: 'Blandura', porcentaje: 55 },
      { tipo: 'Deshidratación', porcentaje: 25 },
      { tipo: 'Daño mecánico', porcentaje: 20 },
    ],
    resultado: 'aprobado-condicional',
    notas: 'Brix al borde inferior. Recomendado destino mercado UE (no Asia).',
  },
  {
    id: 'QC-004',
    loteId: 'L-2001',
    variedad: 'Uva',
    fecha: `${today}T07:10:00-05:00`,
    inspector: 'Diego Ramos',
    brix: 17.8,
    firmeza: 312,
    calibrePromedio: 21.4,
    calibreDistribucion: [
      { rango: '16-18', porcentaje: 4 },
      { rango: '18-20', porcentaje: 14 },
      { rango: '20-22', porcentaje: 48 },
      { rango: '22-24', porcentaje: 28 },
      { rango: '24+', porcentaje: 6 },
    ],
    defectosPct: 2.4,
    defectosTipo: [
      { tipo: 'Desgrane', porcentaje: 40 },
      { tipo: 'Color', porcentaje: 35 },
      { tipo: 'Otros', porcentaje: 25 },
    ],
    resultado: 'aprobado',
    notas: 'Red Globe premium — apto premium Asia.',
  },
  {
    id: 'QC-005',
    loteId: 'L-2003',
    variedad: 'Uva',
    fecha: `${today}T08:55:00-05:00`,
    inspector: 'Diego Ramos',
    brix: 16.4,
    firmeza: 268,
    calibrePromedio: 19.8,
    calibreDistribucion: [
      { rango: '16-18', porcentaje: 6 },
      { rango: '18-20', porcentaje: 36 },
      { rango: '20-22', porcentaje: 42 },
      { rango: '22-24', porcentaje: 14 },
      { rango: '24+', porcentaje: 2 },
    ],
    defectosPct: 3.1,
    defectosTipo: [
      { tipo: 'Desgrane', porcentaje: 32 },
      { tipo: 'Blandura', porcentaje: 30 },
      { tipo: 'Daño mecánico', porcentaje: 20 },
      { tipo: 'Otros', porcentaje: 18 },
    ],
    resultado: 'aprobado',
    notas: 'Lote estándar, sin observaciones.',
  },
  {
    id: 'QC-006',
    loteId: 'L-2005',
    variedad: 'Uva',
    fecha: `${today}T10:20:00-05:00`,
    inspector: 'Diego Ramos',
    brix: 17.2,
    firmeza: 295,
    calibrePromedio: 20.8,
    calibreDistribucion: [
      { rango: '18-20', porcentaje: 24 },
      { rango: '20-22', porcentaje: 50 },
      { rango: '22-24', porcentaje: 22 },
      { rango: '24+', porcentaje: 4 },
    ],
    defectosPct: 2.8,
    defectosTipo: [
      { tipo: 'Desgrane', porcentaje: 38 },
      { tipo: 'Color', porcentaje: 30 },
      { tipo: 'Otros', porcentaje: 32 },
    ],
    resultado: 'aprobado',
    notas: 'Excelente para EE.UU. — Tesco Premium.',
  },
  {
    id: 'QC-007',
    loteId: 'L-1007',
    variedad: 'Palta',
    fecha: `${today}T07:25:00-05:00`,
    inspector: 'Lucía Salas',
    brix: 0,
    firmeza: 78,
    calibrePromedio: 68,
    calibreDistribucion: [
      { rango: '50-60', porcentaje: 6 },
      { rango: '60-65', porcentaje: 28 },
      { rango: '65-70', porcentaje: 42 },
      { rango: '70-75', porcentaje: 20 },
      { rango: '75-80', porcentaje: 4 },
    ],
    defectosPct: 4.6,
    defectosTipo: [
      { tipo: 'Daño mecánico', porcentaje: 38 },
      { tipo: 'Antracnosis', porcentaje: 28 },
      { tipo: 'Color', porcentaje: 22 },
      { tipo: 'Otros', porcentaje: 12 },
    ],
    resultado: 'aprobado',
    notas: 'Hass — Materia seca 24.2%, dentro de spec.',
  },
  {
    id: 'QC-008',
    loteId: 'L-1008',
    variedad: 'Palta',
    fecha: `${today}T11:48:00-05:00`,
    inspector: 'Lucía Salas',
    brix: 0,
    firmeza: 58,
    calibrePromedio: 62,
    calibreDistribucion: [
      { rango: '50-60', porcentaje: 18 },
      { rango: '60-65', porcentaje: 46 },
      { rango: '65-70', porcentaje: 26 },
      { rango: '70-75', porcentaje: 8 },
      { rango: '75-80', porcentaje: 2 },
    ],
    defectosPct: 11.8,
    defectosTipo: [
      { tipo: 'Materia seca baja', porcentaje: 48 },
      { tipo: 'Antracnosis', porcentaje: 26 },
      { tipo: 'Daño mecánico', porcentaje: 18 },
      { tipo: 'Otros', porcentaje: 8 },
    ],
    resultado: 'rechazado',
    notas: 'Materia seca 19.4% (mínimo 21%). Rechazado para exportación.',
  },
  {
    id: 'QC-009',
    loteId: 'L-1009',
    variedad: 'Palta',
    fecha: `${yesterday}T16:12:00-05:00`,
    inspector: 'Lucía Salas',
    brix: 0,
    firmeza: 85,
    calibrePromedio: 71,
    calibreDistribucion: [
      { rango: '60-65', porcentaje: 14 },
      { rango: '65-70', porcentaje: 38 },
      { rango: '70-75', porcentaje: 36 },
      { rango: '75-80', porcentaje: 10 },
      { rango: '80+', porcentaje: 2 },
    ],
    defectosPct: 5.4,
    defectosTipo: [
      { tipo: 'Daño mecánico', porcentaje: 35 },
      { tipo: 'Antracnosis', porcentaje: 30 },
      { tipo: 'Color', porcentaje: 20 },
      { tipo: 'Otros', porcentaje: 15 },
    ],
    resultado: 'aprobado',
    notas: 'Hass — MS 23.1%, calibre uniforme.',
  },
  {
    id: 'QC-010',
    loteId: 'L-1010',
    variedad: 'Mango',
    fecha: `${today}T08:42:00-05:00`,
    inspector: 'José Vargas',
    brix: 16.4,
    firmeza: 62,
    calibrePromedio: 11.5,
    calibreDistribucion: [
      { rango: '9-10', porcentaje: 6 },
      { rango: '10-11', porcentaje: 22 },
      { rango: '11-12', porcentaje: 44 },
      { rango: '12-13', porcentaje: 24 },
      { rango: '13+', porcentaje: 4 },
    ],
    defectosPct: 5.2,
    defectosTipo: [
      { tipo: 'Antracnosis', porcentaje: 36 },
      { tipo: 'Blandura', porcentaje: 28 },
      { tipo: 'Daño mecánico', porcentaje: 20 },
      { tipo: 'Otros', porcentaje: 16 },
    ],
    resultado: 'aprobado',
    notas: 'Kent — apto Europa, calibre comercial 9-12.',
  },
  {
    id: 'QC-011',
    loteId: 'L-1011',
    variedad: 'Mango',
    fecha: `${today}T10:05:00-05:00`,
    inspector: 'José Vargas',
    brix: 14.8,
    firmeza: 52,
    calibrePromedio: 10.8,
    calibreDistribucion: [
      { rango: '9-10', porcentaje: 14 },
      { rango: '10-11', porcentaje: 38 },
      { rango: '11-12', porcentaje: 34 },
      { rango: '12-13', porcentaje: 12 },
      { rango: '13+', porcentaje: 2 },
    ],
    defectosPct: 7.8,
    defectosTipo: [
      { tipo: 'Antracnosis', porcentaje: 44 },
      { tipo: 'Blandura', porcentaje: 26 },
      { tipo: 'Color', porcentaje: 18 },
      { tipo: 'Otros', porcentaje: 12 },
    ],
    resultado: 'aprobado-condicional',
    notas: 'Antracnosis incipiente — destinar a Brasil (tránsito corto).',
  },
  {
    id: 'QC-012',
    loteId: 'L-1012',
    variedad: 'Cítricos',
    fecha: `${today}T09:18:00-05:00`,
    inspector: 'Ana Torres',
    brix: 11.6,
    firmeza: 0,
    calibrePromedio: 70,
    calibreDistribucion: [
      { rango: '55-60', porcentaje: 6 },
      { rango: '60-65', porcentaje: 18 },
      { rango: '65-70', porcentaje: 40 },
      { rango: '70-75', porcentaje: 28 },
      { rango: '75-80', porcentaje: 8 },
    ],
    defectosPct: 4.1,
    defectosTipo: [
      { tipo: 'Daño mecánico', porcentaje: 32 },
      { tipo: 'Pitting', porcentaje: 26 },
      { tipo: 'Color', porcentaje: 22 },
      { tipo: 'Otros', porcentaje: 20 },
    ],
    resultado: 'aprobado',
    notas: 'Mandarina W. Murcott — acidez 1.2%, ratio 9.7. Premium UK.',
  },
];

// ---------- Variety benchmarks ----------
export const mockBenchmarks: VarietyBenchmark[] = [
  {
    variedad: 'Arándano',
    brixMin: 10,
    brixMax: 16,
    brixOptimo: 12.5,
    firmezaMin: 120,
    firmezaMax: 280,
    firmezaOptimo: 170,
    calibreRango: '12–18 mm',
    tempOptima: 0,
    tempTolerance: 1.5,
    vidaUtilDias: 35,
  },
  {
    variedad: 'Uva',
    brixMin: 14,
    brixMax: 22,
    brixOptimo: 16.5,
    firmezaMin: 200,
    firmezaMax: 400,
    firmezaOptimo: 270,
    calibreRango: '18–26 mm',
    tempOptima: -0.5,
    tempTolerance: 1.0,
    vidaUtilDias: 60,
  },
  {
    variedad: 'Palta',
    brixMin: 21, // dry matter %
    brixMax: 26,
    brixOptimo: 23,
    firmezaMin: 60,
    firmezaMax: 120,
    firmezaOptimo: 75,
    calibreRango: '60–75 mm',
    tempOptima: 5,
    tempTolerance: 1.0,
    vidaUtilDias: 28,
  },
  {
    variedad: 'Mango',
    brixMin: 12,
    brixMax: 22,
    brixOptimo: 15,
    firmezaMin: 40,
    firmezaMax: 100,
    firmezaOptimo: 60,
    calibreRango: '9–14 cm',
    tempOptima: 8,
    tempTolerance: 1.5,
    vidaUtilDias: 21,
  },
  {
    variedad: 'Cítricos',
    brixMin: 9,
    brixMax: 14,
    brixOptimo: 11,
    firmezaMin: 0, // n/a — use acidez instead
    firmezaMax: 0,
    firmezaOptimo: 0,
    calibreRango: '55–80 mm',
    tempOptima: 4,
    tempTolerance: 1.0,
    vidaUtilDias: 45,
  },
];

// Helper: format benchmark "metric" cell (acidez for cítricos, firmeza for others).
export function benchmarkSecondaryLabel(variedad: string): string {
  return variedad === 'Cítricos' ? 'Acidez 0.5–2.5%' : 'Firmeza';
}

// ---------- 7-day trends ----------
const TREND_DATES = [
  '2026-05-09',
  '2026-05-10',
  '2026-05-11',
  '2026-05-12',
  '2026-05-13',
  '2026-05-14',
  '2026-05-15',
];

function trend(values: number[]): TrendPoint[] {
  return TREND_DATES.map((fecha, i) => ({ fecha, valor: values[i] }));
}

export const brixTrendByVariety: Record<string, TrendPoint[]> = {
  Todos: trend([14.1, 14.3, 14.0, 14.5, 14.2, 14.4, 14.4]),
  Arándano: trend([12.6, 12.8, 13.0, 13.3, 13.1, 13.4, 13.2]),
  Uva: trend([16.4, 16.8, 16.6, 17.0, 16.9, 17.2, 17.1]),
  Palta: trend([23.1, 23.4, 23.2, 23.6, 23.5, 23.9, 23.8]), // dry matter %
  Mango: trend([15.0, 15.4, 15.2, 15.6, 15.5, 15.7, 15.8]),
  Cítricos: trend([10.8, 11.0, 11.1, 11.3, 11.2, 11.5, 11.4]),
};

export const firmezaTrendByVariety: Record<string, TrendPoint[]> = {
  Todos: trend([162, 158, 165, 160, 156, 159, 158]),
  Arándano: trend([175, 180, 178, 186, 182, 188, 185]),
  Uva: trend([268, 272, 280, 278, 284, 288, 285]),
  Palta: trend([68, 70, 74, 71, 76, 73, 72]),
  Mango: trend([62, 60, 58, 61, 56, 60, 58]),
  Cítricos: trend([0, 0, 0, 0, 0, 0, 0]), // n/a — chart shows acidez instead
};

// Acidez trend for cítricos (used in place of firmeza)
export const acidezTrendCitricos: TrendPoint[] = trend([
  1.05, 1.08, 1.12, 1.15, 1.18, 1.22, 1.2,
]);

// Optimal range for trend overlay (ReferenceArea)
export const brixOptimalRange: Record<string, [number, number]> = {
  Todos: [13, 17],
  Arándano: [11, 16],
  Uva: [15, 20],
  Palta: [21, 26],
  Mango: [13, 19],
  Cítricos: [9.5, 13],
};

export const firmezaOptimalRange: Record<string, [number, number]> = {
  Todos: [140, 200],
  Arándano: [150, 250],
  Uva: [240, 360],
  Palta: [60, 95],
  Mango: [45, 80],
  Cítricos: [0.8, 1.5], // acidez % range for cítricos
};

// ---------- Calibre distribution per variety ----------
export const calibreDistByVariety: Record<string, CalibreSlice[]> = {
  Todos: [
    { rango: '8-10', porcentaje: 4 },
    { rango: '10-12', porcentaje: 16 },
    { rango: '12-14', porcentaje: 28 },
    { rango: '14-16', porcentaje: 30 },
    { rango: '16-18', porcentaje: 16 },
    { rango: '18+', porcentaje: 6 },
  ],
  Arándano: [
    { rango: '8-10', porcentaje: 2 },
    { rango: '10-12', porcentaje: 10 },
    { rango: '12-14', porcentaje: 26 },
    { rango: '14-16', porcentaje: 44 },
    { rango: '16-18', porcentaje: 15 },
    { rango: '18+', porcentaje: 3 },
  ],
  Uva: [
    { rango: '16-18', porcentaje: 4 },
    { rango: '18-20', porcentaje: 22 },
    { rango: '20-22', porcentaje: 46 },
    { rango: '22-24', porcentaje: 22 },
    { rango: '24-26', porcentaje: 5 },
    { rango: '26+', porcentaje: 1 },
  ],
  Palta: [
    { rango: '50-60', porcentaje: 8 },
    { rango: '60-65', porcentaje: 28 },
    { rango: '65-70', porcentaje: 38 },
    { rango: '70-75', porcentaje: 20 },
    { rango: '75-80', porcentaje: 5 },
    { rango: '80+', porcentaje: 1 },
  ],
  Mango: [
    { rango: '8-9', porcentaje: 4 },
    { rango: '9-10', porcentaje: 14 },
    { rango: '10-11', porcentaje: 30 },
    { rango: '11-12', porcentaje: 36 },
    { rango: '12-13', porcentaje: 14 },
    { rango: '13+', porcentaje: 2 },
  ],
  Cítricos: [
    { rango: '50-60', porcentaje: 6 },
    { rango: '60-65', porcentaje: 18 },
    { rango: '65-70', porcentaje: 38 },
    { rango: '70-75', porcentaje: 28 },
    { rango: '75-80', porcentaje: 8 },
    { rango: '80+', porcentaje: 2 },
  ],
};

// Optimal calibre band indices (start, end) per variety — for ReferenceArea
export const calibreOptimalBand: Record<string, [string, string]> = {
  Todos: ['12-14', '16-18'],
  Arándano: ['12-14', '16-18'],
  Uva: ['18-20', '22-24'],
  Palta: ['60-65', '70-75'],
  Mango: ['10-11', '12-13'],
  Cítricos: ['60-65', '75-80'],
};

// ---------- Defect distribution per variety ----------
export const defectDistByVariety: Record<string, DefectSlice[]> = {
  Todos: [
    { tipo: 'Blandura', porcentaje: 35 },
    { tipo: 'Deshidratación', porcentaje: 20 },
    { tipo: 'Daño mecánico', porcentaje: 18 },
    { tipo: 'Color', porcentaje: 15 },
    { tipo: 'Otros', porcentaje: 12 },
  ],
  Arándano: [
    { tipo: 'Blandura', porcentaje: 42 },
    { tipo: 'Deshidratación', porcentaje: 22 },
    { tipo: 'Daño mecánico', porcentaje: 16 },
    { tipo: 'Color', porcentaje: 12 },
    { tipo: 'Otros', porcentaje: 8 },
  ],
  Uva: [
    { tipo: 'Desgrane', porcentaje: 36 },
    { tipo: 'Blandura', porcentaje: 24 },
    { tipo: 'Daño mecánico', porcentaje: 18 },
    { tipo: 'Color', porcentaje: 14 },
    { tipo: 'Otros', porcentaje: 8 },
  ],
  Palta: [
    { tipo: 'Materia seca baja', porcentaje: 38 },
    { tipo: 'Daño mecánico', porcentaje: 24 },
    { tipo: 'Antracnosis', porcentaje: 20 },
    { tipo: 'Color', porcentaje: 12 },
    { tipo: 'Otros', porcentaje: 6 },
  ],
  Mango: [
    { tipo: 'Antracnosis', porcentaje: 34 },
    { tipo: 'Blandura', porcentaje: 26 },
    { tipo: 'Daño mecánico', porcentaje: 20 },
    { tipo: 'Color', porcentaje: 12 },
    { tipo: 'Otros', porcentaje: 8 },
  ],
  Cítricos: [
    { tipo: 'Daño mecánico', porcentaje: 30 },
    { tipo: 'Pitting', porcentaje: 26 },
    { tipo: 'Color', porcentaje: 18 },
    { tipo: 'Acidez fuera', porcentaje: 16 },
    { tipo: 'Otros', porcentaje: 10 },
  ],
};

// Distinct defect-slice colors (10 generous palette)
export const defectColors = [
  '#FF4444',
  '#FF8800',
  '#D4A843',
  '#6B5CE7',
  '#4488FF',
  '#1A5C3A',
  '#6B21A8',
  '#FF4D9B',
];
