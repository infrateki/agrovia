'use client';

import { memo } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getStraightPath,
  type EdgeProps,
} from '@xyflow/react';
import type { EdgeKind } from '@/lib/ontology/schema';
import styles from './RelationshipEdge.module.css';

export interface RelationshipEdgeData {
  kind: EdgeKind;
  highlighted?: boolean;
  [key: string]: unknown;
}

function RelationshipEdgeImpl({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  markerEnd,
  data,
  selected,
}: EdgeProps) {
  const d = (data as RelationshipEdgeData | undefined) ?? {
    kind: 'ATTACHED' as EdgeKind,
  };

  // Straight line lets the force-directed layout breathe; smoothstep was
  // designed for the LR hierarchy that's gone now.
  const [edgePath, labelX, labelY] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  const highlighted = Boolean(d.highlighted || selected);

  // Rotate the label when the edge is steep enough that horizontal text
  // would collide with the line. 25° threshold per the brief.
  const dx = targetX - sourceX;
  const dy = targetY - sourceY;
  const angleDeg = Math.atan2(dy, dx) * (180 / Math.PI);
  // Normalize so the text isn't upside-down.
  let rotate = angleDeg;
  if (rotate > 90) rotate -= 180;
  else if (rotate < -90) rotate += 180;
  const shouldRotate = Math.abs(angleDeg) > 25 && Math.abs(angleDeg) < 155;
  const rotateRule = shouldRotate ? `rotate(${rotate}deg)` : '';

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        className={[styles.edge, highlighted ? styles.edgeOn : '']
          .filter(Boolean)
          .join(' ')}
        aria-label={d.kind}
      />
      <EdgeLabelRenderer>
        <div
          className={[styles.labelPill, highlighted ? styles.labelPillOn : '']
            .filter(Boolean)
            .join(' ')}
          style={{
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px) ${rotateRule}`,
          }}
        >
          {d.kind}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

export const RelationshipEdge = memo(RelationshipEdgeImpl);
