'use client';

import { useCallback, useEffect, useMemo } from 'react';
import {
  Background,
  Controls,
  MarkerType,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  type Edge,
  type Node,
  type NodeMouseHandler,
  type NodeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from 'dagre';
import { EntityCardNode, type EntityCardNodeData } from './EntityCardNode';
import {
  getErdEdges,
  getMaturityEntities,
} from '@/lib/architecture/helpers';
import styles from './ErdMode.module.css';

const NODE_TYPES: NodeTypes = { entity: EntityCardNode };

const ENTITY_WIDTH = 220;
const ENTITY_HEIGHT_MIN = 60;
const FIELD_ROW_HEIGHT = 22;

function estimateHeight(fieldCount: number): number {
  return ENTITY_HEIGHT_MIN + fieldCount * FIELD_ROW_HEIGHT;
}

interface Props {
  selectedNodeId: string | null;
  onSelect: (id: string) => void;
}

function ErdInner({ selectedNodeId, onSelect }: Props) {
  const entities = useMemo(() => getMaturityEntities(), []);
  const erdEdges = useMemo(() => getErdEdges(), []);

  const { rfNodes, rfEdges } = useMemo(() => {
    // Lay out with dagre TB.
    const g = new dagre.graphlib.Graph();
    g.setDefaultEdgeLabel(() => ({}));
    g.setGraph({
      rankdir: 'TB',
      nodesep: 64,
      ranksep: 80,
      edgesep: 24,
      marginx: 40,
      marginy: 40,
    });

    for (const e of entities) {
      g.setNode(e.id, {
        width: ENTITY_WIDTH,
        height: estimateHeight(e.fields?.length ?? 0),
      });
    }
    for (const edge of erdEdges) {
      if (!g.hasNode(edge.source) || !g.hasNode(edge.target)) continue;
      g.setEdge(edge.source, edge.target);
    }
    dagre.layout(g);

    const nodes: Node[] = entities.map((entity) => {
      const pos = g.node(entity.id);
      const h = estimateHeight(entity.fields?.length ?? 0);
      const fields = (entity.fields ?? []).map((f) => {
        const pk = Boolean(f.notes?.includes('PK'));
        const fkMatch = f.notes?.match(/→\s*([A-Z][A-Za-z]+)/);
        return {
          name: f.name,
          type: f.type,
          pk,
          fk: fkMatch?.[1],
        };
      });
      return {
        id: entity.id,
        type: 'entity',
        position: {
          x: pos ? pos.x - ENTITY_WIDTH / 2 : 0,
          y: pos ? pos.y - h / 2 : 0,
        },
        data: {
          label: entity.label,
          status: entity.status,
          tech: entity.tech,
          fields,
        } as EntityCardNodeData,
        selected: selectedNodeId === entity.id,
        draggable: true,
      };
    });

    const edges: Edge[] = erdEdges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      type: 'smoothstep',
      label: e.cardinality,
      labelStyle: { fill: '#d4b88a', fontSize: 10, letterSpacing: 0.04 },
      labelBgPadding: [4, 4] as [number, number],
      labelBgStyle: { fill: 'rgba(13,17,23,0.85)', stroke: 'rgba(212,184,138,0.35)' },
      labelBgBorderRadius: 4,
      style: { stroke: 'rgba(245,240,232,0.5)', strokeWidth: 1.4 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: 'rgba(245,240,232,0.5)',
        width: 18,
        height: 18,
      },
    }));

    return { rfNodes: nodes, rfEdges: edges };
  }, [entities, erdEdges, selectedNodeId]);

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
        nodeTypes={NODE_TYPES}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        fitView
        fitViewOptions={{ padding: 0.18, maxZoom: 1.1 }}
        minZoom={0.3}
        maxZoom={1.6}
        proOptions={{ hideAttribution: true }}
        nodesDraggable
        nodesConnectable={false}
        elementsSelectable
      >
        <Background gap={28} size={1} color="rgba(245,240,232,0.04)" />
        <Controls
          showInteractive={false}
          className={styles.controls}
        />
      </ReactFlow>
    </div>
  );
}

export function ErdMode(props: Props) {
  return (
    <ReactFlowProvider>
      <ErdInner {...props} />
    </ReactFlowProvider>
  );
}
