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
import { MessageSquareText, Radar, Send, TrendingUp } from 'lucide-react';
import { usePipelineStore } from '@/lib/stores/pipeline-store';
import type { Senal } from '@/lib/types';
import { Card } from '@/components/ui/Card';
import { KpiCards } from './KpiCards';
import styles from './DashboardView.module.css';

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

export function DashboardView() {
  const senales = usePipelineStore((s) => s.senales);
  const chatMessages = usePipelineStore((s) => s.chatMessages);

  const topSignals = useMemo<Senal[]>(
    () => [...senales].sort((a, b) => b.score - a.score).slice(0, 3),
    [senales],
  );

  const lastTwo = chatMessages.slice(-2);

  return (
    <div className={styles.view}>
      <h2 className={styles.title}>Centro de Comando</h2>
      <p className={styles.subtitle}>
        Estado en vivo del pipeline FRESCO — indicadores ejecutivos, señales prioritarias y operador IA.
      </p>

      <div className={styles.section}>
        <KpiCards />
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
