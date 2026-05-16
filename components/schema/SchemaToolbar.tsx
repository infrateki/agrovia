'use client';

import { useMemo } from 'react';
import { Layers, Database, Workflow, Grid3x3 } from 'lucide-react';
import {
  countNodesByLayer,
  countNodesByStatus,
  LAYER_LABELS,
  LAYER_ORDER,
  STATUS_COLORS,
  STATUS_LABELS,
  type Status,
} from '@/lib/architecture/schema-map';
import styles from './SchemaToolbar.module.css';

export type SchemaMode = 'stack' | 'erd' | 'flow' | 'maturity';

const MODES: { id: SchemaMode; label: string; icon: typeof Layers }[] = [
  { id: 'stack', label: 'Stack', icon: Layers },
  { id: 'erd', label: 'ERD', icon: Database },
  { id: 'flow', label: 'Flow', icon: Workflow },
  { id: 'maturity', label: 'Maturity', icon: Grid3x3 },
];

const STATUS_ORDER: Status[] = [
  'implemented',
  'partial',
  'mock',
  'planned',
  'needed',
];

interface Props {
  mode: SchemaMode;
  onModeChange: (mode: SchemaMode) => void;
}

export function SchemaToolbar({ mode, onModeChange }: Props) {
  const layerCounts = useMemo(() => countNodesByLayer(), []);
  const statusCounts = useMemo(() => countNodesByStatus(), []);
  const total = useMemo(
    () => Object.values(layerCounts).reduce((a, b) => a + b, 0),
    [layerCounts],
  );

  return (
    <header className={styles.bar}>
      <div className={styles.left}>
        <h1 className={styles.title}>SCHEMA</h1>
        <span className={styles.subtitle}>
          Arquitectura de datos · {total} nodos registrados
        </span>
      </div>

      <div className={styles.modes} role="tablist" aria-label="Modo de vista">
        {MODES.map(({ id, label, icon: Icon }) => {
          const active = mode === id;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={active}
              className={`${styles.modeBtn} ${active ? styles.modeActive : ''}`}
              onClick={() => onModeChange(id)}
            >
              <Icon size={13} strokeWidth={1.6} aria-hidden="true" />
              <span>{label}</span>
            </button>
          );
        })}
      </div>

      <div className={styles.legend} aria-label="Leyenda de estados">
        {STATUS_ORDER.map((s) => (
          <span key={s} className={styles.legendItem}>
            <span
              className={styles.dot}
              style={{ background: STATUS_COLORS[s] }}
              aria-hidden="true"
            />
            <span className={styles.legendLabel}>{STATUS_LABELS[s]}</span>
            <span className={styles.legendCount}>{statusCounts[s]}</span>
          </span>
        ))}
      </div>

      <div className={styles.layerSummary} aria-label="Conteo por capa">
        {LAYER_ORDER.map((layer) => (
          <span key={layer} className={styles.layerChip}>
            <span className={styles.layerChipLabel}>
              {LAYER_LABELS[layer]}
            </span>
            <span className={styles.layerChipCount}>
              {layerCounts[layer]}
            </span>
          </span>
        ))}
      </div>
    </header>
  );
}
