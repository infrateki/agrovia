'use client';

import { Lightbulb, Play } from 'lucide-react';
import type { ReactNode } from 'react';
import styles from './CausaAccionCard.module.css';

interface CausaAccionCardProps {
  type: 'causa' | 'accion';
  title: string;
  items: string[];
  icon?: ReactNode;
}

export function CausaAccionCard({
  type,
  title,
  items,
  icon,
}: CausaAccionCardProps) {
  const defaultIcon =
    type === 'causa' ? <Lightbulb size={14} /> : <Play size={14} />;

  return (
    <div className={`${styles.card} ${styles[type]}`}>
      <div className={styles.header}>
        <span className={styles.iconWrap}>{icon ?? defaultIcon}</span>
        <span className={styles.title}>{title}</span>
      </div>
      {type === 'accion' ? (
        <ol className={styles.list}>
          {items.map((item, idx) => (
            <li key={`${idx}-${item.slice(0, 16)}`}>
              <span className={styles.bullet}>{idx + 1}</span>
              <span>{item}</span>
            </li>
          ))}
        </ol>
      ) : (
        <ul className={`${styles.list} ${styles.bulletList}`}>
          {items.map((item, idx) => (
            <li key={`${idx}-${item.slice(0, 16)}`}>
              <span className={styles.dot} />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
