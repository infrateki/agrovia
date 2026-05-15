'use client';

import { useMemo } from 'react';
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  AlertTriangle,
  ChevronRight,
  Clock,
  ListChecks,
  MessageSquareText,
  Radar,
  Send,
  TrendingUp,
} from 'lucide-react';
import { usePipelineStore } from '@/lib/stores/pipeline-store';
import { useSelectionStore } from '@/lib/stores/selection-store';
import { useUiStore } from '@/lib/stores/ui-store';
import { mockDecisiones } from '@/lib/data/mock-decisiones';
import { findFichaById } from '@/lib/data/mock-fichas';
import type { DecisionPendiente, Embarque, Senal } from '@/lib/types';
import { Card } from '@/components/ui/Card';
import { KpiCards } from './KpiCards';
import { DataSourceBadge } from './DataSourceBadge';
import styles from './DashboardView.module.css';

const HIGH_RISK_THRESHOLD = 80;
const FROZEN_DASHBOARD_TIMESTAMP = '2026-05-15T08:30:00Z';

const CHART_DATA = [
  { mes: 'Dic', riesgo: 38, calidad: 74 },
  { mes: 'Ene', riesgo: 42, calidad: 76 },
  { mes: 'Feb', riesgo: 48, calidad: 72 },
  { mes: 'Mar', riesgo: 55, calidad: 70 },
  { mes: 'Abr', riesgo: 51, calidad: 75 },
  { mes: 'May', riesgo: 62, calidad: 78 },
];

function scoreColor(score: number): string {
  if (score >= 80) return 'var(--color-alert-red)';
  if (score >= 65) return 'var(--color-alert-amber)';
  return 'var(--color-cold-blue)';
}

function urgencyClass(urgencia: DecisionPendiente['urgencia']): string {
  if (urgencia === 'alta') return styles['urg-alta'] ?? '';
  if (urgencia === 'media') return styles['urg-media'] ?? '';
  return styles['urg-baja'] ?? '';
}

function shortDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'short',
    });
  } catch {
    return '—';
  }
}

interface TooltipPayload {
  value: number;
  name: string;
  color: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}

function ChartTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className={styles.tooltip}>
      <div className={styles.tooltipLabel}>{label}</div>
      {payload.map((p) => (
        <div key={p.name} style={{ color: p.color }}>
          {p.name}: {p.value}
        </div>
      ))}
    </div>
  );
}

interface AlertaPrioritariaProps {
  embarque: Embarque;
  onOpen: () => void;
}

function AlertaPrioritaria({ embarque, onOpen }: AlertaPrioritariaProps) {
  return (
    <div className={styles.alertBanner} role="alert">
      <span className={styles.alertIcon}>
        <AlertTriangle size={18} />
      </span>
      <div className={styles.alertText}>
        <div className={styles.alertTitle}>
          {embarque.id} · Arándanos a EE.UU. — Riesgo convergente detectado
        </div>
        <div className={styles.alertSub}>
          Excursión térmica + historial de reclamos del cliente. Acción comercial
          requerida antes del arribo.
        </div>
      </div>
      <button
        type="button"
        className={styles.alertBtn}
        onClick={onOpen}
      >
        Ver ficha
        <ChevronRight size={14} />
      </button>
    </div>
  );
}

interface DecisionRowProps {
  decision: DecisionPendiente;
  onOpen: (fichaId: string) => void;
}

function DecisionRow({ decision, onOpen }: DecisionRowProps) {
  return (
    <div className={`${styles.decisionRow} ${urgencyClass(decision.urgencia)}`}>
      <span className={styles.urgencyDot} aria-hidden="true" />
      <div className={styles.decisionBody}>
        <div className={styles.decisionDesc}>{decision.descripcion}</div>
        <div className={styles.decisionMeta}>
          <span>{decision.responsable}</span>
          <span className={styles.metaSep}>·</span>
          <span className={styles.deadline}>
            <Clock size={11} /> {shortDate(decision.deadline)}
          </span>
        </div>
      </div>
      <button
        type="button"
        className={styles.decisionBtn}
        onClick={() => onOpen(decision.fichaId)}
      >
        Abrir ficha
        <ChevronRight size={12} />
      </button>
    </div>
  );
}

export function DashboardView() {
  const senales = usePipelineStore((s) => s.senales);
  const chatMessages = usePipelineStore((s) => s.chatMessages);
  const embarques = usePipelineStore((s) => s.embarques);

  const setSelectedZone = useSelectionStore((s) => s.setSelectedZone);
  const setSelectedObjectId = useSelectionStore((s) => s.setSelectedObjectId);
  const setRightPanelOpen = useUiStore((s) => s.setRightPanelOpen);

  const topSignals = useMemo<Senal[]>(
    () => [...senales].sort((a, b) => b.score - a.score).slice(0, 3),
    [senales],
  );

  const lastTwo = chatMessages.slice(-2);

  const priorityEmbarque = useMemo<Embarque | undefined>(
    () =>
      [...embarques]
        .filter((e) => e.riskScore >= HIGH_RISK_THRESHOLD)
        .sort((a, b) => b.riskScore - a.riskScore)[0],
    [embarques],
  );

  const openFicha = (fichaId: string) => {
    const ficha = findFichaById(fichaId);
    if (!ficha) return;
    if (ficha.targetType === 'embarque') {
      setSelectedObjectId(ficha.targetId);
      setSelectedZone(ficha.zona);
    } else {
      setSelectedObjectId(null);
      setSelectedZone(ficha.zona);
    }
    setRightPanelOpen(true);
  };

  const openPriorityFicha = () => {
    if (!priorityEmbarque) return;
    setSelectedObjectId(priorityEmbarque.id);
    setSelectedZone(priorityEmbarque.currentZone);
    setRightPanelOpen(true);
  };

  const topDecisions = mockDecisiones.slice(0, 3);

  return (
    <div className={styles.view}>
      <h2 className={styles.title}>Centro de Comando</h2>
      <p className={styles.subtitle}>
        Estado en vivo del pipeline FRESCO — indicadores ejecutivos, señales prioritarias y operador IA.
      </p>

      {priorityEmbarque ? (
        <AlertaPrioritaria
          embarque={priorityEmbarque}
          onOpen={openPriorityFicha}
        />
      ) : null}

      <div className={styles.section}>
        <KpiCards />
      </div>

      <div className={`${styles.section} ${styles.decisionsCard}`}>
        <Card>
          <div className={styles.decisionsHeader}>
            <span className={styles.decisionsTitle}>
              <ListChecks size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />
              Decisiones pendientes
            </span>
            <DataSourceBadge
              source="Operador FRESCO"
              timestamp={FROZEN_DASHBOARD_TIMESTAMP}
              confidence="medium"
              isMock
            />
          </div>
          <div className={styles.decisionsList}>
            {topDecisions.map((d) => (
              <DecisionRow key={d.id} decision={d} onOpen={openFicha} />
            ))}
          </div>
        </Card>
      </div>

      <div className={`${styles.section} ${styles.middleRow}`}>
        <Card className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <span className={styles.chartTitle}>
              <TrendingUp size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />
              Riesgo de portafolio vs calidad
            </span>
            <div className={styles.legend}>
              <span>
                <span className={styles.legendDot} style={{ background: '#FF8800' }} />
                Riesgo
              </span>
              <span>
                <span className={styles.legendDot} style={{ background: '#2D8B5E' }} />
                Calidad
              </span>
            </div>
          </div>
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={CHART_DATA} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
                <defs>
                  <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FF8800" stopOpacity={0.55} />
                    <stop offset="100%" stopColor="#FF8800" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="qualityGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2D8B5E" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="#2D8B5E" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="mes"
                  stroke="#8B949E"
                  tick={{ fill: '#8B949E', fontSize: 11 }}
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                />
                <YAxis
                  stroke="#8B949E"
                  tick={{ fill: '#8B949E', fontSize: 11 }}
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                  domain={[0, 100]}
                />
                <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)' }} />
                <Area
                  type="monotone"
                  dataKey="calidad"
                  name="Calidad"
                  stroke="#2D8B5E"
                  strokeWidth={2}
                  fill="url(#qualityGradient)"
                />
                <Area
                  type="monotone"
                  dataKey="riesgo"
                  name="Riesgo"
                  stroke="#FF8800"
                  strokeWidth={2}
                  fill="url(#riskGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className={styles.chartFooter}>
            <DataSourceBadge
              source="Modelo riesgo FRESCO"
              timestamp={FROZEN_DASHBOARD_TIMESTAMP}
              confidence="medium"
              isMock
            />
          </div>
        </Card>

        <Card className={styles.signalCard}>
          <div className={styles.signalHeader}>
            <span className={styles.signalTitle}>
              <Radar size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />
              Cola de señales activas
            </span>
            <span className={styles.signalCount}>{senales.length} señales</span>
          </div>
          <div>
            {topSignals.map((s) => (
              <div key={s.id} className={styles.signalRow}>
                <span className={styles.signalScore} style={{ color: scoreColor(s.score) }}>
                  {s.score}
                </span>
                <div className={styles.signalText}>
                  <span className={styles.signalTitulo}>{s.titulo}</span>
                  <span className={styles.signalAccion}>{s.accion}</span>
                </div>
              </div>
            ))}
          </div>
          <div className={styles.signalFooter}>
            <DataSourceBadge
              source="Radar de Señales"
              timestamp={FROZEN_DASHBOARD_TIMESTAMP}
              confidence="high"
              isMock
            />
          </div>
        </Card>
      </div>

      <div className={`${styles.section} ${styles.bottomRow}`}>
        <Card className={styles.chatPreview}>
          <div className={styles.chatPreviewHeader}>
            <MessageSquareText size={14} style={{ color: 'var(--color-accent-green-light)' }} />
            <span className={styles.chatPreviewTitle}>Operador FRESCO</span>
          </div>
          <div className={styles.chatMessages}>
            {lastTwo.map((m) => (
              <div
                key={m.id}
                className={`${styles.chatMsg} ${m.role === 'user' ? styles.chatUser : styles.chatBot}`}
              >
                {m.text}
              </div>
            ))}
          </div>
          <div className={styles.chatInputRow}>
            <input
              className={styles.chatInput}
              placeholder="Pregúntale a FRESCO..."
              readOnly
            />
            <button className={styles.chatSend} type="button">
              <Send size={14} />
              Enviar
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
