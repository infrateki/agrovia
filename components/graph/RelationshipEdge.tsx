'use client';

import { memo, useCallback, type MouseEvent as ReactMouseEvent } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type EdgeProps,
} from '@xyflow/react';
import { useUiStore } from '@/lib/stores/ui-store';
import type { EdgeKind } from '@/lib/ontology/schema';
import styles from './RelationshipEdge.module.css';

export interface RelationshipEdgeData {
  kind: EdgeKind;
  highlighted?: boolean;
  // Index of this edge within the (source,target) parallel group, plus
  // the total group size. Used to fan out duplicate edges with different
  // curvature so they don't stack.
  parallelIndex?: number;
  parallelCount?: number;
  [key: string]: unknown;
}

// Convert (index, count) into a curvature delta in [-0.45, +0.45]. The base
// curvature is added on top in render.
function parallelCurvature(index: number, count: number): number {
  if (count <= 1) return 0;
  // Spread evenly across the band, centered on 0. With count=3 we get
  // [-0.3, 0, +0.3]; with count=5 we get [-0.45, -0.225, 0, +0.225, +0.45].
  const max = 0.45;
  const step = (max * 2) / (count - 1);
  return -max + step * index;
}

function RelationshipEdgeImpl({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  markerEnd,
  data,
  selected,
}: EdgeProps) {
  const d = (data as RelationshipEdgeData | undefined) ?? {
    kind: 'ATTACHED' as EdgeKind,
  };

  const openGraphModal = useUiStore((s) => s.openGraphModal);

  // Curve every edge a little (0.25 base) so even isolated edges feel less
  // mechanical, then layer the parallel-group offset on top.
  const curvature =
    0.25 +
    parallelCurvature(d.parallelIndex ?? 0, d.parallelCount ?? 1);

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    curvature,
  });

  const highlighted = Boolean(d.highlighted || selected);

  const onLabelClick = useCallback(
    (e: ReactMouseEvent) => {
      e.stopPropagation();
      openGraphModal({ kind: 'edge', edgeId: id });
    },
    [openGraphModal, id],
  );

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        className={[
          styles.edge,
          highlighted ? styles.edgeOn : '',
          highlighted ? styles.edgeFlow : '',
        ]
          .filter(Boolean)
          .join(' ')}
        aria-label={d.kind}
      />
      <EdgeLabelRenderer>
        <div
          className={[
            styles.label,
            highlighted ? styles.labelHighlighted : '',
          ]
            .filter(Boolean)
            .join(' ')}
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            pointerEvents: 'all',
          }}
          onClick={onLabelClick}
          role="button"
          tabIndex={0}
          aria-label={`Relación ${d.kind}`}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              openGraphModal({ kind: 'edge', edgeId: id });
            }
          }}
        >
          {d.kind}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

export const RelationshipEdge = memo(RelationshipEdgeImpl);
