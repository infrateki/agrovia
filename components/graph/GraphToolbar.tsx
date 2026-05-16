'use client';

import { RotateCcw, Search } from 'lucide-react';
import type { ChangeEvent } from 'react';
import {
  ALL_NODE_KINDS,
  getNodeAccent,
  getNodeLabelES,
  type NodeKind,
} from '@/lib/ontology/schema';
import styles from './GraphToolbar.module.css';

export type GraphLayer = 'ontology' | 'instance' | 'hybrid';

interface Props {
  layer: GraphLayer;
  onLayerChange: (l: GraphLayer) => void;
  visibleTypes: Set<NodeKind>;
  onToggleType: (k: NodeKind) => void;
  search: string;
  onSearchChange: (v: string) => void;
  onRelayout: () => void;
}

const LAYER_OPTIONS: { id: GraphLayer; label: string }[] = [
  { id: 'ontology', label: 'Ontología' },
  { id: 'instance', label: 'Instancia' },
  { id: 'hybrid', label: 'Híbrido' },
];

export function GraphToolbar({
  layer,
  onLayerChange,
  visibleTypes,
  onToggleType,
  search,
  onSearchChange,
  onRelayout,
}: Props) {
  function onInput(e: ChangeEvent<HTMLInputElement>) {
    onSearchChange(e.target.value);
  }

  return (
    <div className={styles.bar} role="toolbar" aria-label="Controles del grafo">
      <div className={styles.segment} role="radiogroup" aria-label="Capa de grafo">
        {LAYER_OPTIONS.map((opt) => {
          const active = layer === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              role="radio"
              aria-checked={active}
              className={`${styles.segmentBtn} ${active ? styles.segmentBtnActive : ''}`}
              onClick={() => onLayerChange(opt.id)}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      <div className={styles.divider} aria-hidden="true" />

      <div className={styles.chips}>
        {ALL_NODE_KINDS.map((kind) => {
          const visible = visibleTypes.has(kind);
          const accent = getNodeAccent(kind);
          return (
            <button
              key={kind}
              type="button"
              className={`${styles.chip} ${visible ? styles.chipOn : ''}`}
              onClick={() => onToggleType(kind)}
              style={
                visible
                  ? {
                      borderColor: accent,
                      color: accent,
                    }
                  : undefined
              }
              aria-pressed={visible}
              aria-label={`Mostrar ${getNodeLabelES(kind)}`}
            >
              <span
                className={styles.chipDot}
                style={{ background: accent }}
                aria-hidden="true"
              />
              {getNodeLabelES(kind)}
            </button>
          );
        })}
      </div>

      <div className={styles.divider} aria-hidden="true" />

      <div className={styles.searchWrap}>
        <Search size={13} strokeWidth={1.6} className={styles.searchIcon} aria-hidden="true" />
        <input
          type="search"
          className={styles.searchInput}
          placeholder="Buscar nodo..."
          value={search}
          onChange={onInput}
          aria-label="Buscar nodo en el grafo"
        />
      </div>

      <button
        type="button"
        className={styles.relayout}
        onClick={onRelayout}
        aria-label="Re-organizar grafo"
        title="Re-organizar"
      >
        <RotateCcw size={13} strokeWidth={1.6} aria-hidden="true" />
        <span>Re-layout</span>
      </button>
    </div>
  );
}
