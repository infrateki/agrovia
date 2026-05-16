// Graph layout — d3-force for instance/hybrid (Neo4j Browser feel),
// dagre LR only for the abstract Ontología schema view (hierarchy reads
// better than a force cloud for the abstract type graph).
//
// Both backends return absolute (x, y) positions for the top-left corner
// of each node's bounding box, matching React Flow's expectation.

import dagre from 'dagre';
import {
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  type SimulationNodeDatum,
} from 'd3-force';
import type { GraphEdgeData, GraphNodeData } from '../data/mock-graph';
import { getNodeDiameter } from '../ontology/schema';

export type LayoutDirection = 'LR' | 'TB';
export type LayoutMode = 'force' | 'dagre';

export interface LaidOutNode extends GraphNodeData {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface LayoutCacheEntry {
  signature: string;
  result: LaidOutNode[];
}

const CACHE = new Map<string, LayoutCacheEntry>();

function signatureOf(
  nodes: GraphNodeData[],
  edges: GraphEdgeData[],
  mode: LayoutMode,
  bucket: string,
): string {
  const n = nodes.map((x) => x.id).join(',');
  const e = edges.map((x) => `${x.source}>${x.target}`).join(',');
  return `${bucket}|${mode}|${n.length}:${e.length}|${n}|${e}`;
}

// --------------------- dagre (ontology) ---------------------

function layoutDagre(
  nodes: GraphNodeData[],
  edges: GraphEdgeData[],
  direction: LayoutDirection,
): LaidOutNode[] {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({
    rankdir: direction,
    nodesep: 56,
    ranksep: 120,
    edgesep: 24,
    marginx: 60,
    marginy: 60,
  });

  for (const node of nodes) {
    const d = getNodeDiameter(node.kind);
    g.setNode(node.id, { width: d + 24, height: d + 24 });
  }

  for (const edge of edges) {
    if (!g.hasNode(edge.source) || !g.hasNode(edge.target)) continue;
    g.setEdge(edge.source, edge.target);
  }

  dagre.layout(g);

  return nodes.map((node) => {
    const pos = g.node(node.id);
    const d = getNodeDiameter(node.kind);
    return {
      ...node,
      x: pos ? pos.x - (d + 24) / 2 : 0,
      y: pos ? pos.y - (d + 24) / 2 : 0,
      width: d,
      height: d,
    };
  });
}

// --------------------- d3-force (instance / hybrid) ---------------------

interface SimNode extends SimulationNodeDatum {
  id: string;
  radius: number;
  kind: GraphNodeData['kind'];
}

interface SimLink {
  source: string;
  target: string;
}

function layoutForce(
  nodes: GraphNodeData[],
  edges: GraphEdgeData[],
): LaidOutNode[] {
  // Estimate a sensible canvas size from node count so the cluster fills
  // the viewport before fitView snaps it back.
  const width = Math.max(900, Math.sqrt(nodes.length) * 220);
  const height = Math.max(700, Math.sqrt(nodes.length) * 180);

  const simNodes: SimNode[] = nodes.map((n) => ({
    id: n.id,
    radius: getNodeDiameter(n.kind) / 2,
    kind: n.kind,
  }));

  const simLinks: SimLink[] = edges
    .filter(
      (e) =>
        simNodes.some((n) => n.id === e.source) &&
        simNodes.some((n) => n.id === e.target),
    )
    .map((e) => ({ source: e.source, target: e.target }));

  const sim = forceSimulation<SimNode>(simNodes)
    .force(
      'link',
      forceLink<SimNode, SimLink>(simLinks)
        .id((d) => d.id)
        .distance(180)
        .strength(0.6),
    )
    .force('charge', forceManyBody<SimNode>().strength(-800))
    .force('center', forceCenter(width / 2, height / 2))
    .force(
      'collide',
      forceCollide<SimNode>().radius((d) => d.radius + 24),
    )
    .stop();

  // Run the simulation synchronously so we have stable positions before
  // React Flow paints. 300 ticks is plenty for ~35 nodes.
  for (let i = 0; i < 300; i++) sim.tick();

  // Build a map of computed positions, then translate to top-left coords.
  const byId = new Map<string, SimNode>();
  for (const sn of simNodes) byId.set(sn.id, sn);

  return nodes.map((node) => {
    const sn = byId.get(node.id);
    const d = getNodeDiameter(node.kind);
    const cx = sn?.x ?? 0;
    const cy = sn?.y ?? 0;
    return {
      ...node,
      x: cx - d / 2,
      y: cy - d / 2,
      width: d,
      height: d,
    };
  });
}

// --------------------- Public API ---------------------

export interface LayoutOptions {
  mode: LayoutMode;
  direction?: LayoutDirection; // only used when mode='dagre'
  bucket: string;
}

export function layoutGraph(
  nodes: GraphNodeData[],
  edges: GraphEdgeData[],
  options: LayoutOptions,
): LaidOutNode[] {
  const sig = signatureOf(nodes, edges, options.mode, options.bucket);
  const cached = CACHE.get(options.bucket);
  if (cached && cached.signature === sig) return cached.result;

  const result =
    options.mode === 'dagre'
      ? layoutDagre(nodes, edges, options.direction ?? 'LR')
      : layoutForce(nodes, edges);

  CACHE.set(options.bucket, { signature: sig, result });
  return result;
}

export function invalidateLayoutCache(bucket?: string) {
  if (bucket) CACHE.delete(bucket);
  else CACHE.clear();
}
