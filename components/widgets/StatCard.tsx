'use client';

import type { ReactNode } from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { TrendSparkline } from './TrendSparkline';
import styles from './StatCard.module.css';

interface Props {
  label: string;
  value: string;
  delta?: string;
  deltaType?: 'up' | 'down' | 'neutral';
  unit?: string;
  icon?: ReactNode;
  sparklineData?: number[];
  target?: string;
  onClick?: () => void;
  className?: string;
}

const DELTA_ICONS = {
  up: ArrowUpRight,
  down: ArrowDownRight,
  neutral: Minus,
};

export function StatCard({
  label,
  value,
  delta,
  deltaType = 'neutral',
  unit,
  icon,
  sparklineData,
  target,
  onClick,
  className,
}: Props) {
  const DeltaIcon = DELTA_ICONS[deltaType];
  const sparklineColor =
    deltaType === 'up'
      ? 'var(--color-accent-green-light)'
      : deltaType === 'down'
        ? 'var(--color-alert-red)'
        : 'var(--color-text-secondary)';

  const Tag = onClick ? 'button' : 'div';

  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={[
        styles.root,
        onClick ? styles.clickable : '',
        className ?? '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <header className={styles.header}>
        {icon ? <span className={styles.icon}>{icon}</span> : null}
        <span className={styles.label}>{label}</span>
      </header>

      <div className={styles.valueRow}>
        <span className={styles.value}>{value}</span>
        {unit ? <span className={styles.unit}>{unit}</span> : null}
      </div>

      {sparklineData && sparklineData.length > 1 ? (
        <div className={styles.sparkWrap}>
          <TrendSparkline
            data={sparklineData}
            width={120}
            height={28}
            color={sparklineColor}
            showArea
          />
        </div>
      ) : null}

      <footer className={styles.footer}>
        {delta ? (
          <span
            className={[styles.delta, styles[`delta_${deltaType}`]].join(' ')}
          >
            <DeltaIcon size={12} aria-hidden="true" />
            {delta}
          </span>
        ) : null}
        {target ? <span className={styles.target}>Meta: {target}</span> : null}
      </footer>
    </Tag>
  );
}
