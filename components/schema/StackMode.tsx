'use client';

import { useMemo, useState } from 'react';
import {
  ARCH_NODES,
  LAYER_LABELS,
  LAYER_ORDER,
  STATUS_COLORS,
  STATUS_LABELS,
  type ArchNode,
  type Layer,
} from '@/lib/architecture/schema-map';
import styles from './StackMode.module.css';

interface Props {
  selectedNodeId: string | null;
  onSelect: (id: string) => void;
}

export function StackMode({ selectedNodeId, onSelect }: Props) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const byLayer = useMemo(() => {
    const out: Record<Layer, ArchNode[]> = {
      foundation: [],
      sources: [],
      integration: [],
      storage: [],
      api: [],
      views: [],
      bi: [],
    };
    for (const n of ARCH_NODES) out[n.layer].push(n);
    return out;
  }, []);

  // For hover-only connection highlighting: when a card is hovered, find
  // all ids in its consumes/exposes and highlight those cards too.
  const highlighted = useMemo(() => {
    if (!hoveredId) return new Set<string>();
    const node = ARCH_NODES.find((n) => n.id === hoveredId);
    if (!node) return new Set<string>();
    const related = new Set<string>([hoveredId]);
    for (const c of node.consumes ?? []) related.add(c);
    for (const e of node.exposes ?? []) related.add(e);
    // Plus anyone that consumes this id
    for (const n of ARCH_NODES) {
      if (n.consumes?.includes(hoveredId)) related.add(n.id);
      if (n.exposes?.includes(hoveredId)) related.add(n.id);
    }
    return related;
  }, [hoveredId]);

  return (
    <div className={styles.root}>
      <div className={styles.lanes}>
        {LAYER_ORDER.map((layer) => {
          const nodes = byLayer[layer];
          return (
            <section
              key={layer}
              className={styles.lane}
              aria-label={LAYER_LABELS[layer]}
            >
              <div className={styles.laneHead}>
                <h2 className={styles.laneTitle}>{LAYER_LABELS[layer]}</h2>
                <span className={styles.laneCount}>{nodes.length}</span>
              </div>
              <div className={styles.laneBody}>
                {nodes.length === 0 ? (
                  <p className={styles.empty}>Sin nodos registrados.</p>
                ) : (
                  nodes.map((node) => {
                    const isSelected = selectedNodeId === node.id;
                    const isHover = hoveredId === node.id;
                    const isRelated = hoveredId
                      ? highlighted.has(node.id)
                      : true;
                    return (
                      <button
                        type="button"
                        key={node.id}
                        className={[
                          styles.card,
                          isSelected ? styles.cardSelected : '',
                          isHover ? styles.cardHover : '',
                          hoveredId && !isRelated ? styles.cardDim : '',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                        onClick={() => onSelect(node.id)}
                        onMouseEnter={() => setHoveredId(node.id)}
                        onMouseLeave={() => setHoveredId(null)}
                        title={node.description}
                      >
                        <div className={styles.cardHead}>
                          <span
                            className={styles.dot}
                            style={{
                              background: STATUS_COLORS[node.status],
                              boxShadow: `0 0 6px ${STATUS_COLORS[node.status]}`,
                            }}
                            aria-hidden="true"
                          />
                          <span className={styles.cardLabel}>
                            {node.label}
                          </span>
                          {node.tech ? (
                            <span className={styles.techBadge}>
                              {node.tech}
                            </span>
                          ) : null}
                        </div>
                        <p className={styles.cardDesc}>{node.description}</p>
                        <div className={styles.cardFoot}>
                          <span className={styles.statusPill}>
                            {STATUS_LABELS[node.status]}
                          </span>
                          {node.ownerPhase ? (
                            <span className={styles.phasePill}>
                              Phase {node.ownerPhase}
                            </span>
                          ) : null}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
