'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Background,
  Controls,
  MarkerType,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  type Connection,
  type Edge,
  type EdgeMouseHandler,
  type Node,
  type NodeMouseHandler,
  type NodeTypes,
  type EdgeTypes,
  type OnSelectionChangeParams,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { EntityNode, type EntityNodeData } from '@/components/graph/EntityNode';
import { RelationshipEdge, type RelationshipEdgeData } from '@/components/graph/RelationshipEdge';
import { GraphToolbar } from '@/components/graph/GraphToolbar';
import {
  GraphElementModal,
  resolveModalElement,
} from '@/components/graph/GraphElementModal';
import {
  GRAPH_EDGES,
  GRAPH_NODES,
  ONTOLOGY_EDGES,
  ONTOLOGY_NODES,
  type GraphEdgeData,
  type GraphNodeData,
} from '@/lib/data/mock-graph';
import { invalidateLayoutCache, layoutGraph } from '@/lib/graph/layout';
import { getNodeAccent } from '@/lib/ontology/schema';
import { useUiStore } from '@/lib/stores/ui-store';
import type { NodeKind } from '@/lib/ontology/schema';
import styles from './GraphIntelligenceView.module.css';

const NODE_TYPES: NodeTypes = { entity: EntityNode };
const EDGE_TYPES: EdgeTypes = { relationship: RelationshipEdge };

interface BuildArgs {
  nodes: GraphNodeData[];
  edges: GraphEdgeData[];
  bucket: string;
  visibleTypes: Set<NodeKind>;
  search: string;
  selectedNodeId: string | null;
}

// Group edges by their unordered (source, target) pair so we can assign each
// edge an index within its parallel group. The RelationshipEdge uses this
// pair (index, count) to fan curves out instead of stacking.
function indexParallelEdges(edges: GraphEdgeData[]) {
  const groups = new Map<string, GraphEdgeData[]>();
  for (const e of edges) {
    // Use ordered key — directionality matters for layout but the visual
    // overlap problem is the same for both directions, so we treat
    // (a→b) and (b→a) as separate groups (they'd render different markers).
    const key = `${e.source}>${e.target}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(e);
  }
  const indexOf = new Map<string, { index: number; count: number }>();
  for (const arr of groups.values()) {
    arr.forEach((e, i) => {
      indexOf.set(e.id, { index: i, count: arr.length });
    });
  }
  return indexOf;
}

function buildFlow({
  nodes,
  edges,
  bucket,
  visibleTypes,
  search,
  selectedNodeId,
}: BuildArgs): { rfNodes: Node[]; rfEdges: Edge[] } {
  const filteredNodes = nodes.filter((n) => visibleTypes.has(n.kind));
  const visibleIds = new Set(filteredNodes.map((n) => n.id));
  const filteredEdges = edges.filter(
    (e) => visibleIds.has(e.source) && visibleIds.has(e.target),
  );
  // Ontology view → hierarchical dagre. Instance / hybrid → d3-force.
  const useDagre = bucket === 'ontology';
  const laidOut = layoutGraph(filteredNodes, filteredEdges, {
    mode: useDagre ? 'dagre' : 'force',
    direction: 'LR',
    bucket,
  });

  const q = search.trim().toLowerCase();
  const anyMatch =
    q.length > 0 && laidOut.some((n) => n.label.toLowerCase().includes(q));

  const rfNodes: Node[] = laidOut.map((n) => {
    const isMatch = q.length > 0 && n.label.toLowerCase().includes(q);
    const dim = q.length > 0 && anyMatch && !isMatch;
    return {
      id: n.id,
      type: 'entity',
      position: { x: n.x, y: n.y },
      data: {
        kind: n.kind,
        label: n.label,
        dim,
        highlight: isMatch,
        meta: n.meta,
      } as EntityNodeData,
      selected: selectedNodeId === n.id,
      draggable: true,
    };
  });

  const parallelIndex = indexParallelEdges(filteredEdges);

  const rfEdges: Edge[] = filteredEdges.map((e) => {
    const highlighted =
      selectedNodeId != null &&
      (e.source === selectedNodeId || e.target === selectedNodeId);
    const info = parallelIndex.get(e.id) ?? { index: 0, count: 1 };
    const markerColor = highlighted
      ? 'rgba(212,184,138,1)'
      : 'rgba(245,240,232,0.55)';
    return {
      id: e.id,
      source: e.source,
      target: e.target,
      type: 'relationship',
      data: {
        kind: e.kind,
        highlighted,
        parallelIndex: info.index,
        parallelCount: info.count,
      } as RelationshipEdgeData,
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 22,
        height: 22,
        color: markerColor,
      },
    };
  });

  return { rfNodes, rfEdges };
}

function GraphInner() {
  const graphLayer = useUiStore((s) => s.graphLayer);
  const setGraphLayer = useUiStore((s) => s.setGraphLayer);
  const graphSelectedNodeId = useUiStore((s) => s.graphSelectedNodeId);
  const selectGraphNode = useUiStore((s) => s.selectGraphNode);
  const graphVisibleTypes = useUiStore((s) => s.graphVisibleTypes);
  const toggleGraphType = useUiStore((s) => s.toggleGraphType);
  const graphModalTarget = useUiStore((s) => s.graphModalTarget);
  const openGraphModal = useUiStore((s) => s.openGraphModal);
  const closeGraphModal = useUiStore((s) => s.closeGraphModal);

  const [search, setSearch] = useState('');
  // Bumping this tick triggers fitView via the `key` prop on ReactFlow when
  // the user clicks Re-layout.
  const [layoutTick, setLayoutTick] = useState(0);

  const sourceData = useMemo<{
    nodes: GraphNodeData[];
    edges: GraphEdgeData[];
    bucket: string;
  }>(() => {
    if (graphLayer === 'ontology') {
      return {
        nodes: ONTOLOGY_NODES,
        edges: ONTOLOGY_EDGES,
        bucket: 'ontology',
      };
    }
    if (graphLayer === 'instance') {
      return { nodes: GRAPH_NODES, edges: GRAPH_EDGES, bucket: 'instance' };
    }
    return {
      nodes: [...ONTOLOGY_NODES, ...GRAPH_NODES],
      edges: [...ONTOLOGY_EDGES, ...GRAPH_EDGES],
      bucket: 'hybrid',
    };
  }, [graphLayer]);

  const { rfNodes, rfEdges } = useMemo(
    () =>
      buildFlow({
        nodes: sourceData.nodes,
        edges: sourceData.edges,
        bucket: sourceData.bucket,
        visibleTypes: graphVisibleTypes,
        search,
        selectedNodeId: graphSelectedNodeId,
      }),
    [sourceData, graphVisibleTypes, search, graphSelectedNodeId],
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(rfNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(rfEdges);

  // Re-sync when source data, filters, search, or selection change.
  useEffect(() => {
    setNodes(rfNodes);
    setEdges(rfEdges);
  }, [rfNodes, rfEdges, setNodes, setEdges]);

  // ─── Click handlers ───
  // Phase 6.5: clicking a node or edge opens the centered modal. The old
  // bridge to ShipmentDetailPanel is removed for GRAFO — the modal carries
  // strictly more information (properties + relations + documents + source).

  const handleNodeClick: NodeMouseHandler = useCallback(
    (_e, node) => {
      selectGraphNode(node.id);
      openGraphModal({ kind: 'node', nodeId: node.id });
    },
    [selectGraphNode, openGraphModal],
  );

  const handleEdgeClick: EdgeMouseHandler = useCallback(
    (_e, edge) => {
      openGraphModal({ kind: 'edge', edgeId: edge.id });
    },
    [openGraphModal],
  );

  const handlePaneClick = useCallback(() => {
    selectGraphNode(null);
    closeGraphModal();
  }, [selectGraphNode, closeGraphModal]);

  const handleSelectionChange = useCallback(
    (params: OnSelectionChangeParams) => {
      if (params.nodes.length === 0) return;
      const first = params.nodes[0];
      if (graphSelectedNodeId !== first.id) selectGraphNode(first.id);
    },
    [graphSelectedNodeId, selectGraphNode],
  );

  const handleRelayout = useCallback(() => {
    invalidateLayoutCache(sourceData.bucket);
    setSearch((s) => s);
    const { rfNodes: nn, rfEdges: ee } = buildFlow({
      nodes: sourceData.nodes,
      edges: sourceData.edges,
      bucket: sourceData.bucket,
      visibleTypes: graphVisibleTypes,
      search,
      selectedNodeId: graphSelectedNodeId,
    });
    setNodes(nn);
    setEdges(ee);
    setLayoutTick((t) => t + 1);
  }, [
    sourceData,
    graphVisibleTypes,
    search,
    graphSelectedNodeId,
    setNodes,
    setEdges,
  ]);

  const onConnect = useCallback((_c: Connection) => {}, []);

  // ─── Modal resolution ───
  const modalElement = useMemo(
    () =>
      resolveModalElement(graphModalTarget, sourceData.nodes, sourceData.edges),
    [graphModalTarget, sourceData.nodes, sourceData.edges],
  );

  const handleModalNavigate = useCallback(
    (nodeId: string) => {
      openGraphModal({ kind: 'node', nodeId });
      selectGraphNode(nodeId);
    },
    [openGraphModal, selectGraphNode],
  );

  return (
    <div className={styles.root} role="region" aria-label="Inteligencia de Grafo">
      <GraphToolbar
        layer={graphLayer}
        onLayerChange={setGraphLayer}
        visibleTypes={graphVisibleTypes}
        onToggleType={toggleGraphType}
        search={search}
        onSearchChange={setSearch}
        onRelayout={handleRelayout}
      />

      <div className={styles.canvas}>
        <ReactFlow
          key={`${sourceData.bucket}-${layoutTick}`}
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={handleNodeClick}
          onEdgeClick={handleEdgeClick}
          onPaneClick={handlePaneClick}
          onSelectionChange={handleSelectionChange}
          nodeTypes={NODE_TYPES}
          edgeTypes={EDGE_TYPES}
          fitView
          fitViewOptions={{ padding: 0.15 }}
          minZoom={0.4}
          maxZoom={1.5}
          defaultViewport={{ x: 0, y: 0, zoom: 0.85 }}
          proOptions={{ hideAttribution: false }}
          nodesDraggable
          nodesConnectable={false}
          elementsSelectable
          selectNodesOnDrag={false}
          panOnDrag
          zoomOnScroll
          zoomOnPinch
        >
          <Background gap={24} size={1} color="rgba(245,240,232,0.08)" />
          <MiniMap
            pannable
            zoomable
            nodeColor={(n) => {
              const d = n.data as EntityNodeData | undefined;
              if (!d) return 'rgba(245,240,232,0.3)';
              return getNodeAccent(d.kind);
            }}
            maskColor="rgba(0,0,0,0.45)"
          />
          <Controls position="bottom-right" showInteractive={false} />
        </ReactFlow>
      </div>

      <GraphElementModal
        element={modalElement}
        onClose={closeGraphModal}
        onNavigate={handleModalNavigate}
        allNodes={sourceData.nodes}
        allEdges={sourceData.edges}
      />
    </div>
  );
}

export function GraphIntelligenceView() {
  return (
    <ReactFlowProvider>
      <GraphInner />
    </ReactFlowProvider>
  );
}
