'use client';

import { AlertCircle, CheckCircle2, Clock, ShieldCheck } from 'lucide-react';
import { usePipelineStore } from '@/lib/stores/pipeline-store';
import type { BadgeVariant, DefenseItemStatus } from '@/lib/types';
import { Badge } from '@/components/ui/Badge';
import styles from './ClaimsDefense.module.css';

const STATUS_LABEL: Record<DefenseItemStatus, string> = {
  ready: 'Listo',
  draft: 'Borrador',
  missing: 'Falta',
};

const STATUS_VARIANT: Record<DefenseItemStatus, BadgeVariant> = {
  ready: 'good',
  draft: 'warn',
  missing: 'bad',
};

export function ClaimsDefense() {
  const items = usePipelineStore((s) => s.defenseItems);
  const ready = items.filter((i) => i.status === 'ready').length;
  const total = items.length;
  const pct = total === 0 ? 0 : Math.round((ready / total) * 100);

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>
          <ShieldCheck size={16} color="var(--color-accent-green-light)" />
          Carpeta de defensa de reclamo
        </div>
        <span className={styles.progressLabel}>{ready}/{total} listos</span>
      </div>

      <div className={styles.progressBar}>
        <div className={styles.progressFill} style={{ width: `${pct}%` }} />
      </div>

      <div className={styles.list}>
        {items.map((item) => {
          const Icon =
            item.status === 'ready'
              ? CheckCircle2
              : item.status === 'draft'
                ? Clock
                : AlertCircle;
          const colorClass =
            item.status === 'ready'
              ? styles.ready
              : item.status === 'draft'
                ? styles.draft
                : styles.missing;

          return (
            <div key={item.id} className={styles.row}>
              <span className={`${styles.statusIcon} ${colorClass}`}>
                <Icon size={18} />
              </span>
              <div className={styles.text}>
                <span className={styles.name}>{item.nombre}</span>
                <span className={styles.source}>Fuente: {item.fuente}</span>
              </div>
              <Badge
                text={STATUS_LABEL[item.status]}
                variant={STATUS_VARIANT[item.status]}
                size="sm"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
