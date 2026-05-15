'use client';

import { useMemo } from 'react';
import { X } from 'lucide-react';
import { usePipelineStore } from '@/lib/stores/pipeline-store';
import { findFichaForEmbarque } from '@/lib/data/mock-fichas';
import { ZONE_LABELS } from '@/lib/constants';
import { FichaOperativa } from './FichaOperativa';
import { TemperaturaCurve } from './TemperaturaCurve';
import styles from './ShipmentDetailPanel.module.css';

interface Props {
  id: string;
  onClose: () => void;
}

function riskClass(score: number): string {
  if (score >= 80) return styles.riskDotHigh;
  if (score >= 55) return styles.riskDotMid;
  return styles.riskDotLow;
}

export function ShipmentDetailPanel({ id, onClose }: Props) {
  const embarques = usePipelineStore((s) => s.embarques);

  const embarque = useMemo(
    () => embarques.find((e) => e.id === id),
    [embarques, id],
  );

  const ficha = useMemo(() => findFichaForEmbarque(id), [id]);

  return (
    <aside
      className={styles.card}
      role="dialog"
      aria-label={`Detalle embarque ${id}`}
    >
      <div className={styles.header}>
        <div className={styles.titleBlock}>
          <span className={styles.eyebrow}>Embarque</span>
          <span className={styles.title}>
            {ficha?.titulo ?? embarque?.id ?? id}
          </span>
        </div>
        <button
          type="button"
          className={styles.close}
          onClick={onClose}
          aria-label="Cerrar detalle"
        >
          <X size={14} strokeWidth={1.6} />
        </button>
      </div>

      <div className={styles.body}>
        {ficha ? (
          <FichaOperativa ficha={ficha} />
        ) : embarque ? (
          <>
            <div className={styles.riskRow}>
              <span
                className={`${styles.riskDot} ${riskClass(embarque.riskScore)}`}
                aria-hidden="true"
              />
              <span>Riesgo {embarque.riskScore} · {ZONE_LABELS[embarque.currentZone]}</span>
            </div>
            <div className={styles.kvGrid}>
              <div className={styles.kv}>
                <div className={styles.kvLabel}>Contenedor</div>
                <div className={styles.kvValue}>{embarque.contenedor}</div>
              </div>
              <div className={styles.kv}>
                <div className={styles.kvLabel}>Naviera</div>
                <div className={styles.kvValue}>{embarque.naviera}</div>
              </div>
              <div className={styles.kv}>
                <div className={styles.kvLabel}>ETA</div>
                <div className={styles.kvValue}>{embarque.eta}</div>
              </div>
              <div className={styles.kv}>
                <div className={styles.kvLabel}>Estado</div>
                <div className={styles.kvValue}>{embarque.status}</div>
              </div>
            </div>
            <TemperaturaCurve embarqueId={embarque.id} height={180} />
          </>
        ) : (
          <div className={styles.empty}>
            Sin datos para el embarque {id}.
          </div>
        )}
      </div>
    </aside>
  );
}
