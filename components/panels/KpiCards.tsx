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
import type { KpiData } from '@/lib/types';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import styles from './KpiCards.module.css';

const ICONS: Record<string, LucideIcon> = {
  DollarSign,
  Ship,
  ShieldAlert,
  HeartPulse,
};

function KpiCard({ kpi }: { kpi: KpiData }) {
  const Icon = ICONS[kpi.icon] ?? Activity;
  return (
    <Card className={styles.kpi}>
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
