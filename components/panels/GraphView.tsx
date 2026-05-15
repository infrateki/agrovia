'use client';

import { Network, Sparkles } from 'lucide-react';
import styles from './GraphView.module.css';

export function GraphView() {
  return (
    <div className={styles.wrap}>
      <span className={styles.iconWrap}>
        <Network size={32} />
      </span>
      <h3 className={styles.title}>Inteligencia de Grafo</h3>
      <p className={styles.subtitle}>
        Explora relaciones entre lotes, embarques, clientes y reclamos en un grafo
        consultable con lenguaje natural. Próximamente integrado con Neo4j + GraphRAG.
      </p>
      <span className={styles.badge}>
        <Sparkles size={12} />
        Próximamente en Fase 1
      </span>
    </div>
  );
}
