'use client';

import { X } from 'lucide-react';
import type { GraphNodeData } from '@/lib/data/mock-graph';
import { getNodeAccent, getNodeLabelES } from '@/lib/ontology/schema';
import styles from './NodeDetailPanel.module.css';

interface Props {
  node: GraphNodeData;
  onClose: () => void;
}

interface Row {
  label: string;
  value: string;
}

function rowsForNode(node: GraphNodeData): Row[] {
  const meta = node.meta ?? {};
  const out: Row[] = [];
  for (const [k, v] of Object.entries(meta)) {
    out.push({ label: humanize(k), value: String(v) });
  }
  return out;
}

function humanize(key: string): string {
  // camelCase → "Camel case", then capitalize first letter
  const s = key
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/_/g, ' ')
    .toLowerCase();
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function NodeDetailPanel({ node, onClose }: Props) {
  const accent = getNodeAccent(node.kind);
  const kindLabel = getNodeLabelES(node.kind);
  const rows = rowsForNode(node);

  const isDocument = node.kind === 'Document';

  return (
    <aside
      className={styles.card}
      role="dialog"
      aria-label={`Detalle de ${kindLabel} ${node.label}`}
    >
      <header className={styles.header}>
        <div className={styles.titleBlock}>
          <span
            className={styles.eyebrow}
            style={{ color: accent }}
          >
            {kindLabel}
          </span>
          <h2 className={styles.title}>{node.label}</h2>
          <code className={styles.code}>{node.id}</code>
        </div>
        <button
          type="button"
          className={styles.close}
          onClick={onClose}
          aria-label="Cerrar"
        >
          <X size={14} strokeWidth={1.6} />
        </button>
      </header>

      <div
        className={styles.accentLine}
        aria-hidden="true"
        style={{ background: accent }}
      />

      <div className={styles.body}>
        {rows.length === 0 ? (
          <p className={styles.emptyHint}>Sin metadatos asociados.</p>
        ) : (
          <dl className={styles.kvList}>
            {rows.map((r) => (
              <div key={r.label} className={styles.kvRow}>
                <dt className={styles.kvKey}>{r.label}</dt>
                <dd className={styles.kvValue}>{r.value}</dd>
              </div>
            ))}
          </dl>
        )}

        {isDocument && (
          <button
            type="button"
            className={styles.openBtn}
            onClick={() => {
              // Phase 5 — viewer not wired. Hook will land in Phase 6.
              // eslint-disable-next-line no-console
              console.log('[graph] open document', node.id);
            }}
          >
            Abrir documento
          </button>
        )}
      </div>
    </aside>
  );
}
