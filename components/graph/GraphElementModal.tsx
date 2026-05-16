'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type MouseEvent as ReactMouseEvent,
} from 'react';
import { ArrowUpRight, FileText, X } from 'lucide-react';
import type { GraphEdgeData, GraphNodeData } from '@/lib/data/mock-graph';
import { GRAPH_EDGES, GRAPH_NODES, ONTOLOGY_EDGES, ONTOLOGY_NODES } from '@/lib/data/mock-graph';
import {
  getNodeAccent,
  getNodeLabelES,
  type NodeKind,
} from '@/lib/ontology/schema';
import styles from './GraphElementModal.module.css';

export type GraphModalElement =
  | { kind: 'node'; node: GraphNodeData }
  | {
      kind: 'edge';
      edge: GraphEdgeData;
      source: GraphNodeData;
      target: GraphNodeData;
    }
  | null;

interface Props {
  element: GraphModalElement;
  onClose: () => void;
  onNavigate: (nodeId: string) => void;
  // The full corpus we're viewing (instance / ontology / hybrid). Used to
  // enumerate "RELACIONES" for a node and to find documents attached to it.
  allNodes: GraphNodeData[];
  allEdges: GraphEdgeData[];
}

interface RelatedRow {
  direction: 'out' | 'in';
  edge: GraphEdgeData;
  other: GraphNodeData;
}

function humanize(key: string): string {
  const s = key
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/_/g, ' ')
    .toLowerCase();
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function nodeBySourceLine(node: GraphNodeData): string {
  // The instance ids live in mock-graph.ts; ontology placeholders in the same
  // file but lower in the export. Give a single attribution that matches the
  // exported variable name rather than guessing a line number.
  const isOntology = node.id.startsWith('O-');
  return isOntology ? 'mock-graph.ts · ONTOLOGY_NODES' : 'mock-graph.ts · GRAPH_NODES';
}

function edgeSourceLine(edge: GraphEdgeData): string {
  const ontology = ONTOLOGY_EDGES.some((e) => e.id === edge.id);
  return ontology ? 'mock-graph.ts · ONTOLOGY_EDGES' : 'mock-graph.ts · GRAPH_EDGES';
}

function buildRelations(
  node: GraphNodeData,
  allNodes: GraphNodeData[],
  allEdges: GraphEdgeData[],
): RelatedRow[] {
  const byId = new Map(allNodes.map((n) => [n.id, n] as const));
  const rows: RelatedRow[] = [];
  for (const e of allEdges) {
    if (e.source === node.id) {
      const other = byId.get(e.target);
      if (other) rows.push({ direction: 'out', edge: e, other });
    } else if (e.target === node.id) {
      const other = byId.get(e.source);
      if (other) rows.push({ direction: 'in', edge: e, other });
    }
  }
  return rows;
}

function buildAttachedDocuments(
  node: GraphNodeData,
  allNodes: GraphNodeData[],
  allEdges: GraphEdgeData[],
): GraphNodeData[] {
  const byId = new Map(allNodes.map((n) => [n.id, n] as const));
  const out: GraphNodeData[] = [];
  for (const e of allEdges) {
    if (e.kind !== 'ATTACHED') continue;
    if (e.target === node.id) {
      const src = byId.get(e.source);
      if (src && src.kind === 'Document') out.push(src);
    }
  }
  return out;
}

export function GraphElementModal({
  element,
  onClose,
  onNavigate,
  allNodes,
  allEdges,
}: Props) {
  const ref = useRef<HTMLDialogElement | null>(null);

  // Open / close the native dialog imperatively so we get the browser's
  // focus-trap + ESC behavior for free.
  useEffect(() => {
    const dlg = ref.current;
    if (!dlg) return;
    if (element && !dlg.open) {
      try {
        dlg.showModal();
      } catch {
        // showModal throws if already open or if the element is detached;
        // ignore — the effect will rerun and try again.
      }
    } else if (!element && dlg.open) {
      dlg.close();
    }
  }, [element]);

  // Browser fires 'close' when ESC is pressed; propagate to React state so
  // the parent knows the dialog is gone.
  useEffect(() => {
    const dlg = ref.current;
    if (!dlg) return;
    const onCancel = (e: Event) => {
      e.preventDefault();
      onClose();
    };
    const onClosed = () => onClose();
    dlg.addEventListener('cancel', onCancel);
    dlg.addEventListener('close', onClosed);
    return () => {
      dlg.removeEventListener('cancel', onCancel);
      dlg.removeEventListener('close', onClosed);
    };
  }, [onClose]);

  // Click on the backdrop (= the dialog element itself, outside its content)
  // closes the modal.
  const onDialogClick = useCallback(
    (e: ReactMouseEvent<HTMLDialogElement>) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose],
  );

  const body = useMemo(() => {
    if (!element) return null;

    if (element.kind === 'node') {
      const node = element.node;
      const accent = getNodeAccent(node.kind);
      const kindLabel = getNodeLabelES(node.kind);
      const properties = Object.entries(node.meta ?? {}).map(([k, v]) => ({
        label: humanize(k),
        value: String(v),
      }));
      const relations = buildRelations(node, allNodes, allEdges);
      const documents = buildAttachedDocuments(node, allNodes, allEdges);

      return (
        <NodeBody
          node={node}
          accent={accent}
          kindLabel={kindLabel}
          properties={properties}
          relations={relations}
          documents={documents}
          onNavigate={onNavigate}
        />
      );
    }

    return (
      <EdgeBody
        edge={element.edge}
        source={element.source}
        target={element.target}
        onNavigate={onNavigate}
      />
    );
  }, [element, allNodes, allEdges, onNavigate]);

  // Header derives from the current element so navigation inside the modal
  // updates the title without remounting.
  const header = useMemo(() => {
    if (!element) return null;
    if (element.kind === 'node') {
      const accent = getNodeAccent(element.node.kind);
      const kindLabel = getNodeLabelES(element.node.kind);
      return (
        <HeaderBar
          badgeLabel={kindLabel}
          badgeColor={accent}
          title={element.node.label}
          subtitle={element.node.id}
          onClose={onClose}
        />
      );
    }
    return (
      <HeaderBar
        badgeLabel={element.edge.kind}
        badgeColor="var(--color-warm-gold)"
        title={`${element.source.label} → ${element.target.label}`}
        subtitle={element.edge.id}
        onClose={onClose}
      />
    );
  }, [element, onClose]);

  return (
    <dialog
      ref={ref}
      className={styles.dialog}
      onClick={onDialogClick}
      aria-modal="true"
    >
      <div className={styles.surface}>
        {header}
        <div className={styles.body}>{body}</div>
      </div>
    </dialog>
  );
}

// ─────────────────────────────────────────────────────────────────────────
//  Sub-views
// ─────────────────────────────────────────────────────────────────────────

interface HeaderProps {
  badgeLabel: string;
  badgeColor: string;
  title: string;
  subtitle: string;
  onClose: () => void;
}

function HeaderBar({
  badgeLabel,
  badgeColor,
  title,
  subtitle,
  onClose,
}: HeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.headerLeft}>
        <span
          className={styles.typeBadge}
          style={{
            color: badgeColor,
            borderColor: badgeColor,
            background: `color-mix(in srgb, ${badgeColor} 14%, transparent)`,
          }}
        >
          {badgeLabel}
        </span>
        <div className={styles.titleBlock}>
          <h2 className={styles.title}>{title}</h2>
          <code className={styles.code}>{subtitle}</code>
        </div>
      </div>
      <button
        type="button"
        className={styles.closeBtn}
        onClick={onClose}
        aria-label="Cerrar"
      >
        <X size={14} strokeWidth={1.6} />
      </button>
    </header>
  );
}

interface NodeBodyProps {
  node: GraphNodeData;
  accent: string;
  kindLabel: string;
  properties: { label: string; value: string }[];
  relations: RelatedRow[];
  documents: GraphNodeData[];
  onNavigate: (nodeId: string) => void;
}

function NodeBody({
  node,
  accent,
  kindLabel,
  properties,
  relations,
  documents,
  onNavigate,
}: NodeBodyProps) {
  return (
    <>
      <Section title="Propiedades">
        {properties.length === 0 ? (
          <p className={styles.emptyHint}>Sin propiedades adicionales</p>
        ) : (
          <dl className={styles.kvList}>
            {properties.map((p) => (
              <div key={p.label} className={styles.kvRow}>
                <dt className={styles.kvKey}>{p.label}</dt>
                <dd className={styles.kvValue}>{p.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </Section>

      <Section title={`Relaciones · ${relations.length}`}>
        {relations.length === 0 ? (
          <p className={styles.emptyHint}>Este nodo no participa en relaciones.</p>
        ) : (
          <ul className={styles.relList}>
            {relations.map((r) => (
              <li key={r.edge.id}>
                <button
                  type="button"
                  className={styles.relRow}
                  onClick={() => onNavigate(r.other.id)}
                >
                  <span className={styles.relArrow} aria-hidden="true">
                    {r.direction === 'out' ? '→' : '←'}
                  </span>
                  <span className={styles.relKind}>{r.edge.kind}</span>
                  <span className={styles.relTarget}>{r.other.label}</span>
                  <span
                    className={styles.relTypeChip}
                    style={{
                      color: getNodeAccent(r.other.kind),
                      borderColor: getNodeAccent(r.other.kind),
                    }}
                  >
                    {getNodeLabelES(r.other.kind)}
                  </span>
                  <ArrowUpRight
                    size={12}
                    strokeWidth={1.6}
                    className={styles.relGo}
                  />
                </button>
              </li>
            ))}
          </ul>
        )}
      </Section>

      {documents.length > 0 && (
        <Section title={`Documentos adjuntos · ${documents.length}`}>
          <ul className={styles.docList}>
            {documents.map((doc) => (
              <li key={doc.id}>
                <button
                  type="button"
                  className={styles.docRow}
                  onClick={() => onNavigate(doc.id)}
                >
                  <FileText
                    size={12}
                    strokeWidth={1.6}
                    aria-hidden="true"
                    className={styles.docIcon}
                  />
                  <span className={styles.docLabel}>{doc.label}</span>
                  <span className={styles.docMeta}>
                    {(doc.meta?.tipo as string | undefined) ??
                      (doc.meta?.size as string | undefined) ??
                      ''}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section title="Fuente">
        <div className={styles.source}>
          <span className={styles.sourceIcon} style={{ background: accent }} />
          <span>
            {nodeBySourceLine(node)} · {kindLabel}
          </span>
        </div>
      </Section>
    </>
  );
}

interface EdgeBodyProps {
  edge: GraphEdgeData;
  source: GraphNodeData;
  target: GraphNodeData;
  onNavigate: (nodeId: string) => void;
}

function EdgeBody({ edge, source, target, onNavigate }: EdgeBodyProps) {
  // Edges in this graph carry no payload beyond kind, but we still render
  // a "Propiedades" section so the layout is consistent with node modals.
  return (
    <>
      <Section title="Propiedades">
        <p className={styles.emptyHint}>Sin propiedades adicionales</p>
      </Section>

      <Section title="Nodos">
        <div className={styles.edgeNodes}>
          <NodeSummary
            label="Origen"
            node={source}
            onClick={() => onNavigate(source.id)}
          />
          <div className={styles.edgeArrow} aria-hidden="true">
            <span>{edge.kind}</span>
          </div>
          <NodeSummary
            label="Destino"
            node={target}
            onClick={() => onNavigate(target.id)}
          />
        </div>
      </Section>

      <Section title="Fuente">
        <div className={styles.source}>
          <span
            className={styles.sourceIcon}
            style={{ background: 'var(--color-warm-gold)' }}
          />
          <span>{edgeSourceLine(edge)}</span>
        </div>
      </Section>
    </>
  );
}

interface NodeSummaryProps {
  label: string;
  node: GraphNodeData;
  onClick: () => void;
}

function NodeSummary({ label, node, onClick }: NodeSummaryProps) {
  const accent = getNodeAccent(node.kind);
  return (
    <button
      type="button"
      className={styles.nodeSummary}
      onClick={onClick}
      style={{ borderColor: accent }}
    >
      <span className={styles.nodeSummaryEyebrow}>{label}</span>
      <span
        className={styles.nodeSummaryDot}
        style={{ background: accent }}
        aria-hidden="true"
      />
      <span className={styles.nodeSummaryLabel}>{node.label}</span>
      <span className={styles.nodeSummaryKind} style={{ color: accent }}>
        {getNodeLabelES(node.kind)}
      </span>
    </button>
  );
}

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

function Section({ title, children }: SectionProps) {
  return (
    <section className={styles.section}>
      <h3 className={styles.sectionTitle}>{title}</h3>
      <div className={styles.sectionBody}>{children}</div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────
//  Convenience: resolve a modal target → element using the active corpus.
// ─────────────────────────────────────────────────────────────────────────

export function resolveModalElement(
  target:
    | { kind: 'node'; nodeId: string }
    | { kind: 'edge'; edgeId: string }
    | null,
  nodes: GraphNodeData[],
  edges: GraphEdgeData[],
): GraphModalElement {
  if (!target) return null;
  if (target.kind === 'node') {
    const node = nodes.find((n) => n.id === target.nodeId);
    if (!node) return null;
    return { kind: 'node', node };
  }
  const edge = edges.find((e) => e.id === target.edgeId);
  if (!edge) return null;
  const source = nodes.find((n) => n.id === edge.source);
  const targetNode = nodes.find((n) => n.id === edge.target);
  if (!source || !targetNode) return null;
  return { kind: 'edge', edge, source, target: targetNode };
}

// Expose a helper that consumers may not need, but keeps the import surface
// from being tree-shaken away when the modal is dynamic-imported.
export const __GRAPH_DATA__ = { GRAPH_NODES, GRAPH_EDGES, ONTOLOGY_NODES };
const KindBrand = (k: NodeKind) => k;
void KindBrand;
