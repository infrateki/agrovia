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
import { NodeDetailPanel } from '@/components/graph/NodeDetailPanel';
import { ShipmentDetailPanel } from '@/components/panels/ShipmentDetailPanel';
import {
  GRAPH_EDGES,
  GRAPH_NODES,
  ONTOLOGY_EDGES,
  ONTOLOGY_NODES,
  type GraphEdgeData,
  type GraphNodeData,
} from '@/lib/data/mock-graph';
import { invalidateLayoutCache, layoutGraph } from '@/lib/graph/layout';
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

  const rfEdges: Edge[] = filteredEdges.map((e) => {
    const highlighted =
      selectedNodeId != null &&
      (e.source === selectedNodeId || e.target === selectedNodeId);
    return {
      id: e.id,
      source: e.source,
      target: e.target,
      type: 'relationship',
      data: { kind: e.kind, highlighted } as RelationshipEdgeData,
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 14,
        height: 14,
        color: highlighted
          ? 'rgba(212,184,138,1)'
          : 'rgba(245,240,232,0.35)',
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
  const openDetail = useUiStore((s) => s.openDetail);
  const detailPanelOpen = useUiStore((s) => s.detailPanelOpen);
  const selectedShipmentId = useUiStore((s) => s.selectedShipmentId);
  const closeDetail = useUiStore((s) => s.closeDetail);

  const [search, setSearch] = useState('');
  // Bumping this tick triggers fitView via the `key` prop on ReactFlow when
  // the user clicks Re-layout, since fitView itself isn't a method on the
  // declarative API at this version.
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
    // Híbrido — overlay ontology + instance with extra IS_A edges.
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

  // Bridge Shipment node clicks into the existing detail panel flow.
  const handleNodeClick: NodeMouseHandler = useCallback(
    (_e, node) => {
      const d = node.data as EntityNodeData;
      selectGraphNode(node.id);
      if (d.kind === 'Shipment') {
        // Ontology placeholder for Shipment is "O-Shipment" — guard against
        // opening the detail panel for the abstract type node.
        if (!node.id.startsWith('O-')) {
          openDetail(node.id);
        }
      }
    },
    [openDetail, selectGraphNode],
  );

  const handleEdgeClick: EdgeMouseHandler = useCallback(() => {
    // Edges aren't selectable in our model; keep selection on the source.
  }, []);

  const handlePaneClick = useCallback(() => {
    selectGraphNode(null);
    if (detailPanelOpen) closeDetail();
  }, [selectGraphNode, detailPanelOpen, closeDetail]);

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
    // Force a re-build by nudging search (no-op string) — useMemo dependency
    // is `search` so we re-trigger via a quick state churn.
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
  }, [sourceData, graphVisibleTypes, search, graphSelectedNodeId, setNodes, setEdges]);

  // Reject any user-attempted connections — this is a read-only graph.
  const onConnect = useCallback((_c: Connection) => {}, []);

  const selectedNodeData = useMemo<GraphNodeData | null>(() => {
    if (!graphSelectedNodeId) return null;
    return sourceData.nodes.find((n) => n.id === graphSelectedNodeId) ?? null;
  }, [graphSelectedNodeId, sourceData.nodes]);

  const showNodeDetail =
    selectedNodeData != null &&
    selectedNodeData.kind !== 'Shipment' &&
    !graphSelectedNodeId?.startsWith('O-Shipment');

  // For ontology-level non-Shipment nodes, fall through to NodeDetailPanel
  // (covers the schema browsing case).

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
              // Use the accent color of the node kind in the minimap.
              try {
                // Import-locally to avoid a top-level type-only cycle.
                // eslint-disable-next-line @typescript-eslint/no-require-imports
                const { getNodeAccent } = require('@/lib/ontology/schema') as typeof import('@/lib/ontology/schema');
                return getNodeAccent(d.kind);
              } catch {
                return 'rgba(245,240,232,0.4)';
              }
            }}
            maskColor="rgba(0,0,0,0.45)"
          />
          <Controls position="bottom-right" showInteractive={false} />
        </ReactFlow>
      </div>

      {showNodeDetail && selectedNodeData && (
        <NodeDetailPanel
          node={selectedNodeData}
          onClose={() => selectGraphNode(null)}
        />
      )}

      {detailPanelOpen && selectedShipmentId && (
        <ShipmentDetailPanel
          id={selectedShipmentId}
          onClose={() => {
            closeDetail();
            selectGraphNode(null);
          }}
        />
      )}
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
