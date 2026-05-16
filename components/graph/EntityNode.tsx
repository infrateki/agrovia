'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { NodeKind } from '@/lib/ontology/schema';
import { getNodeAccent, getNodeDiameter } from '@/lib/ontology/schema';
import styles from './EntityNode.module.css';

export interface EntityNodeData {
  kind: NodeKind;
  label: string;
  dim?: boolean;
  highlight?: boolean;
  [key: string]: unknown;
}

// Convert a hex color into rgba() with the given alpha. Falls back to the
// raw value if the input isn't a 6-digit hex.
function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.startsWith('#') ? hex.slice(1) : hex;
  if (clean.length !== 6) return hex;
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return hex;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function EntityNodeImpl({ data, selected }: NodeProps) {
  const d = data as EntityNodeData;
  const diameter = getNodeDiameter(d.kind);
  const accent = getNodeAccent(d.kind);

  // Larger diameter → larger label.
  const labelFontPx = diameter >= 120 ? 14 : diameter >= 100 ? 12.5 : 11.5;

  const cls = [
    styles.node,
    selected ? styles.selected : '',
    d.dim ? styles.dim : '',
    d.highlight ? styles.highlight : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={styles.wrapper} aria-label={`${d.kind}: ${d.label}`}>
      <Handle
        type="target"
        position={Position.Left}
        className={styles.handle}
        isConnectable={false}
      />
      <div
        className={cls}
        style={{
          width: diameter,
          height: diameter,
          background: hexToRgba(accent, 0.65),
          borderColor: accent,
        }}
        role="button"
        tabIndex={0}
        aria-label={`${d.kind} ${d.label}`}
      >
        <span
          className={styles.label}
          style={{ fontSize: `${labelFontPx}px` }}
        >
          {d.label}
        </span>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className={styles.handle}
        isConnectable={false}
      />
    </div>
  );
}

export const EntityNode = memo(EntityNodeImpl);
