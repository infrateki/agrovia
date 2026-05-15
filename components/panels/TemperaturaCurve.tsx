'use client';

import { useMemo } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Thermometer, AlertTriangle } from 'lucide-react';
import { usePipelineStore } from '@/lib/stores/pipeline-store';
import type { Variedad } from '@/lib/types';
import { DataSourceBadge } from './DataSourceBadge';
import styles from './TemperaturaCurve.module.css';

interface TemperaturaCurveProps {
  embarqueId: string;
  height?: number;
}

interface ChartPoint {
  t: number; // epoch ms
  v: number; // °C
  iso: string;
}

const VARIEDAD_RANGE: Record<Variedad, { min: number; max: number }> = {
  arandano: { min: -1, max: 1 },
  uva: { min: -1.5, max: 0 },
  palta: { min: 4, max: 7 },
  mango: { min: 8, max: 12 },
  citricos: { min: 5, max: 9 },
};

function shortDateTime(ms: number): string {
  const d = new Date(ms);
  return d.toLocaleString('es-PE', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function shortDate(ms: number): string {
  const d = new Date(ms);
  return d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short' });
}

interface TooltipPayload {
  value: number;
  payload: ChartPoint;
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
}

function ChartTooltip({ active, payload }: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const point = payload[0];
  if (!point) return null;
  return (
    <div className={styles.tooltip}>
      <div className={styles.tooltipTime}>{shortDateTime(point.payload.t)}</div>
      <div className={styles.tooltipValue}>{point.value.toFixed(2)} °C</div>
    </div>
  );
}

export function TemperaturaCurve({
  embarqueId,
  height = 200,
}: TemperaturaCurveProps) {
  const temperaturas = usePipelineStore((s) => s.temperaturas);
  const embarques = usePipelineStore((s) => s.embarques);
  const lotes = usePipelineStore((s) => s.lotes);

  const embarque = useMemo(
    () => embarques.find((e) => e.id === embarqueId),
    [embarques, embarqueId],
  );

  const variedad: Variedad | undefined = useMemo(() => {
    if (!embarque) return undefined;
    const firstLoteId = embarque.loteIds[0];
    if (!firstLoteId) return undefined;
    return lotes.find((l) => l.id === firstLoteId)?.variedad;
  }, [embarque, lotes]);

  const data: ChartPoint[] = useMemo(() => {
    const filtered = temperaturas
      .filter((t) => t.embarqueId === embarqueId)
      .map<ChartPoint>((t) => ({
        t: new Date(t.timestamp).getTime(),
        v: t.valor,
        iso: t.timestamp,
      }))
      .sort((a, b) => a.t - b.t);
    return filtered;
  }, [temperaturas, embarqueId]);

  const range = variedad ? VARIEDAD_RANGE[variedad] : { min: -1, max: 1 };
  const setPoint = embarque?.setPointTemp ?? 0;

  // Detect excursion window: any contiguous run of readings above the upper bound + 0.5°C.
  const excursion = useMemo(() => {
    if (data.length === 0) return null;
    const threshold = range.max + 0.5;
    let startIdx = -1;
    let endIdx = -1;
    let peakV = -Infinity;
    let peakIdx = -1;
    for (let i = 0; i < data.length; i += 1) {
      const point = data[i];
      if (!point) continue;
      if (point.v > threshold) {
        if (startIdx === -1) startIdx = i;
        endIdx = i;
        if (point.v > peakV) {
          peakV = point.v;
          peakIdx = i;
        }
      }
    }
    if (startIdx === -1) return null;
    const startPoint = data[startIdx];
    const endPoint = data[endIdx];
    const peakPoint = peakIdx >= 0 ? data[peakIdx] : undefined;
    if (!startPoint || !endPoint || !peakPoint) return null;
    return {
      t1: startPoint.t,
      t2: endPoint.t,
      peakV,
      peakT: peakPoint.t,
    };
  }, [data, range.max]);

  const lastReading = data.length > 0 ? data[data.length - 1] : null;
  const sourceTimestamp = lastReading?.iso ?? new Date().toISOString();

  if (data.length === 0) {
    return (
      <div className={styles.empty}>
        Sin lecturas de temperatura para este embarque.
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.iconWrap}>
            <Thermometer size={14} />
          </span>
          <div>
            <div className={styles.title}>Curva de temperatura · {embarqueId}</div>
            <div className={styles.subtitle}>
              Rango aceptable {range.min} °C a {range.max} °C
              {Number.isFinite(setPoint) ? ` · Set point ${setPoint} °C` : ''}
            </div>
          </div>
        </div>
        {excursion ? (
          <div className={styles.excursionTag}>
            <AlertTriangle size={12} />
            Excursión detectada · pico {excursion.peakV.toFixed(1)} °C
          </div>
        ) : null}
      </div>

      <div style={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 12, right: 8, left: -12, bottom: 4 }}
          >
            <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis
              dataKey="t"
              type="number"
              domain={['dataMin', 'dataMax']}
              scale="time"
              tickFormatter={(value: number) => shortDate(value)}
              stroke="#8B949E"
              tick={{ fill: '#8B949E', fontSize: 10 }}
              tickLine={false}
              axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
              minTickGap={28}
            />
            <YAxis
              stroke="#8B949E"
              tick={{ fill: '#8B949E', fontSize: 10 }}
              tickLine={false}
              axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
              domain={['auto', 'auto']}
              width={36}
              tickFormatter={(v: number) => `${v}°`}
            />
            <ReferenceArea
              y1={range.min}
              y2={range.max}
              fill="#2D8B5E"
              fillOpacity={0.12}
              stroke="rgba(45, 139, 94, 0.35)"
              strokeDasharray="3 3"
            />
            {excursion ? (
              <ReferenceArea
                x1={excursion.t1}
                x2={excursion.t2}
                fill="#FF4444"
                fillOpacity={0.18}
                stroke="rgba(255, 68, 68, 0.45)"
                strokeDasharray="2 2"
                label={{
                  value: 'Excursión',
                  position: 'insideTop',
                  fill: '#FF4444',
                  fontSize: 10,
                }}
              />
            ) : null}
            {Number.isFinite(setPoint) ? (
              <ReferenceLine
                y={setPoint}
                stroke="#4488FF"
                strokeDasharray="4 4"
                strokeWidth={1}
              />
            ) : null}
            <Tooltip
              content={<ChartTooltip />}
              cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }}
            />
            <Line
              type="monotone"
              dataKey="v"
              stroke="#4488FF"
              strokeWidth={1.5}
              dot={false}
              activeDot={{ r: 3, fill: '#4488FF' }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className={styles.footer}>
        <DataSourceBadge
          source="Emerson Data Logger"
          timestamp={sourceTimestamp}
          confidence="high"
          isMock
        />
        <span className={styles.legendItem}>
          <span
            className={styles.legendSwatch}
            style={{ background: 'rgba(45,139,94,0.5)' }}
          />
          Rango aceptable
        </span>
        <span className={styles.legendItem}>
          <span
            className={styles.legendSwatch}
            style={{ background: 'rgba(68,136,255,0.7)' }}
          />
          Set point
        </span>
        {excursion ? (
          <span className={styles.legendItem}>
            <span
              className={styles.legendSwatch}
              style={{ background: 'rgba(255,68,68,0.55)' }}
            />
            Excursión
          </span>
        ) : null}
      </div>
    </div>
  );
}
