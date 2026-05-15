import type { ReactNode } from 'react';
import styles from './Card.module.css';

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  icon?: ReactNode;
  noPadding?: boolean;
}

export function Card({ children, className, title, icon, noPadding }: CardProps) {
  const classes = [styles.card, noPadding ? styles.noPadding : '', className ?? '']
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes}>
      {title ? (
        <div className={styles.header}>
          {icon ? <span className={styles.icon}>{icon}</span> : null}
          <span className={styles.title}>{title}</span>
        </div>
      ) : null}
      {children}
    </div>
  );
}
