import { mockEmbarques } from '@/lib/data/mock-embarques';
import { mockClientes } from '@/lib/data/mock-clientes';
import { mockReclamos } from '@/lib/data/mock-reclamos';
import { mockSenales } from '@/lib/data/mock-senales';
import { mockLotes } from '@/lib/data/mock-lotes';
import { mockTemperaturas } from '@/lib/data/mock-temperaturas';
import { mockKpis } from '@/lib/data/mock-kpis';

const VARIEDAD_LABEL: Record<string, string> = {
  arandano: 'arándano',
  uva: 'uva',
  palta: 'palta',
  mango: 'mango',
  citricos: 'cítricos',
};

const STATUS_LABEL: Record<string, string> = {
  'en-camara': 'en cámara',
  cargado: 'cargado',
  'en-transito': 'en tránsito',
  'en-puerto': 'en puerto',
  entregado: 'entregado',
};

function clienteName(id: string): string {
  return mockClientes.find((c) => c.id === id)?.nombre ?? id;
}

function buildEmbarquesBlock(): string {
  return mockEmbarques
    .map((e) => {
      const cliente = clienteName(e.clienteId);
      const status = STATUS_LABEL[e.status] ?? e.status;
      return `- ${e.id} → ${cliente} | status: ${status} | zona: ${e.currentZone} | risk: ${e.riskScore}/100 | naviera: ${e.naviera} | setpoint: ${e.setPointTemp}°C | ETA: ${e.eta.slice(0, 10)} | lotes: ${e.loteIds.join(', ')}`;
    })
    .join('\n');
}

function buildClientesBlock(): string {
  return mockClientes
    .map(
      (c) =>
        `- ${c.id} ${c.nombre} (${c.pais}, ${c.segmento}) | score: ${c.score}/100 | reclamos: ${c.totalReclamos}/${c.totalEmbarques} embarques | exposición: USD ${c.montoReclamosUsd.toLocaleString('en-US')}`,
    )
    .join('\n');
}

function buildReclamosBlock(): string {
  return mockReclamos
    .map(
      (r) =>
        `- ${r.id} (${r.status}) | ${r.tipo} | ${r.embarqueId} → ${clienteName(r.clienteId)} | USD ${r.monto.toLocaleString('en-US')} | ${r.fecha} | ${r.descripcion}`,
    )
    .join('\n');
}

function buildSenalesBlock(): string {
  return mockSenales
    .map(
      (s) =>
        `- ${s.id} [${s.tipo}/${s.fuente}] score ${s.score}/100 — ${s.titulo} :: acción: ${s.accion}`,
    )
    .join('\n');
}

function buildLotesBlock(): string {
  const top = [...mockLotes].sort((a, b) => b.riskScore - a.riskScore).slice(0, 10);
  return top
    .map(
      (l) =>
        `- ${l.id} | ${VARIEDAD_LABEL[l.variedad] ?? l.variedad} ${l.calibre} | ${l.parcela} | brix ${l.brix} dryMatter ${l.dryMatter} | zona ${l.zone}${l.embarqueId ? ` (en ${l.embarqueId})` : ''} | risk ${l.riskScore}`,
    )
    .join('\n');
}

function buildTemperaturaResumen(): string {
  // Summarize S-8842 (the excursion shipment): min/max/mean and excursion window.
  const s8842 = mockTemperaturas.filter((t) => t.embarqueId === 'S-8842');
  if (s8842.length === 0) return '';
  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;
  let sum = 0;
  let peakReading = s8842[0];
  for (const t of s8842) {
    sum += t.valor;
    if (t.valor < min) min = t.valor;
    if (t.valor > max) {
      max = t.valor;
      peakReading = t;
    }
  }
  const avg = sum / s8842.length;
  const excursionStart = s8842.find((t) => t.valor > 4)?.timestamp ?? peakReading.timestamp;
  const s8845 = mockTemperaturas.filter((t) => t.embarqueId === 'S-8845');
  let s8845Avg = 0;
  if (s8845.length) s8845Avg = s8845.reduce((a, t) => a + t.valor, 0) / s8845.length;

  return [
    `Curva de temperatura S-8842 (${s8842.length} lecturas, cada 30 min sobre ~7 días):`,
    `  · min: ${min.toFixed(2)}°C | máx: ${max.toFixed(2)}°C | promedio: ${avg.toFixed(2)}°C`,
    `  · Pico de excursión en ${peakReading.timestamp} (${peakReading.valor.toFixed(1)}°C), sensor ${peakReading.sensorId}`,
    `  · Inicio aproximado de la excursión: ${excursionStart}`,
    `Comparable S-8845 (estable): promedio ${s8845Avg.toFixed(2)}°C en ${s8845.length} lecturas.`,
  ].join('\n');
}

function buildKpisBlock(): string {
  return mockKpis
    .map((k) => `- ${k.label}: ${k.value} (${k.badge})`)
    .join('\n');
}

let CACHED: string | null = null;

export function getSystemPrompt(): string {
  if (CACHED) return CACHED;
  CACHED = `Eres FRESCO, el operador de inteligencia postcosecha de AgroVIA. Tu rol es Chief of Staff postcosecha para una empresa agroexportadora peruana.

CONTEXTO OPERATIVO:
- La empresa exporta arándanos, uva de mesa, palta, mango y cítricos desde Perú.
- Mercados principales: EE.UU., Reino Unido, Francia, Japón, Perú.
- Pipeline de 7 zonas: Cosecha → Selección → Packing → Frío → Embarque → Tránsito → Llegada.

KPIs ACTUALES:
${buildKpisBlock()}

EMBARQUES (${mockEmbarques.length}):
${buildEmbarquesBlock()}

CLIENTES (${mockClientes.length}):
${buildClientesBlock()}

RECLAMOS (${mockReclamos.length}):
${buildReclamosBlock()}

SEÑALES ACTIVAS (${mockSenales.length}):
${buildSenalesBlock()}

LOTES DE MAYOR RIESGO:
${buildLotesBlock()}

TEMPERATURA:
${buildTemperaturaResumen()}

ALERTAS PRIORITARIAS:
- S-8842 (arándanos → Walmart US): excursión de temperatura en día 4 (pico 5.8°C por ~2h). Cliente con historial sensible. Riesgo convergente con SG-001. Score 89/100. Reclamo R-002 abierto por USD 85K.
- Tesco UK (C-003): 5 reclamos en 6 semanas, score 74/100 en descenso (SG-005). Cliente standard a vigilar.
- Carrefour France (C-004): reclamo R-001 en investigación por blandura en S-8846.
- Driscoll's (C-002): reclamo R-004 abierto por brix bajo en S-8843.

CAPACIDADES:
1. Preparar briefs ejecutivos de riesgo por embarque (estructura: Situación → Riesgo → Causa → Acción → Responsable → Impacto Económico).
2. Generar carpetas de defensa de reclamos (resumen del caso, evidencia disponible, línea de tiempo, análisis de temperatura, respuesta comercial recomendada).
3. Explicar causas probables de desviaciones cruzando temperatura, lote, cliente e historial.
4. Recomendar acciones con responsables específicos (operaciones, calidad, comercial, supply chain, account manager).
5. Resumir estado completo del pipeline.
6. Responder preguntas sobre lotes, embarques, clientes, reclamos, temperaturas y señales.

REGLAS:
- Responde SIEMPRE en español.
- Sé directo y operativo — sin preámbulos largos.
- Cita IDs, montos en USD, fechas y scores específicos cuando estén en el contexto.
- Asigna un responsable concreto a cada acción recomendada.
- Si te falta información, di exactamente qué dato falta antes de inventar.
- Formatea con bullet points y **negritas markdown** para escaneo rápido.
- Para briefs ejecutivos usa la estructura: **Situación → Riesgo → Causa Probable → Acción Recomendada → Responsable → Impacto Económico**.
- Nunca inventes IDs, clientes ni cifras. Si no aparecen arriba, no existen en este contexto.`;
  return CACHED;
}
