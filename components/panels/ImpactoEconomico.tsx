'use client';

import { DollarSign } from 'lucide-react';
import styles from './ImpactoEconomico.module.css';

interface ImpactoEconomicoProps {
  valorEmbarque: number;
  probabilidadReclamo: number; // 0-1
  montoEstimado: number;
  moneda?: string;
}

function formatMoney(value: number, moneda = 'USD'): string {
  if (value === 0) return '—';
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M ${moneda}`;
  }
  if (value >= 1_000) {
    return `$${Math.round(value / 1_000)}K ${moneda}`;
  }
  return `$${value.toLocaleString('en-US')} ${moneda}`;
}

function severityClass(monto: number): string {
  if (monto >= 60_000) return 'sev-bad';
  if (monto >= 20_000) return 'sev-warn';
  return 'sev-good';
}

export function ImpactoEconomico({
  valorEmbarque,
  probabilidadReclamo,
  montoEstimado,
  moneda = 'USD',
}: ImpactoEconomicoProps) {
  const probPct = Math.round(probabilidadReclamo * 100);
  return (
    <div className={`${styles.card} ${styles[severityClass(montoEstimado)]}`}>
      <div className={styles.header}>
        <span className={styles.iconWrap}>
          <DollarSign size={14} />
        </span>
        <span className={styles.title}>Impacto económico</span>
      </div>

      <div className={styles.headlineRow}>
        <span className={styles.headlineLabel}>Exposición estimada</span>
        <span className={styles.headlineValue}>
          {formatMoney(montoEstimado, moneda)}
        </span>
      </div>

      <div className={styles.breakdown}>
        <div className={styles.row}>
          <span className={styles.rowLabel}>Valor embarque</span>
          <span className={styles.rowValue}>
            {formatMoney(valorEmbarque, moneda)}
          </span>
        </div>
        <div className={styles.row}>
          <span className={styles.rowLabel}>Prob. reclamo</span>
          <span className={styles.rowValue}>{probPct}%</span>
        </div>
        <div className={styles.row}>
          <span className={styles.rowLabel}>Monto estimado</span>
          <span className={styles.rowValue}>
            {formatMoney(montoEstimado, moneda)}
          </span>
        </div>
      </div>

      <div className={styles.barTrack} aria-hidden="true">
        <div
          className={styles.barFill}
          style={{ width: `${Math.min(100, probPct)}%` }}
        />
      </div>
    </div>
  );
}
