'use client';

import styles from './MiniGauge.module.css';

interface Props {
  value: number;
  max: number;
  color?: string;
  showValue?: boolean;
}

export function MiniGauge({
  value,
  max,
  color = 'var(--color-accent-green-light)',
  showValue = false,
}: Props) {
  const safeMax = max <= 0 ? 1 : max;
  const pct = Math.max(0, Math.min(100, (value / safeMax) * 100));

  return (
    <div className={styles.root}>
      <div className={styles.track} aria-hidden="true">
        <div
          className={styles.fill}
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      {showValue ? (
        <span className={styles.value}>{Math.round(pct)}%</span>
      ) : null}
    </div>
  );
}
