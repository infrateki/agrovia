'use client';

import { AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import styles from './AlertBanner.module.css';

interface Props {
  type: 'critical' | 'warning' | 'info';
  title: string;
  description?: string;
  action?: string;
  onAction?: () => void;
  onDismiss?: () => void;
}

const ICONS = {
  critical: AlertTriangle,
  warning: AlertCircle,
  info: Info,
};

export function AlertBanner({
  type,
  title,
  description,
  action,
  onAction,
  onDismiss,
}: Props) {
  const Icon = ICONS[type];
  return (
    <div
      className={[styles.root, styles[type]].join(' ')}
      role={type === 'critical' ? 'alert' : 'status'}
    >
      <span className={styles.iconWrap} aria-hidden="true">
        <Icon size={18} />
      </span>
      <div className={styles.body}>
        <p className={styles.title}>{title}</p>
        {description ? (
          <p className={styles.description}>{description}</p>
        ) : null}
      </div>
      <div className={styles.actions}>
        {action && onAction ? (
          <button type="button" className={styles.actionBtn} onClick={onAction}>
            {action}
          </button>
        ) : null}
        {onDismiss ? (
          <button
            type="button"
            className={styles.dismiss}
            onClick={onDismiss}
            aria-label="Cerrar alerta"
          >
            <X size={14} />
          </button>
        ) : null}
      </div>
    </div>
  );
}
