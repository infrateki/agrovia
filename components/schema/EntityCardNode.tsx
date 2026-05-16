'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { STATUS_COLORS, type Status } from '@/lib/architecture/schema-map';
import styles from './EntityCardNode.module.css';

export interface EntityCardNodeData {
  label: string;
  status: Status;
  tech?: string;
  fields: { name: string; type: string; pk?: boolean; fk?: string }[];
  selected?: boolean;
  [key: string]: unknown;
}

function EntityCardNodeImpl({ data, selected }: NodeProps) {
  const d = data as EntityCardNodeData;
  const dotColor = STATUS_COLORS[d.status];

  return (
    <div
      className={[styles.card, selected ? styles.selected : ''].filter(Boolean).join(' ')}
    >
      <Handle
        type="target"
        position={Position.Top}
        className={styles.handle}
        isConnectable={false}
      />
      <header className={styles.head}>
        <span
          className={styles.dot}
          style={{ background: dotColor, boxShadow: `0 0 6px ${dotColor}` }}
          aria-hidden="true"
        />
        <span className={styles.label}>{d.label}</span>
      </header>
      <ul className={styles.fields}>
        {d.fields.map((f) => (
          <li key={f.name} className={styles.fieldRow}>
            <span className={styles.fieldName}>
              {f.pk ? '🔑 ' : f.fk ? '→ ' : ''}
              {f.name}
            </span>
            <span className={styles.fieldType}>{f.type}</span>
          </li>
        ))}
      </ul>
      <Handle
        type="source"
        position={Position.Bottom}
        className={styles.handle}
        isConnectable={false}
      />
    </div>
  );
}

export const EntityCardNode = memo(EntityCardNodeImpl);
