'use client';

import { useEffect, useState } from 'react';
import { Database, FlaskConical } from 'lucide-react';
import type { DataConfidence } from '@/lib/types';
import styles from './DataSourceBadge.module.css';

interface DataSourceBadgeProps {
  source: string;
  timestamp: string;
  confidence?: DataConfidence;
  isMock?: boolean;
  className?: string;
}

function formatRelative(then: number, now: number): string {
  const diffMs = Math.max(0, now - then);
  const secs = Math.floor(diffMs / 1000);
  if (secs < 5) return 'ahora';
  if (secs < 60) return `hace ${secs}s`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `hace ${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `hace ${hours}h`;
  const days = Math.floor(hours / 24);
  return `hace ${days}d`;
}

export function DataSourceBadge({
  source,
  timestamp,
  confidence = 'high',
  isMock = true,
  className,
}: DataSourceBadgeProps) {
  // Defer relative time to client mount to avoid SSR hydration mismatch.
  const [rel, setRel] = useState<string>('');

  useEffect(() => {
    const then = new Date(timestamp).getTime();
    const tick = () => setRel(formatRelative(then, Date.now()));
    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, [timestamp]);

  const Icon = isMock ? FlaskConical : Database;
  const classes = [styles.badge, className ?? ''].filter(Boolean).join(' ');

  return (
    <span className={classes} title={`${source} · ${timestamp}`}>
      <span className={styles.iconWrap}>
        <Icon size={11} />
      </span>
      <span className={styles.source}>{isMock ? `${source} (mock)` : source}</span>
      <span className={styles.sep}>·</span>
      <span className={styles.time}>{rel || '—'}</span>
      <span
        className={`${styles.dot} ${styles[`dot-${confidence}`]}`}
        aria-label={`Confianza ${confidence}`}
      />
    </span>
  );
}
