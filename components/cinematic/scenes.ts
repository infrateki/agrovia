import type { PipelineZone } from '@/lib/types';
import type { SceneId } from './store';
import { SCENE_END, SCENE_START } from './store';

export interface SceneBeat {
  // seconds within the full timeline at which to apply this beat
  at: number;
  // selectedZone target — null returns to overview
  zone: PipelineZone | null;
}

export interface SceneDef {
  id: SceneId;
  title: string;
  startSec: number;
  endSec: number;
  narration: string;
  beats: SceneBeat[];
  dataOverlay:
    | 'kpi-summary'
    | 'risk-badge'
    | 'temperature-curve'
    | 'impact-card'
    | 'closing-tagline';
}

export const SCENES: SceneDef[] = [
  {
    id: 1,
    title: 'Contexto',
    startSec: SCENE_START[1],
    endSec: SCENE_END[1],
    narration:
      'Esta es la operación postcosecha completa de una agroexportadora peruana. Cada zona —desde la cosecha hasta el punto de venta— genera datos que hoy viven dispersos en planillas, sensores, correos y WhatsApp.',
    beats: [{ at: 0, zone: null }],
    dataOverlay: 'kpi-summary',
  },
  {
    id: 2,
    title: 'Alerta',
    startSec: SCENE_START[2],
    endSec: SCENE_END[2],
    narration:
      'El sistema detecta que el embarque S-8842 —arándanos a Estados Unidos— muestra convergencia de riesgo: excursión de temperatura, tránsito largo y patrón histórico de reclamos del cliente.',
    beats: [
      { at: 18, zone: 'frio' },
      { at: 27, zone: 'transito' },
    ],
    dataOverlay: 'risk-badge',
  },
  {
    id: 3,
    title: 'Inspección',
    startSec: SCENE_START[3],
    endSec: SCENE_END[3],
    narration:
      'Con un click, el equipo inspecciona: la curva de temperatura muestra una excursión de +5.8°C durante 2 horas en el día 4 de tránsito. La cadena de frío se quebró.',
    beats: [{ at: 36, zone: 'frio' }],
    dataOverlay: 'temperature-curve',
  },
  {
    id: 4,
    title: 'Causa y acción',
    startSec: SCENE_START[4],
    endSec: SCENE_END[4],
    narration:
      'FRESCO identifica la causa probable, calcula el impacto económico —$85,000 en riesgo— y recomienda acciones específicas: preparar evidencia, contactar al cliente, generar respuesta comercial proactiva.',
    beats: [{ at: 54, zone: 'frio' }],
    dataOverlay: 'impact-card',
  },
  {
    id: 5,
    title: 'Cierre',
    startSec: SCENE_START[5],
    endSec: SCENE_END[5],
    narration:
      'En 60 segundos, el equipo pasó de desconocer el riesgo a tener un plan de acción con responsable y evidencia. Eso es AgroVIA: el modelo operativo que convierte datos dispersos en decisiones.',
    beats: [{ at: 72, zone: null }],
    dataOverlay: 'closing-tagline',
  },
];

export const TALKING_POINTS: Record<SceneId, string[]> = {
  1: [
    'Pipeline completo: 7 zonas, de cosecha a punto de venta.',
    'Datos dispersos: planillas, sensores, correos, WhatsApp.',
    'KPIs ejecutivos siempre visibles.',
  ],
  2: [
    'Embarque flagship: S-8842, arándanos, Walmart US.',
    'Convergencia de 3 señales (temp + tránsito + cliente).',
    'Score 91/100 — riesgo crítico.',
  ],
  3: [
    'Excursión de +5.8°C durante ~2h en día 4 de tránsito.',
    'Curva visible — evidencia objetiva.',
    'La cadena de frío se quebró.',
  ],
  4: [
    'Impacto económico: $85,000 en riesgo.',
    'Causa probable identificada por FRESCO.',
    'Acciones concretas con responsable.',
  ],
  5: [
    'De desconocer el riesgo a tener un plan, en 60 segundos.',
    'AgroVIA = decisiones, no dashboards.',
    'Pregunta de cierre al cliente.',
  ],
};
