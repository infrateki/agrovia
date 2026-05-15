'use client';

import type { ReactNode } from 'react';
import { SectionHeader } from './SectionHeader';
import styles from './DashboardShell.module.css';

interface Props {
  children: ReactNode;
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  alerts?: ReactNode;
  className?: string;
}

export function DashboardShell({
  children,
  title,
  subtitle,
  icon,
  alerts,
  className,
}: Props) {
  return (
    <div
      className={[styles.root, className].filter(Boolean).join(' ')}
      role="region"
      aria-label={title}
    >
      <div className={styles.inner}>
        <SectionHeader title={title} subtitle={subtitle} icon={icon} />
        {alerts ? <div className={styles.alerts}>{alerts}</div> : null}
        <div className={styles.grid}>{children}</div>
      </div>
    </div>
  );
}
