'use client';

import dynamic from 'next/dynamic';
import styles from './GraphIntelligenceView.module.css';

const PipelineCanvas = dynamic(
  () =>
    import('@/components/three/PipelineCanvas').then((m) => ({
      default: m.PipelineCanvas,
    })),
  { ssr: false },
);

export function GraphIntelligenceView() {
  return (
    <div className={styles.view} role="region" aria-label="Inteligencia de Grafo">
      <div className={styles.canvasMount} id="pipeline-canvas">
        <PipelineCanvas />
      </div>
      <div className={styles.legend} aria-hidden="true">
        <div className={styles.legendEyebrow}>Vista 3D</div>
        <div className={styles.legendTitle}>Inteligencia de Grafo</div>
        <div className={styles.legendBody}>
          Arrastra para orbitar · scroll para zoom · clic en una zona para
          inspeccionar lotes y embarques.
        </div>
      </div>
    </div>
  );
}
