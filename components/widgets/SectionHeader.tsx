'use client';

import type { ReactNode } from 'react';
import styles from './SectionHeader.module.css';

interface Props {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export function SectionHeader({ title, subtitle, icon, action }: Props) {
  return (
    <header className={styles.root}>
      <div className={styles.left}>
        {icon ? <span className={styles.icon}>{icon}</span> : null}
        <div className={styles.text}>
          <h2 className={styles.title}>{title}</h2>
          {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
        </div>
      </div>
      {action ? <div className={styles.action}>{action}</div> : null}
    </header>
  );
}
