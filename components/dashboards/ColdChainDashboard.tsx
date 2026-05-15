'use client';

import { useMemo } from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  AlertTriangle,
  Ship,
  Snowflake,
  Thermometer,
} from 'lucide-react';
import {
  AlertBanner,
  CircularGauge,
  DashboardShell,
  DataTable,
  MiniGauge,
  SectionHeader,
  StatCard,
} from '@/components/widgets';
import {
  MOCK_CAMARAS,
  MOCK_EMBARQUE_TEMP_MONITOR,
  MOCK_EXCURSION_HISTORY,
  MOCK_TEMP_24H,
} from '@/lib/data';
import type { TempReading24h } from '@/lib/data';
import { useSelectionStore } from '@/lib/stores/selection-store';
import type {
  CamaraFrioStatus,
  ColumnDef,
  ExcursionEvent,
} from '@/lib/types';
import styles from './ColdChainDashboard.module.css';

// === Chamber line config ===
interface ChamberLine {
  key: keyof Omit<TempReading24h, 'timestamp' | 'label'>;
  label: string;
  color: string;
}

const CHAMBER_LINES: ChamberLine[] = [
  { key: 'cf01', label: 'CF-01 Arándano', color: '#6B21A8' },
  { key: 'cf02', label: 'CF-02 Arándano', color: '#8B5CF6' },
  { key: 'cf03', label: 'CF-03 Uva', color: '#2D6B30' },
  { key: 'cf04', label: 'CF-04 Palta', color: '#D4A843' },
  { key: 'cf05', label: 'CF-05 Mango', color: '#FF8800' },
  { key: 'cf06', label: 'CF-06 Pre-Cool', color: '#4488FF' },
];

// === Variety badge colors ===
const VARIETY_COLORS: Record<string, { bg: string; fg: string; border: string }> = {
  Arándano: {
    bg: 'color-mix(in srgb, #6B21A8 22%, transparent)',
    fg: '#C4B5FD',
    border: 'color-mix(in srgb, #6B21A8 40%, transparent)',
  },
  Uva: {
    bg: 'color-mix(in srgb, #2D6B30 22%, transparent)',
    fg: '#86EFAC',
    border: 'color-mix(in srgb, #2D6B30 45%, transparent)',
  },
  Palta: {
    bg: 'color-mix(in srgb, #D4A843 22%, transparent)',
    fg: '#FCD34D',
    border: 'color-mix(in srgb, #D4A843 45%, transparent)',
  },
  Mango: {
    bg: 'color-mix(in srgb, #FF8800 22%, transparent)',
    fg: '#FDBA74',
    border: 'color-mix(in srgb, #FF8800 45%, transparent)',
  },
  'Pre-Cool': {
    bg: 'color-mix(in srgb, #4488FF 22%, transparent)',
    fg: '#93C5FD',
    border: 'color-mix(in srgb, #4488FF 45%, transparent)',
  },
};

function deltaClass(absDelta: number): string {
  if (absDelta > 1.0) return styles.deltaRed ?? '';
  if (absDelta >= 0.5) return styles.deltaAmber ?? '';
  return styles.deltaGreen ?? '';
}

function tempColor(absDelta: number): string {
  if (absDelta > 1.0) return 'var(--color-alert-red)';
  if (absDelta >= 0.5) return 'var(--color-alert-amber)';
  return 'var(--color-accent-green-light)';
}

function formatSigned(n: number): string {
  return `${n >= 0 ? '+' : ''}${n.toFixed(1)}°C`;
}

interface ChartTooltipPayload {
  dataKey: string;
  value: number;
  color: string;
  payload: TempReading24h;
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: ChartTooltipPayload[];
  label?: string;
}

function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className={styles.tooltip}>
      <div className={styles.tooltipTime}>{label}</div>
      {CHAMBER_LINES.map((cl) => {
        const p = payload.find((row) => row.dataKey === cl.key);
        if (!p) return null;
        return (
          <div key={cl.key} className={styles.tooltipRow}>
            <span
              className={styles.tooltipSwatch}
              style={{ background: cl.color }}
            />
            <span className={styles.tooltipLabel}>{cl.label}</span>
            <span className={styles.tooltipValue}>{p.value.toFixed(2)}°C</span>
          </div>
        );
      })}
    </div>
  );
}

export function ColdChainDashboard() {
  const setSelectedZone = useSelectionStore((s) => s.setSelectedZone);
  const setSelectedObjectId = useSelectionStore((s) => s.setSelectedObjectId);

  // === Camera status table ===
  const camaraColumns: ColumnDef[] = useMemo(
    () => [
      { key: 'id', label: 'Cámara', type: 'text', width: '90px', sortable: true },
      {
        key: 'producto',
        label: 'Producto',
        width: '120px',
        render: (value: unknown) => {
          const v = String(value);
          const c = VARIETY_COLORS[v];
          if (!c) return v;
          return (
            <span
              className={styles.varietyBadge}
              style={{
                background: c.bg,
                color: c.fg,
                borderColor: c.border,
              }}
            >
              {v}
            </span>
          );
        },
      },
      {
        key: 'setPoint',
        label: 'Set Point',
        type: 'number',
        align: 'right',
        width: '90px',
        sortable: true,
        render: (value: unknown) => (
          <span className={styles.tempCell}>{Number(value).toFixed(1)}°C</span>
        ),
      },
      {
        key: 'tempActual',
        label: 'Temp Actual',
        align: 'right',
        width: '100px',
        sortable: true,
        render: (value: unknown, row: unknown) => {
          const r = row as CamaraFrioStatus & { absDelta: number };
          return (
            <span
              className={styles.tempCell}
              style={{ color: tempColor(r.absDelta) }}
            >
              {Number(value).toFixed(1)}°C
            </span>
          );
        },
      },
      {
        key: 'deltaTemp',
        label: 'Delta',
        align: 'right',
        width: '90px',
        sortable: true,
        render: (value: unknown, row: unknown) => {
          const r = row as CamaraFrioStatus & { absDelta: number };
          const num = Number(value);
          return (
            <span className={deltaClass(r.absDelta)}>
              {formatSigned(num)}
            </span>
          );
        },
      },
      {
        key: 'humedadPct',
        label: 'Humedad',
        align: 'left',
        width: '120px',
        render: (value: unknown) => {
          const pct = Number(value);
          const inRange = pct >= 90 && pct <= 95;
          const color = inRange
            ? 'var(--color-accent-green-light)'
            : 'var(--color-alert-amber)';
          return (
            <div className={styles.humidityCell}>
              <span className={styles.humidityText}>{pct}%</span>
              <div style={{ flex: 1, minWidth: 40 }}>
                <MiniGauge value={pct} max={100} color={color} />
              </div>
            </div>
          );
        },
      },
      {
        key: 'pallets',
        label: 'Pallets',
        align: 'left',
        width: '140px',
        render: (_value: unknown, row: unknown) => {
          const r = row as CamaraFrioStatus;
          const pct = (r.palletsActuales / r.palletsCapacidad) * 100;
          return (
            <div className={styles.palletCell}>
              <span className={styles.palletText}>
                {r.palletsActuales}/{r.palletsCapacidad}
              </span>
              <div className={styles.palletGauge}>
                <MiniGauge
                  value={pct}
                  max={100}
                  color="var(--color-cold-blue)"
                />
              </div>
            </div>
          );
        },
      },
      {
        key: 'horasOperacion',
        label: 'Hrs Op',
        type: 'number',
        align: 'right',
        width: '80px',
        sortable: true,
        render: (value: unknown) => (
          <span className={styles.tempCell}>{Number(value).toFixed(1)}h</span>
        ),
      },
      {
        key: 'estado',
        label: 'Estado',
        type: 'badge',
        width: '100px',
        sortable: true,
      },
      {
        key: 'ultimaLectura',
        label: 'Última',
        align: 'right',
        width: '80px',
        render: (value: unknown) => (
          <span className={styles.palletText}>{String(value)}</span>
        ),
      },
    ],
    [],
  );

  const camaraRows = useMemo(() => {
    const productByCamId: Record<string, string> = {
      'CF-01': 'Arándano',
      'CF-02': 'Arándano',
      'CF-03': 'Uva',
      'CF-04': 'Palta',
      'CF-05': 'Mango',
      'CF-06': 'Pre-Cool',
    };
    return MOCK_CAMARAS.map((c) => ({
      ...c,
      producto: productByCamId[c.id] ?? '—',
      pallets: `${c.palletsActuales}/${c.palletsCapacidad}`,
      absDelta: Math.abs(c.deltaTemp),
    })) as unknown as Record<string, unknown>[];
  }, []);

  // === Embarques en tránsito ===
  const embarqueColumns: ColumnDef[] = useMemo(
    () => [
      {
        key: 'embarque',
        label: 'Embarque',
        width: '100px',
        sortable: true,
        render: (value: unknown) => (
          <strong style={{ fontWeight: 700 }}>{String(value)}</strong>
        ),
      },
      { key: 'contenedor', label: 'Contenedor', width: '140px', sortable: true },
      { key: 'destino', label: 'Destino', width: '180px', sortable: true },
      {
        key: 'setPoint',
        label: 'Set Point',
        align: 'right',
        width: '90px',
        sortable: true,
        render: (value: unknown) => (
          <span className={styles.tempCell}>{Number(value).toFixed(1)}°C</span>
        ),
      },
      {
        key: 'tempActual',
        label: 'Temp Actual',
        align: 'right',
        width: '100px',
        sortable: true,
        render: (value: unknown, row: unknown) => {
          const r = row as { tempActual: number; deltaTemp: number };
          const abs = Math.abs(r.deltaTemp);
          return (
            <span
              className={styles.tempCell}
              style={{ color: tempColor(abs) }}
            >
              {Number(value).toFixed(1)}°C
            </span>
          );
        },
      },
      {
        key: 'deltaTemp',
        label: 'Delta',
        align: 'right',
        width: '90px',
        sortable: true,
        render: (value: unknown) => {
          const num = Number(value);
          const abs = Math.abs(num);
          return (
            <span className={deltaClass(abs)}>{formatSigned(num)}</span>
          );
        },
      },
      {
        key: 'diasTransito',
        label: 'Días',
        type: 'number',
        align: 'right',
        width: '70px',
        sortable: true,
      },
      { key: 'eta', label: 'ETA', width: '90px', align: 'right' },
      {
        key: 'alertas',
        label: 'Alertas',
        align: 'center',
        width: '90px',
        sortable: true,
        render: (value: unknown) => {
          const n = Number(value);
          if (n <= 0) return <span className={styles.alertasZero}>—</span>;
          return <span className={styles.alertasBadge}>{n}</span>;
        },
      },
      { key: 'estado', label: 'Estado', type: 'badge', width: '100px', sortable: true },
    ],
    [],
  );

  const embarqueRows = useMemo(
    () => MOCK_EMBARQUE_TEMP_MONITOR as unknown as Record<string, unknown>[],
    [],
  );

  // === Excursion history columns ===
  const excursionColumns: ColumnDef[] = useMemo(
    () => [
      { key: 'fecha', label: 'Fecha', width: '150px', sortable: true },
      { key: 'ubicacion', label: 'Ubicación', sortable: true },
      { key: 'duracion', label: 'Duración', align: 'right', width: '100px' },
      {
        key: 'tempMax',
        label: 'Temp Máx',
        align: 'right',
        width: '100px',
        sortable: true,
        render: (value: unknown) => (
          <span className={styles.tempMaxRed}>
            {Number(value).toFixed(1)}°C
          </span>
        ),
      },
      { key: 'productoAfectado', label: 'Producto', width: '180px' },
      {
        key: 'impacto',
        label: 'Impacto',
        width: '110px',
        sortable: true,
        render: (value: unknown) => {
          const v = String(value);
          const cls =
            v === 'severo'
              ? styles.impactoSevero
              : v === 'moderado'
                ? styles.impactoModerado
                : styles.impactoLeve;
          return <span className={`${styles.varietyBadge} ${cls}`}>{v}</span>;
        },
      },
      { key: 'accionTomada', label: 'Acción Tomada' },
    ],
    [],
  );

  const excursionRows = useMemo(
    () => MOCK_EXCURSION_HISTORY as unknown as Record<string, unknown>[],
    [],
  );

  // === Handlers ===
  const handleCamaraClick = (row: Record<string, unknown>) => {
    const cam = row as unknown as CamaraFrioStatus;
    setSelectedZone('frio');
    setSelectedObjectId(`frio:${cam.id}`);
  };

  const handleEmbarqueClick = (row: Record<string, unknown>) => {
    const r = row as { id: string };
    setSelectedZone('transito');
    setSelectedObjectId(r.id);
  };

  // === Active excursion banner ===
  const hasActiveExcursion = true; // mock: always show for S-8842

  return (
    <DashboardShell
      title="Cadena de Frío"
      subtitle="Monitoreo en tiempo real · 6 cámaras · 8 embarques activos"
      icon={<Snowflake size={20} />}
      alerts={
        hasActiveExcursion ? (
          <AlertBanner
            type="critical"
            title="⚠️ Excursión activa: Contenedor MSCU-7842190 (S-8842)"
            description="Temp: +5.8°C durante 2h — Arándano exportación EE.UU."
            action="Ver embarque"
            onAction={() => {
              setSelectedZone('transito');
              setSelectedObjectId('S-8842');
            }}
          />
        ) : null
      }
    >
      {/* === Section 1: Gauges === */}
      <div className={styles.gaugesRow}>
        <CircularGauge
          label="Cámaras Operativas"
          value={5}
          min={0}
          max={6}
          unit="de 6"
          colorZones={{ green: [83, 100], amber: [50, 83], red: [0, 50] }}
        />
        <CircularGauge
          label="Temp Promedio"
          value={0.3}
          min={-5}
          max={15}
          unit="°C"
          colorZones={{ green: [15, 35], amber: [35, 50], red: [50, 100] }}
        />
        <CircularGauge
          label="Adherencia Set Point"
          value={94.5}
          min={0}
          max={100}
          target={98}
          unit="%"
          colorZones={{ green: [95, 100], amber: [85, 95], red: [0, 85] }}
        />
        <CircularGauge
          label="Excursiones (7d)"
          value={3}
          min={0}
          max={20}
          unit="eventos"
          colorZones={{ green: [0, 10], amber: [10, 25], red: [25, 100] }}
          invertZones
        />
      </div>

      {/* === Section 2: Stat cards === */}
      <div className={styles.statsRow} style={{ gridColumn: '1 / -1' }}>
        <StatCard
          label="Contenedores en Tránsito"
          value="12"
          delta="2 con alerta"
          deltaType="down"
        />
        <StatCard
          label="Pre-Cooling Activo"
          value="3 lotes"
          delta="Est. 4h restantes"
        />
        <StatCard
          label="Hrs Promedio en Cámara"
          value="18.5h"
          target="Óptimo: 24h"
        />
        <StatCard
          label="Humedad Promedio"
          value="92%"
          target="Rango: 90-95%"
        />
        <StatCard
          label="Pallets en Frío"
          value="142 de 180"
          delta="79% capacidad"
        />
        <StatCard
          label="Próximo Despacho"
          value="14:30"
          delta="MSCU-7842190"
        />
      </div>

      {/* === Section 3: HERO temperature chart === */}
      <div className={styles.section}>
        <div className={styles.sectionInner}>
          <SectionHeader
            title="Monitoreo de temperatura — Últimas 24 horas"
            subtitle="6 cámaras · lecturas cada 30 min · rango aceptable [−1°C, +1°C] · umbral crítico +4°C"
            icon={<Thermometer size={18} />}
          />
          <div className={styles.heroChart}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={MOCK_TEMP_24H}
                margin={{ top: 16, right: 24, left: 0, bottom: 8 }}
              >
                <CartesianGrid
                  stroke="rgba(255,255,255,0.05)"
                  vertical={false}
                />
                <XAxis
                  dataKey="label"
                  stroke="#8B949E"
                  tick={{ fill: '#8B949E', fontSize: 10 }}
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                  interval={5}
                />
                <YAxis
                  domain={[-3, 15]}
                  ticks={[-3, -1, 0, 1, 4, 8, 12, 15]}
                  stroke="#8B949E"
                  tick={{ fill: '#8B949E', fontSize: 10 }}
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                  width={36}
                  tickFormatter={(v: number) => `${v}°`}
                />
                <ReferenceArea
                  y1={-1}
                  y2={1}
                  fill="#2D8B5E"
                  fillOpacity={0.12}
                  stroke="rgba(45, 139, 94, 0.35)"
                  strokeDasharray="3 3"
                  label={{
                    value: 'Rango berries',
                    position: 'insideTopLeft',
                    fill: 'rgba(134, 239, 172, 0.7)',
                    fontSize: 10,
                  }}
                />
                <ReferenceLine
                  y={4}
                  stroke="#FF4444"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  label={{
                    value: 'Crítico +4°C',
                    position: 'right',
                    fill: '#FF4444',
                    fontSize: 10,
                  }}
                />
                <Tooltip
                  content={<ChartTooltip />}
                  cursor={{
                    stroke: 'rgba(255,255,255,0.12)',
                    strokeWidth: 1,
                  }}
                />
                {CHAMBER_LINES.map((cl) => (
                  <Line
                    key={cl.key}
                    type="monotone"
                    dataKey={cl.key}
                    name={cl.label}
                    stroke={cl.color}
                    strokeWidth={1.8}
                    dot={false}
                    activeDot={{ r: 4, fill: cl.color, strokeWidth: 0 }}
                    isAnimationActive={false}
                  />
                ))}
                <Legend
                  verticalAlign="bottom"
                  iconType="line"
                  wrapperStyle={{
                    paddingTop: 8,
                    fontSize: 11,
                    color: '#8B949E',
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* === Section 4: Cámaras status table === */}
      <div className={styles.section}>
        <div className={styles.sectionInner}>
          <SectionHeader
            title="Estado de cámaras de frío"
            subtitle="Click una cámara para inspeccionar en 3D"
            icon={<Snowflake size={18} />}
          />
          <DataTable
            columns={camaraColumns}
            data={camaraRows}
            onRowClick={handleCamaraClick}
            pageSize={10}
          />
        </div>
      </div>

      {/* === Section 5: Embarques en tránsito === */}
      <div className={styles.section}>
        <div className={styles.sectionInner}>
          <SectionHeader
            title="Contenedores en tránsito — Monitoreo de frío"
            subtitle="Click un embarque para seguir en 3D"
            icon={<Ship size={18} />}
          />
          <DataTable
            columns={embarqueColumns}
            data={embarqueRows}
            onRowClick={handleEmbarqueClick}
            pageSize={10}
            searchable
          />
        </div>
      </div>

      {/* === Section 6: Excursion history === */}
      <div className={styles.section}>
        <div className={styles.sectionInner}>
          <SectionHeader
            title="Historial de excursiones — Últimos 7 días"
            subtitle={`${MOCK_EXCURSION_HISTORY.length} eventos · 1 severo · 1 moderado · 3 leves`}
            icon={<AlertTriangle size={18} />}
          />
          <DataTable
            columns={excursionColumns}
            data={excursionRows}
            pageSize={10}
          />
        </div>
      </div>
    </DashboardShell>
  );
}

// Re-export for type consumers in case other modules import this file.
export type { ExcursionEvent };
