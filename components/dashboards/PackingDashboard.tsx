'use client';

import { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { BarChart3, Boxes, Layers, Package } from 'lucide-react';
import {
  AlertBanner,
  CircularGauge,
  DashboardShell,
  DataTable,
  MiniGauge,
  SectionHeader,
  StatCard,
} from '@/components/widgets';
import type { ColumnDef, PackingLineStatus, PackingLoteProcess } from '@/lib/types';
import {
  MOCK_HOURLY_PRODUCTION,
  MOCK_PACKING_LINES,
  MOCK_PACKING_LOTES,
} from '@/lib/data/mock-packing';
import { useSelectionStore } from '@/lib/stores/selection-store';
import styles from './PackingDashboard.module.css';

const CHART_HOURLY_TARGET = 500;

const COLOR_GREEN = '#2D8B5E';
const COLOR_AMBER = '#FF8800';
const COLOR_RED = '#FF4444';
const COLOR_MUTED = '#8B949E';

const VARIETY_COLORS: Record<string, string> = {
  Arándano: '#6B5CE7',
  Uva: '#A855F7',
  Palta: '#1A5C3A',
  Mango: '#FF8800',
};

function varietyColor(variety: string): string {
  return VARIETY_COLORS[variety] ?? 'var(--color-text-secondary)';
}

function barColorForCajas(cajas: number, target: number): string {
  if (cajas >= target) return COLOR_GREEN;
  if (cajas >= target * 0.8) return COLOR_AMBER;
  return COLOR_RED;
}

function rendimientoColor(pct: number): string {
  if (pct >= 85) return 'var(--color-accent-green-light)';
  if (pct >= 70) return 'var(--color-alert-amber)';
  return 'var(--color-alert-red)';
}

function descarteColor(pct: number): string {
  if (pct <= 8) return 'var(--color-accent-green-light)';
  if (pct <= 15) return 'var(--color-alert-amber)';
  return 'var(--color-alert-red)';
}

function cajasHoraColor(value: number, target: number): string {
  if (target <= 0) return 'var(--color-text-muted)';
  const ratio = value / target;
  if (ratio >= 1) return 'var(--color-accent-green-light)';
  if (ratio >= 0.8) return 'var(--color-alert-amber)';
  return 'var(--color-alert-red)';
}

interface ChartTooltipPayload {
  payload: { hora: string; cajas: number; target: number };
  value: number;
}
interface ChartTooltipProps {
  active?: boolean;
  payload?: ChartTooltipPayload[];
}

function ChartTooltip({ active, payload }: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const point = payload[0];
  if (!point) return null;
  const { hora, cajas, target } = point.payload;
  const diff = cajas - target;
  const sign = diff >= 0 ? '+' : '';
  return (
    <div className={styles.tooltip}>
      <div className={styles.tooltipLabel}>{hora}</div>
      <div className={styles.tooltipValue}>
        {cajas.toLocaleString('es-PE')} cajas
      </div>
      <div className={styles.tooltipLabel}>
        {sign}
        {diff} vs meta
      </div>
    </div>
  );
}

const lineColumns: ColumnDef[] = [
  {
    key: 'linea',
    label: 'Línea',
    width: '110px',
    render: (value, row) => {
      const r = row as PackingLineStatus;
      return (
        <span className={styles.lineCell}>
          {r.estado === 'detenida' ? (
            <span className={styles.detenidaMark} aria-hidden="true" />
          ) : null}
          {String(value)}
        </span>
      );
    },
  },
  {
    key: 'turno',
    label: 'Turno',
    type: 'badge',
    width: '90px',
    render: (value) => {
      const v = String(value);
      const label = v === 'dia' ? 'Día' : 'Noche';
      const color = v === 'dia' ? '#D4A843' : '#6B5CE7';
      return (
        <span
          className={styles.varietyBadge}
          style={{
            background: `color-mix(in srgb, ${color} 18%, transparent)`,
            color,
            borderColor: `color-mix(in srgb, ${color} 30%, transparent)`,
          }}
        >
          {label}
        </span>
      );
    },
  },
  {
    key: 'variedad',
    label: 'Variedad',
    width: '120px',
    render: (value) => {
      const v = String(value);
      const color = varietyColor(v);
      return (
        <span
          className={styles.varietyBadge}
          style={{
            background: `color-mix(in srgb, ${color} 18%, transparent)`,
            color,
            borderColor: `color-mix(in srgb, ${color} 30%, transparent)`,
          }}
        >
          {v}
        </span>
      );
    },
  },
  {
    key: 'cajasHora',
    label: 'Cajas / h',
    align: 'left',
    width: '160px',
    render: (value, row) => {
      const r = row as PackingLineStatus;
      const v = Number(value);
      return (
        <span className={styles.cajasCell}>
          <span className={styles.cajasNum}>{v.toLocaleString('es-PE')}</span>
          <span className={styles.miniGaugeBox}>
            <MiniGauge
              value={v}
              max={r.cajasHoraTarget || 1}
              color={cajasHoraColor(v, r.cajasHoraTarget)}
            />
          </span>
        </span>
      );
    },
  },
  {
    key: 'rendimientoPct',
    label: 'Rendimiento',
    align: 'left',
    width: '150px',
    render: (value) => {
      const v = Number(value);
      return (
        <span className={styles.gaugePctCell}>
          <span className={styles.gaugePctValue}>{v.toFixed(1)}%</span>
          <span className={styles.miniGaugeBox}>
            <MiniGauge value={v} max={100} color={rendimientoColor(v)} />
          </span>
        </span>
      );
    },
  },
  {
    key: 'velocidadLinea',
    label: 'Velocidad',
    align: 'right',
    width: '100px',
    render: (value) => (
      <span className={styles.velocidadCell}>
        {Number(value).toFixed(1)} m/min
      </span>
    ),
  },
  {
    key: 'estado',
    label: 'Estado',
    type: 'badge',
    width: '120px',
  },
  {
    key: 'horaInicio',
    label: 'Inicio',
    width: '70px',
    align: 'right',
  },
];

function makeLoteColumns(
  onSelect: (loteId: string) => void,
): ColumnDef[] {
  return [
    {
      key: 'loteId',
      label: 'Lote',
      width: '90px',
      render: (value) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelect(String(value));
          }}
          className={styles.loteLink}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
          }}
        >
          {String(value)}
        </button>
      ),
    },
    {
      key: 'variedad',
      label: 'Variedad',
      width: '110px',
      render: (value) => {
        const v = String(value);
        const color = varietyColor(v);
        return (
          <span
            className={styles.varietyBadge}
            style={{
              background: `color-mix(in srgb, ${color} 18%, transparent)`,
              color,
              borderColor: `color-mix(in srgb, ${color} 30%, transparent)`,
            }}
          >
            {v}
          </span>
        );
      },
    },
    {
      key: 'calibre',
      label: 'Calibre',
      width: '90px',
    },
    {
      key: 'horaEntrada',
      label: 'Entrada',
      width: '80px',
    },
    {
      key: 'cajasProducidas',
      label: 'Cajas',
      type: 'number',
      align: 'right',
      width: '80px',
    },
    {
      key: 'rendimientoPct',
      label: 'Rendimiento',
      align: 'left',
      width: '150px',
      render: (value) => {
        const v = Number(value);
        return (
          <span className={styles.gaugePctCell}>
            <span className={styles.gaugePctValue}>{v.toFixed(1)}%</span>
            <span className={styles.miniGaugeBox}>
              <MiniGauge value={v} max={100} color={rendimientoColor(v)} />
            </span>
          </span>
        );
      },
    },
    {
      key: 'descartePct',
      label: 'Descarte',
      align: 'left',
      width: '150px',
      render: (value) => {
        const v = Number(value);
        return (
          <span className={styles.gaugePctCell}>
            <span className={styles.gaugePctValue}>{v.toFixed(1)}%</span>
            <span className={styles.miniGaugeBox}>
              <MiniGauge value={v} max={20} color={descarteColor(v)} />
            </span>
          </span>
        );
      },
    },
    {
      key: 'defectos',
      label: 'Defectos',
      render: (value) => {
        const items = Array.isArray(value) ? (value as string[]) : [];
        if (items.length === 0) return <span style={{ color: COLOR_MUTED }}>—</span>;
        return (
          <span className={styles.defectList}>
            {items.map((d, i) => (
              <span key={`${d}-${i}`}>• {d}</span>
            ))}
          </span>
        );
      },
    },
  ];
}

export function PackingDashboard() {
  const setSelectedObjectId = useSelectionStore((s) => s.setSelectedObjectId);

  const lineaDetenida = useMemo(
    () => MOCK_PACKING_LINES.find((l) => l.estado === 'detenida'),
    [],
  );

  const loteColumns = useMemo(
    () =>
      makeLoteColumns((loteId) => {
        setSelectedObjectId(loteId);
      }),
    [setSelectedObjectId],
  );

  const linesData = useMemo(
    () => MOCK_PACKING_LINES.map((l) => ({ ...l })),
    [],
  );
  const lotesData = useMemo(
    () => MOCK_PACKING_LOTES.map((l) => ({ ...l })),
    [],
  );

  const alerts = lineaDetenida ? (
    <AlertBanner
      type="warning"
      title={`⚠️ ${lineaDetenida.linea} detenida desde 09:45`}
      description="Motivo: cambio de variedad (uva → arándano). Tiempo estimado: 25 min."
    />
  ) : null;

  return (
    <DashboardShell
      title="Operaciones de Packing"
      subtitle="Producción, rendimiento y estado de líneas — actualizado en tiempo real"
      icon={<Boxes size={20} />}
      alerts={alerts}
    >
      {/* Section 1 — Packing Gauges */}
      <section className={styles.section}>
        <div className={styles.gaugesGrid}>
          <div className={styles.gaugeCell}>
            <CircularGauge
              label="Cajas / Hora"
              value={487}
              min={0}
              max={800}
              target={500}
              unit="cajas/h"
              size="lg"
              invertZones
              colorZones={{ green: [0, 25], amber: [25, 50], red: [50, 100] }}
            />
          </div>
          <div className={styles.gaugeCell}>
            <CircularGauge
              label="Rendimiento"
              value={87.3}
              min={0}
              max={100}
              target={90}
              unit="%"
              size="lg"
              invertZones
              colorZones={{ green: [0, 70], amber: [70, 85], red: [85, 100] }}
            />
          </div>
          <div className={styles.gaugeCell}>
            <CircularGauge
              label="Velocidad de Línea"
              value={12.5}
              min={0}
              max={20}
              target={14}
              unit="m/min"
              size="lg"
              invertZones
              colorZones={{ green: [0, 30], amber: [30, 50], red: [50, 100] }}
            />
          </div>
          <div className={styles.gaugeCell}>
            <CircularGauge
              label="Descarte"
              value={8.2}
              min={0}
              max={30}
              target={5}
              unit="%"
              size="lg"
              colorZones={{ green: [0, 27], amber: [27, 50], red: [50, 100] }}
            />
          </div>
        </div>
      </section>

      {/* Section 2 — Quick Stats */}
      <section className={styles.section}>
        <div className={styles.statsGrid}>
          <StatCard
            label="Cajas Hoy"
            value="3,847"
            delta="+12%"
            deltaType="up"
            target="4,200"
            sparklineData={[280, 380, 465, 520, 510, 487, 495, 490]}
          />
          <StatCard
            label="Kg Procesados"
            value="12,450"
            unit="kg"
            delta="+8% vs ayer"
            deltaType="up"
          />
          <StatCard
            label="Kg Empacados"
            value="10,840"
            unit="kg"
            delta="Merma: 12.9%"
            deltaType="neutral"
          />
          <StatCard
            label="Líneas Activas"
            value="3 de 4"
            delta="1 detenida"
            deltaType="down"
          />
          <StatCard
            label="Turno Actual"
            value="Día"
            delta="06:00 — 18:00"
            deltaType="neutral"
          />
          <StatCard
            label="Eficiencia Turno"
            value="91.5%"
            target="95%"
            delta="+2.3%"
            deltaType="up"
            sparklineData={[85, 87, 89, 90, 91, 91.5]}
          />
        </div>
      </section>

      {/* Section 3 — Production Trend Chart */}
      <section className={styles.section}>
        <div className={styles.chartCard}>
          <SectionHeader
            title="Producción por hora — Hoy"
            subtitle="Cajas producidas vs meta horaria"
            icon={<BarChart3 size={18} />}
          />
          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              data={MOCK_HOURLY_PRODUCTION}
              margin={{ top: 12, right: 24, left: 0, bottom: 8 }}
            >
              <CartesianGrid
                stroke="rgba(255,255,255,0.05)"
                vertical={false}
              />
              <XAxis
                dataKey="hora"
                stroke={COLOR_MUTED}
                tick={{ fill: COLOR_MUTED, fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
              />
              <YAxis
                stroke={COLOR_MUTED}
                tick={{ fill: COLOR_MUTED, fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                width={48}
              />
              <Tooltip
                content={<ChartTooltip />}
                cursor={{ fill: 'rgba(255,255,255,0.04)' }}
              />
              <ReferenceLine
                y={CHART_HOURLY_TARGET}
                stroke="#E6EDF3"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={{
                  value: 'Meta 500',
                  position: 'insideTopRight',
                  fill: '#E6EDF3',
                  fontSize: 10,
                }}
              />
              <Bar dataKey="cajas" radius={[4, 4, 0, 0]} barSize={42}>
                {MOCK_HOURLY_PRODUCTION.map((d) => (
                  <Cell
                    key={d.hora}
                    fill={barColorForCajas(d.cajas, CHART_HOURLY_TARGET)}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <p className={styles.chartFooter}>
            Ayer mismo horario:{' '}
            <span className={styles.chartFooterStrong}>3,200 cajas (+20.2%)</span>
          </p>
        </div>
      </section>

      {/* Section 4 — Lines Status Table */}
      <section className={styles.section}>
        <div className={styles.tableWrap}>
          <SectionHeader
            title="Estado de líneas de packing"
            subtitle="4 líneas configuradas · 1 detenida"
            icon={<Layers size={18} />}
          />
          <DataTable columns={lineColumns} data={linesData} pageSize={10} />
        </div>
      </section>

      {/* Section 5 — Lotes in Process Table */}
      <section className={styles.section}>
        <div className={styles.tableWrap}>
          <SectionHeader
            title="Lotes en proceso"
            subtitle="Click en un lote para ver su ficha operativa"
            icon={<Package size={18} />}
            action={
              <span className={styles.countBadge}>
                {lotesData.length} lotes
              </span>
            }
          />
          <DataTable
            columns={loteColumns}
            data={lotesData}
            pageSize={10}
            onRowClick={(row) => {
              const id = row.loteId as string | undefined;
              if (id) setSelectedObjectId(id);
            }}
          />
        </div>
      </section>
    </DashboardShell>
  );
}
