'use client';

import dynamic from 'next/dynamic';
import { BottomBar } from '@/components/layout/BottomBar';
import styles from './OperationsSimView.module.css';

// Recovered Phase-1 3D pipeline scene (PipelineCanvas) — previously rendered
// under the "Grafo" tab. Phase 5.1 moved it to its own SIM tab so the Grafo
// tab can be the ontology knowledge graph without losing the plant simulation.

const PipelineCanvas = dynamic(
  () =>
    import('@/components/three/PipelineCanvas').then((m) => ({
      default: m.PipelineCanvas,
    })),
  { ssr: false },
);

export function OperationsSimView() {
  return (
    <div
      className={styles.view}
      role="region"
      aria-label="Simulación de planta · Cosecha → Llegada"
    >
      <div className={styles.canvasMount} id="pipeline-canvas">
        <PipelineCanvas />
      </div>

      <div className={styles.legend} aria-hidden="true">
        <div className={styles.legendEyebrow}>Simulación 3D</div>
        <div className={styles.legendTitle}>Planta postcosecha</div>
        <div className={styles.legendBody}>
          Cosecha → Selección → Packing → Frío → Embarque → Tránsito → Llegada.
          Arrastra para orbitar · scroll para zoom · clic en una zona para
          inspeccionar lotes y embarques.
        </div>
      </div>

      <div className={styles.bottomBarMount}>
        <BottomBar />
      </div>
    </div>
  );
}
