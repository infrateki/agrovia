'use client';

import { useCallback, useEffect, useMemo } from 'react';
import {
  Background,
  Controls,
  MarkerType,
  Position,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  type Edge,
  type Node,
  type NodeMouseHandler,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from 'dagre';
import {
  ARCH_NODES,
  LAYER_ORDER,
  STATUS_COLORS,
  type Status,
} from '@/lib/architecture/schema-map';
import { getFlowEdges } from '@/lib/architecture/helpers';
import styles from './FlowMode.module.css';

const NODE_WIDTH = 160;
const NODE_HEIGHT = 44;

interface Props {
  selectedNodeId: string | null;
  onSelect: (id: string) => void;
}

function edgeColorFor(status: Status): string {
  if (status === 'implemented') return STATUS_COLORS.implemented;
  if (status === 'mock') return STATUS_COLORS.mock;
  if (status === 'partial') return STATUS_COLORS.partial;
  if (status === 'needed') return STATUS_COLORS.needed;
  return STATUS_COLORS.planned;
}

function edgeWidthFor(status: Status): number {
  switch (status) {
    case 'implemented':
      return 3.2;
    case 'partial':
      return 2.6;
    case 'mock':
      return 2.2;
    case 'planned':
      return 1.6;
    case 'needed':
      return 1.2;
  }
}

function FlowInner({ selectedNodeId, onSelect }: Props) {
  const flowEdges = useMemo(() => getFlowEdges(), []);

  const { rfNodes, rfEdges } = useMemo(() => {
    const g = new dagre.graphlib.Graph();
    g.setDefaultEdgeLabel(() => ({}));
    g.setGraph({
      rankdir: 'LR',
      nodesep: 24,
      ranksep: 80,
      edgesep: 12,
      marginx: 40,
      marginy: 40,
      align: 'UL',
    });

    for (const n of ARCH_NODES) {
      g.setNode(n.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
    }
    for (const e of flowEdges) {
      if (!g.hasNode(e.source) || !g.hasNode(e.target)) continue;
      g.setEdge(e.source, e.target);
    }
    dagre.layout(g);

    const nodes: Node[] = ARCH_NODES.map((n) => {
      const pos = g.node(n.id);
      const isDim =
        Boolean(selectedNodeId) &&
        n.id !== selectedNodeId &&
        !flowEdges.some(
          (e) =>
            (e.source === selectedNodeId && e.target === n.id) ||
            (e.target === selectedNodeId && e.source === n.id),
        );
      return {
        id: n.id,
        position: {
          x: pos ? pos.x - NODE_WIDTH / 2 : 0,
          y: pos ? pos.y - NODE_HEIGHT / 2 : 0,
        },
        data: {
          label: n.label,
        },
        type: 'default',
        selected: selectedNodeId === n.id,
        draggable: false,
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
        style: {
          width: NODE_WIDTH,
          height: NODE_HEIGHT,
          background: 'var(--color-glass-08)',
          color: 'var(--color-text-warm)',
          border: `1px solid ${
            selectedNodeId === n.id
              ? '#d4b88a'
              : 'rgba(255,255,255,0.12)'
          }`,
          borderLeft: `3px solid ${STATUS_COLORS[n.status]}`,
          borderRadius: 8,
          fontSize: 11,
          letterSpacing: 0.04,
          padding: '6px 10px',
          opacity: isDim ? 0.32 : 1,
        },
      };
    });

    const edges: Edge[] = flowEdges.map((e) => {
      const isHi =
        Boolean(selectedNodeId) &&
        (e.source === selectedNodeId || e.target === selectedNodeId);
      const color = edgeColorFor(e.status);
      const width = edgeWidthFor(e.status);
      return {
        id: e.id,
        source: e.source,
        target: e.target,
        type: 'smoothstep',
        animated: e.status === 'implemented',
        style: {
          stroke: color,
          strokeWidth: isHi ? width + 1 : width,
          opacity: selectedNodeId && !isHi ? 0.18 : 0.72,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color,
          width: 14,
          height: 14,
        },
      };
    });

    return { rfNodes: nodes, rfEdges: edges };
  }, [flowEdges, selectedNodeId]);

  const [nodes, setNodes, onNodesChange] = useNodesState(rfNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(rfEdges);

  useEffect(() => {
    setNodes(rfNodes);
    setEdges(rfEdges);
  }, [rfNodes, rfEdges, setNodes, setEdges]);

  const handleNodeClick: NodeMouseHandler = useCallback(
    (_e, node) => {
      onSelect(node.id);
    },
    [onSelect],
  );

  return (
    <div className={styles.root}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        fitView
        fitViewOptions={{ padding: 0.14, maxZoom: 1 }}
        minZoom={0.18}
        maxZoom={1.4}
        nodesConnectable={false}
        nodesDraggable={false}
        proOptions={{ hideAttribution: true }}
      >
        <Background gap={28} size={1} color="rgba(245,240,232,0.04)" />
        <Controls showInteractive={false} className={styles.controls} />
      </ReactFlow>

      <div className={styles.legend}>
        <span className={styles.legendTitle}>Flujo de datos</span>
        <span className={styles.legendNote}>
          Fuentes ({LAYER_ORDER[1]}) → BI. Grosor por estado; verde = implementado y animado.
        </span>
      </div>
    </div>
  );
}

export function FlowMode(props: Props) {
  return (
    <ReactFlowProvider>
      <FlowInner {...props} />
    </ReactFlowProvider>
  );
}
