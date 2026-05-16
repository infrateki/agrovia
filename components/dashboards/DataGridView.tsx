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
  type EdgeTypes,
  type Node,
  type NodeMouseHandler,
  type NodeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { EntityNode, type EntityNodeData } from '@/components/graph/EntityNode';
import {
  RelationshipEdge,
  type RelationshipEdgeData,
} from '@/components/graph/RelationshipEdge';
import {
  GRAPH_EDGES,
  GRAPH_NODES,
  ONTOLOGY_EDGES,
  ONTOLOGY_NODES,
} from '@/lib/data/mock-graph';
import { layoutGraph } from '@/lib/graph/layout';
import { useUiStore } from '@/lib/stores/ui-store';
import styles from './DataGridView.module.css';

const NODE_TYPES: NodeTypes = { entity: EntityNode };
const EDGE_TYPES: EdgeTypes = { relationship: RelationshipEdge };

function DataGridInner() {
  const graphSelectedNodeId = useUiStore((s) => s.graphSelectedNodeId);
  const selectGraphNode = useUiStore((s) => s.selectGraphNode);

  // DATA GRID = ontology schema in dagre LR. (GRAFO = instance, force-directed.)
  // We render the ontology types AND the most-typed instance neighborhoods so
  // the LR view is more than the 12 ontology nodes alone.
  const { rfNodes, rfEdges } = useMemo(() => {
    const nodes = [...ONTOLOGY_NODES, ...GRAPH_NODES];
    const edges = [...ONTOLOGY_EDGES, ...GRAPH_EDGES];
    const laidOut = layoutGraph(nodes, edges, {
      mode: 'dagre',
      direction: 'LR',
      bucket: 'data-grid',
    });

    const rfNodes: Node[] = laidOut.map((n) => ({
      id: n.id,
      type: 'entity',
      position: { x: n.x, y: n.y },
      data: {
        kind: n.kind,
        label: n.label,
        meta: n.meta,
      } as EntityNodeData,
      selected: graphSelectedNodeId === n.id,
      draggable: true,
    }));

    const rfEdges: Edge[] = edges.map((e) => {
      const hi =
        graphSelectedNodeId != null &&
        (e.source === graphSelectedNodeId || e.target === graphSelectedNodeId);
      return {
        id: e.id,
        source: e.source,
        target: e.target,
        type: 'relationship',
        data: {
          kind: e.kind,
          highlighted: hi,
          parallelIndex: 0,
          parallelCount: 1,
        } as RelationshipEdgeData,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: hi ? 'rgba(212,184,138,1)' : 'rgba(245,240,232,0.5)',
          width: 18,
          height: 18,
        },
      };
    });

    return { rfNodes, rfEdges };
  }, [graphSelectedNodeId]);

  const [nodes, setNodes, onNodesChange] = useNodesState(rfNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(rfEdges);

  useEffect(() => {
    setNodes(rfNodes);
    setEdges(rfEdges);
  }, [rfNodes, rfEdges, setNodes, setEdges]);

  const handleNodeClick: NodeMouseHandler = useCallback(
    (_e, node) => {
      selectGraphNode(node.id);
    },
    [selectGraphNode],
  );

  const handlePaneClick = useCallback(() => {
    selectGraphNode(null);
  }, [selectGraphNode]);

  return (
    <div className={styles.root}>
      <header className={styles.head}>
        <div>
          <p className={styles.eyebrow}>Vista de arquitectura · LR dagre</p>
          <h1 className={styles.title}>DATA GRID</h1>
        </div>
        <p className={styles.lead}>
          Ontología completa (12 tipos · 14 relaciones) + las ~35 instancias del
          dominio S-8842. Layout izquierda → derecha. Click en un nodo para
          enfocar sus relaciones; usa GRAFO si prefieres la vista force-directed.
        </p>
      </header>
      <div className={styles.canvas}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={NODE_TYPES}
          edgeTypes={EDGE_TYPES}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={handleNodeClick}
          onPaneClick={handlePaneClick}
          fitView
          fitViewOptions={{ padding: 0.14, maxZoom: 1.1 }}
          minZoom={0.18}
          maxZoom={1.6}
          proOptions={{ hideAttribution: true }}
          nodesDraggable
          nodesConnectable={false}
          elementsSelectable
        >
          <Background gap={28} size={1} color="rgba(245,240,232,0.04)" />
          <Controls showInteractive={false} className={styles.controls} />
        </ReactFlow>
      </div>
    </div>
  );
}

export function DataGridView() {
  return (
    <ReactFlowProvider>
      <DataGridInner />
    </ReactFlowProvider>
  );
}
