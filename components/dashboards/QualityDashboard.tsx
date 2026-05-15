'use client';

import { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Bug,
  Users,
  ListChecks,
} from 'lucide-react';
import {
  CircularGauge,
  DashboardShell,
  DataTable,
  MiniGauge,
  SectionHeader,
  StatCard,
  VarietySelector,
} from '@/components/widgets';
import {
  acidezTrendCitricos,
  brixOptimalRange,
  brixTrendByVariety,
  calibreDistByVariety,
  calibreOptimalBand,
  defectColors,
  defectDistByVariety,
  firmezaOptimalRange,
  firmezaTrendByVariety,
  gaugeConfigByVariety,
  mockBenchmarks,
  mockQCInspecciones,
  varietyColors,
  varietyStatsByVariety,
} from '@/lib/data';
import type { ColumnDef, QCInspeccion } from '@/lib/types';
import styles from './QualityDashboard.module.css';

const VARIETY_OPTIONS = [
  'Todos',
  'Arándano',
  'Uva',
  'Palta',
  'Mango',
  'Cítricos',
];

function formatHora(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleTimeString('es-PE', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  } catch {
    return iso;
  }
}

function resultadoLabel(r: QCInspeccion['resultado']): string {
  if (r === 'aprobado') return 'Aprobado';
  if (r === 'aprobado-condicional') return 'Condicional';
  return 'Rechazado';
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; name: string; payload: unknown }>;
  label?: string | number;
}

function ChartTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className={styles.tooltip}>
      {label != null ? (
        <div className={styles.tooltipLabel}>{String(label)}</div>
      ) : null}
      {payload.map((p, i) => (
        <div key={i} className={styles.tooltipValue}>
          {p.name}: {typeof p.value === 'number' ? p.value.toFixed(1) : p.value}
        </div>
      ))}
    </div>
  );
}

export function QualityDashboard() {
  const [selected, setSelected] = useState<string>('Arándano');

  const gauges = gaugeConfigByVariety[selected] ?? gaugeConfigByVariety.Todos;
  const stats = varietyStatsByVariety[selected] ?? varietyStatsByVariety.Todos;
  const calibreDist = calibreDistByVariety[selected] ?? calibreDistByVariety.Todos;
  const calibreBand = calibreOptimalBand[selected] ?? calibreOptimalBand.Todos;
  const defectDist = defectDistByVariety[selected] ?? defectDistByVariety.Todos;
  const brixTrend = brixTrendByVariety[selected] ?? brixTrendByVariety.Todos;
  const firmezaTrend =
    selected === 'Cítricos'
      ? acidezTrendCitricos
      : (firmezaTrendByVariety[selected] ?? firmezaTrendByVariety.Todos);
  const brixBand = brixOptimalRange[selected] ?? brixOptimalRange.Todos;
  const firmezaBand =
    firmezaOptimalRange[selected] ?? firmezaOptimalRange.Todos;

  const varietyColor =
    varietyColors[selected] ?? 'var(--color-accent-green-light)';

  const inspecciones = useMemo(() => {
    const rows = selected === 'Todos'
      ? mockQCInspecciones
      : mockQCInspecciones.filter((r) => r.variedad === selected);
    return rows.map((r) => ({
      ...r,
      hora: formatHora(r.fecha),
      resultadoLabel: resultadoLabel(r.resultado),
      defectos: r.defectosPct,
      calibre: r.calibrePromedio,
    }));
  }, [selected]);

  const isPalta = selected === 'Palta';
  const isCitricos = selected === 'Cítricos';

  const brixColumn: ColumnDef = {
    key: 'brix',
    label: isPalta ? 'MS %' : 'Brix',
    sortable: true,
    align: 'right',
    width: '70px',
    render: (v) => {
      const n = Number(v);
      if (!Number.isFinite(n) || n === 0)
        return <span style={{ color: 'var(--color-text-muted)' }}>—</span>;
      return (
        <span style={{ fontVariantNumeric: 'tabular-nums', fontSize: 12 }}>
          {n.toFixed(1)}
        </span>
      );
    },
  };

  const columns: ColumnDef[] = [
    { key: 'loteId', label: 'Lote', sortable: true, type: 'text', width: '90px' },
    {
      key: 'variedad',
      label: 'Variedad',
      sortable: true,
      width: '110px',
      render: (v) => {
        const c = varietyColors[String(v)] ?? 'var(--color-text-secondary)';
        return (
          <span
            className={styles.varietyChip}
            style={{ background: c }}
          >
            {String(v)}
          </span>
        );
      },
    },
    { key: 'hora', label: 'Hora', sortable: true, type: 'text', width: '70px' },
    {
      key: 'inspector',
      label: 'Inspector',
      sortable: true,
      type: 'text',
      width: '140px',
    },
    brixColumn,
    {
      key: 'firmeza',
      label: isCitricos ? 'Acidez' : 'Firmeza',
      sortable: true,
      align: 'right',
      width: '150px',
      render: (v) => {
        const n = Number(v);
        if (!Number.isFinite(n) || n === 0)
          return <span style={{ color: 'var(--color-text-muted)' }}>—</span>;
        return (
          <div className={styles.numAndGauge}>
            <span>{n.toFixed(isCitricos ? 1 : 0)}</span>
            <MiniGauge
              value={n}
              max={isCitricos ? 2.5 : 400}
              color={varietyColor}
            />
          </div>
        );
      },
    },
    {
      key: 'calibre',
      label: 'Calibre',
      sortable: true,
      align: 'right',
      width: '80px',
      render: (v) => (
        <span style={{ fontVariantNumeric: 'tabular-nums', fontSize: 12 }}>
          {Number(v).toFixed(1)}
        </span>
      ),
    },
    {
      key: 'defectos',
      label: 'Defectos %',
      sortable: true,
      align: 'right',
      width: '140px',
      render: (v) => {
        const n = Number(v);
        const color =
          n >= 8
            ? 'var(--color-alert-red)'
            : n >= 5
              ? 'var(--color-alert-amber)'
              : 'var(--color-accent-green-light)';
        return (
          <div className={styles.numAndGauge}>
            <span style={{ color }}>{n.toFixed(1)}%</span>
            <MiniGauge value={Math.max(0, 100 - n * 10)} max={100} color={color} />
          </div>
        );
      },
    },
    {
      key: 'resultadoLabel',
      label: 'Resultado',
      sortable: true,
      type: 'badge',
      width: '120px',
    },
    { key: 'notas', label: 'Notas', type: 'text' },
  ];

  const calibreData = calibreDist.map((c) => ({
    rango: c.rango,
    porcentaje: c.porcentaje,
  }));

  const defectData = defectDist.map((d) => ({
    tipo: d.tipo,
    porcentaje: d.porcentaje,
  }));

  return (
    <DashboardShell
      title="Control de Calidad"
      subtitle="Brix, firmeza, calibre y defectos en tiempo real"
      icon={<ClipboardCheck size={20} />}
    >
      {/* === Variety selector === */}
      <div className={styles.varietyRow}>
        <VarietySelector
          selected={selected}
          onChange={setSelected}
          options={VARIETY_OPTIONS}
        />
        <span className={styles.varietyHint}>
          Filtra todos los indicadores · {inspecciones.length} inspecciones en
          ventana
        </span>
      </div>

      {/* === Section 1 — Gauges === */}
      <div className={styles.row}>
        <SectionHeader
          title={`Indicadores · ${selected}`}
          subtitle="Valores actuales versus rangos óptimos de exportación"
        />
      </div>
      <div className={styles.gaugesRow}>
        {gauges.map((g) => (
          <div key={g.key} className={styles.gaugeCell}>
            <CircularGauge
              value={g.value}
              min={g.min}
              max={g.max}
              target={g.target}
              label={g.label}
              unit={g.unit}
              size="md"
              colorZones={g.colorZones}
              invertZones={g.invertZones}
            />
          </div>
        ))}
      </div>

      {/* === Section 2 — Stat cards === */}
      <div className={styles.row}>
        <SectionHeader
          title="Resumen del día"
          subtitle="Movimiento de inspecciones en las últimas 24 horas"
        />
      </div>
      <div className={styles.statsRow}>
        <StatCard
          icon={<ListChecks size={14} />}
          label="Lotes Inspeccionados Hoy"
          value={String(stats.inspeccionadosHoy)}
          delta={
            stats.inspeccionadosDelta === 0
              ? 'Sin cambio vs ayer'
              : `${stats.inspeccionadosDelta > 0 ? '+' : ''}${stats.inspeccionadosDelta} vs ayer`
          }
          deltaType={
            stats.inspeccionadosDelta > 0
              ? 'up'
              : stats.inspeccionadosDelta < 0
                ? 'down'
                : 'neutral'
          }
        />
        <StatCard
          icon={<CheckCircle2 size={14} />}
          label="Aprobados"
          value={String(stats.aprobados)}
          delta={`${stats.aprobadosPct.toFixed(1)}%`}
          deltaType="up"
        />
        <StatCard
          icon={<XCircle size={14} />}
          label="Rechazados"
          value={String(stats.rechazados)}
          delta={stats.rechazadosNota ?? (stats.rechazados === 0 ? 'Ninguno' : undefined)}
          deltaType={stats.rechazados > 0 ? 'down' : 'neutral'}
        />
        <StatCard
          icon={<AlertTriangle size={14} />}
          label="Condicional"
          value={String(stats.condicional)}
          delta={stats.condicionalNota ?? (stats.condicional === 0 ? 'Ninguno' : undefined)}
          deltaType={stats.condicional > 0 ? 'neutral' : 'up'}
        />
        <StatCard
          icon={<Bug size={14} />}
          label="Defectos Promedio"
          value={`${stats.defectosPromedio.toFixed(1)}%`}
          target={`<${stats.defectosTarget}%`}
          deltaType={stats.defectosPromedio <= stats.defectosTarget ? 'up' : 'down'}
        />
        <StatCard
          icon={<Users size={14} />}
          label="Inspectores Activos"
          value={String(stats.inspectoresActivos)}
          delta={`de ${stats.inspectoresProgramados} programados`}
          deltaType="neutral"
        />
      </div>

      {/* === Section 3 — Distribución de Calibre + Defectos === */}
      <div className={styles.row}>
        <SectionHeader
          title="Distribución y defectos"
          subtitle="Calibre por rango y tipología de hallazgos"
        />
      </div>
      <div className={styles.chartsRow}>
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>Distribución de Calibre</h3>
          <p className={styles.chartSubtitle}>
            Rango óptimo: {calibreBand[0]} → {calibreBand[1]}
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={calibreData}
              margin={{ top: 8, right: 12, bottom: 4, left: -8 }}
            >
              <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis
                dataKey="rango"
                tick={{ fill: '#8B949E', fontSize: 11 }}
                axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#8B949E', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => `${v}%`}
              />
              <Tooltip
                content={<ChartTooltip />}
                cursor={{ fill: 'rgba(255,255,255,0.04)' }}
              />
              <ReferenceArea
                x1={calibreBand[0]}
                x2={calibreBand[1]}
                fill="var(--color-accent-green-light)"
                fillOpacity={0.12}
                stroke="var(--color-accent-green-light)"
                strokeOpacity={0.3}
                strokeDasharray="3 3"
              />
              <Bar
                dataKey="porcentaje"
                name="% del lote"
                fill={varietyColor}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>Tipos de Defectos</h3>
          <p className={styles.chartSubtitle}>
            Distribución porcentual de hallazgos
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Tooltip content={<ChartTooltip />} />
              <Pie
                data={defectData}
                dataKey="porcentaje"
                nameKey="tipo"
                cx="40%"
                cy="50%"
                innerRadius={42}
                outerRadius={78}
                paddingAngle={2}
                stroke="rgba(13,17,23,0.85)"
                strokeWidth={2}
                label={(props: { name?: string | number; value?: number }) =>
                  `${props.name ?? ''} ${props.value ?? 0}%`
                }
                labelLine={false}
              >
                {defectData.map((_, i) => (
                  <Cell
                    key={`defect-${i}`}
                    fill={defectColors[i % defectColors.length]}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* === Section 4 — Trends === */}
      <div className={styles.row}>
        <SectionHeader
          title="Tendencias · 7 días"
          subtitle={
            isCitricos
              ? 'Brix y acidez (% ácido cítrico)'
              : isPalta
                ? 'Materia seca y firmeza'
                : 'Brix y firmeza'
          }
        />
      </div>
      <div className={styles.chartsRow}>
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>
            {isPalta ? 'Materia Seca' : 'Brix'} — últimos 7 días
          </h3>
          <p className={styles.chartSubtitle}>
            Rango óptimo: {brixBand[0]} – {brixBand[1]}
            {isPalta ? '%' : '°Bx'}
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart
              data={brixTrend}
              margin={{ top: 8, right: 12, bottom: 4, left: -8 }}
            >
              <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis
                dataKey="fecha"
                tick={{ fill: '#8B949E', fontSize: 10 }}
                axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                tickLine={false}
                tickFormatter={(d: string) => d.slice(5)}
              />
              <YAxis
                tick={{ fill: '#8B949E', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                domain={['dataMin - 1', 'dataMax + 1']}
              />
              <Tooltip content={<ChartTooltip />} />
              <ReferenceArea
                y1={brixBand[0]}
                y2={brixBand[1]}
                fill="var(--color-accent-green-light)"
                fillOpacity={0.1}
                stroke="var(--color-accent-green-light)"
                strokeOpacity={0.25}
                strokeDasharray="3 3"
              />
              <Line
                type="monotone"
                dataKey="valor"
                name={isPalta ? 'MS %' : '°Bx'}
                stroke={varietyColor}
                strokeWidth={2}
                dot={{ fill: varietyColor, r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>
            {isCitricos ? 'Acidez' : 'Firmeza'} — últimos 7 días
          </h3>
          <p className={styles.chartSubtitle}>
            Rango óptimo: {firmezaBand[0]} – {firmezaBand[1]}
            {isCitricos ? '%' : isPalta ? ' N' : ' g/mm'}
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart
              data={firmezaTrend}
              margin={{ top: 8, right: 12, bottom: 4, left: -8 }}
            >
              <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis
                dataKey="fecha"
                tick={{ fill: '#8B949E', fontSize: 10 }}
                axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                tickLine={false}
                tickFormatter={(d: string) => d.slice(5)}
              />
              <YAxis
                tick={{ fill: '#8B949E', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                domain={['dataMin - 5', 'dataMax + 5']}
              />
              <Tooltip content={<ChartTooltip />} />
              <ReferenceArea
                y1={firmezaBand[0]}
                y2={firmezaBand[1]}
                fill="var(--color-accent-green-light)"
                fillOpacity={0.1}
                stroke="var(--color-accent-green-light)"
                strokeOpacity={0.25}
                strokeDasharray="3 3"
              />
              <ReferenceLine
                y={(firmezaBand[0] + firmezaBand[1]) / 2}
                stroke="rgba(255,255,255,0.15)"
                strokeDasharray="2 4"
              />
              <Line
                type="monotone"
                dataKey="valor"
                name={isCitricos ? '%' : isPalta ? 'N' : 'g/mm'}
                stroke={varietyColor}
                strokeWidth={2}
                dot={{ fill: varietyColor, r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* === Section 5 — Inspections table === */}
      <div className={styles.row}>
        <DataTable
          title="Inspecciones QC · últimas 24 horas"
          columns={columns}
          data={inspecciones as unknown as Record<string, unknown>[]}
          pageSize={12}
          searchable
        />
      </div>

      {/* === Section 6 — Benchmarks reference === */}
      <div className={styles.row}>
        <SectionHeader
          title="Parámetros de referencia por variedad"
          subtitle="Especificación de exportación · SENASA / APHIS / ProHass"
        />
      </div>
      <div className={styles.benchmarkCard}>
        <table className={styles.benchmarkTable}>
          <thead>
            <tr>
              <th>Variedad</th>
              <th>Brix · min – óptimo – max</th>
              <th>Firmeza / Acidez</th>
              <th>Calibre</th>
              <th>Temp. óptima</th>
              <th>Vida útil</th>
            </tr>
          </thead>
          <tbody>
            {mockBenchmarks.map((b) => {
              const isCit = b.variedad === 'Cítricos';
              const isPlt = b.variedad === 'Palta';
              const brixUnit = isPlt ? '% MS' : '°Bx';
              return (
                <tr key={b.variedad}>
                  <td>
                    <span
                      className={styles.varietyChip}
                      style={{
                        background:
                          varietyColors[b.variedad] ??
                          'var(--color-text-secondary)',
                      }}
                    >
                      {b.variedad}
                    </span>
                  </td>
                  <td>
                    {b.brixMin} – {b.brixOptimo} – {b.brixMax} {brixUnit}
                  </td>
                  <td>
                    {isCit
                      ? '0.8 – 1.5 % ácido cítrico'
                      : `${b.firmezaMin} – ${b.firmezaOptimo} – ${b.firmezaMax} ${
                          isPlt ? 'N' : 'g/mm'
                        }`}
                  </td>
                  <td>{b.calibreRango}</td>
                  <td>
                    {b.tempOptima}°C ± {b.tempTolerance}°C
                  </td>
                  <td>{b.vidaUtilDias} días</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </DashboardShell>
  );
}
