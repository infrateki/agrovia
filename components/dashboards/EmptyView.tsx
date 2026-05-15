'use client';

import styles from './EmptyView.module.css';

interface Props {
  title: string;
  subtitle?: string;
}

export function EmptyView({ title, subtitle }: Props) {
  return (
    <div className={styles.view} role="region" aria-label={title}>
      <div className={styles.card}>
        <div className={styles.eyebrow}>AgroVIA · FRESCO</div>
        <div className={styles.title}>{title}</div>
        <p className={styles.subtitle}>
          {subtitle ??
            'Esta vista está en construcción para la próxima iteración. Mientras tanto, los datos ya están conectados al modelo y disponibles desde el operador.'}
        </p>
        <span className={styles.badge}>Próximamente</span>
      </div>
    </div>
  );
}
