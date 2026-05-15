'use client';

import {
  DollarSign,
  Ship,
  ShieldAlert,
  HeartPulse,
  Activity,
  type LucideIcon,
} from 'lucide-react';
import { usePipelineStore } from '@/lib/stores/pipeline-store';
import type { DataConfidence, KpiData } from '@/lib/types';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { DataSourceBadge } from './DataSourceBadge';
import styles from './KpiCards.module.css';

const ICONS: Record<string, LucideIcon> = {
  DollarSign,
  Ship,
  ShieldAlert,
  HeartPulse,
};

const KPI_SOURCES: Record<string, { source: string; confidence: DataConfidence }> = {
  'revenue-risk': { source: 'GraphRAG · ERP Nisira', confidence: 'high' },
  shipments: { source: 'CRM · Loggers reefer', confidence: 'high' },
  'claims-exposure': { source: 'CRM postventa', confidence: 'medium' },
  'portfolio-health': { source: 'Modelo riesgo FRESCO', confidence: 'medium' },
};

const FROZEN_TIMESTAMP = '2026-05-15T08:30:00Z';

function KpiCard({ kpi }: { kpi: KpiData }) {
  const Icon = ICONS[kpi.icon] ?? Activity;
  const meta = KPI_SOURCES[kpi.id] ?? {
    source: 'Datos mock',
    confidence: 'medium' as DataConfidence,
  };
  const pulseClass = kpi.badgeVariant === 'bad' ? styles.pulseBad : '';

  return (
    <Card className={`${styles.kpi} ${pulseClass}`}>
      <div className={styles.top}>
        <span className={styles.icon}>
          <Icon size={20} />
        </span>
        <span className={styles.label}>{kpi.label}</span>
      </div>
      <div className={styles.value}>{kpi.value}</div>
      <div className={styles.badgeRow}>
        <Badge text={kpi.badge} variant={kpi.badgeVariant} size="sm" />
      </div>
      <div className={styles.sourceRow}>
        <DataSourceBadge
          source={meta.source}
          timestamp={FROZEN_TIMESTAMP}
          confidence={meta.confidence}
          isMock
        />
      </div>
    </Card>
  );
}

export function KpiCards() {
  const kpis = usePipelineStore((s) => s.kpis);
  return (
    <div className={styles.grid}>
      {kpis.map((kpi) => (
        <KpiCard key={kpi.id} kpi={kpi} />
      ))}
    </div>
  );
}
