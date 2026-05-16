import { create } from 'zustand';
import { DEFAULT_LAYER_VISIBILITY } from '../constants';
import { ALL_NODE_KINDS, type NodeKind } from '../ontology/schema';
import type { LayerVisibility, NavViewId, ViewMode } from '../types';

export type GraphLayer = 'ontology' | 'instance' | 'hybrid';
export type ThemeMode = 'dark' | 'light';

interface UiState {
  activeView: NavViewId;
  setActiveView: (view: NavViewId) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  layers: LayerVisibility;
  toggleLayer: (layer: keyof LayerVisibility) => void;
  setLayer: (layer: keyof LayerVisibility, value: boolean) => void;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  rightPanelOpen: boolean;
  setRightPanelOpen: (open: boolean) => void;
  cinematicMode: boolean;
  setCinematicMode: (on: boolean) => void;

  // Phase 4 — contextual shipment detail panel
  detailPanelOpen: boolean;
  selectedShipmentId: string | null;
  openDetail: (id: string) => void;
  closeDetail: () => void;

  // Phase 5 — ontology knowledge graph
  graphLayer: GraphLayer;
  graphSelectedNodeId: string | null;
  graphVisibleTypes: Set<NodeKind>;
  setGraphLayer: (l: GraphLayer) => void;
  selectGraphNode: (id: string | null) => void;
  toggleGraphType: (k: NodeKind) => void;

  // Phase 5 — theme (dark / light)
  theme: ThemeMode;
  setTheme: (t: ThemeMode) => void;
  toggleTheme: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  activeView: 'comando',
  setActiveView: (view) => set({ activeView: view }),
  viewMode: 'pipeline',
  setViewMode: (mode) => set({ viewMode: mode }),
  layers: { ...DEFAULT_LAYER_VISIBILITY },
  toggleLayer: (layer) =>
    set((state) => ({
      layers: { ...state.layers, [layer]: !state.layers[layer] },
    })),
  setLayer: (layer, value) =>
    set((state) => ({ layers: { ...state.layers, [layer]: value } })),
  sidebarCollapsed: false,
  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  rightPanelOpen: false,
  setRightPanelOpen: (open) => set({ rightPanelOpen: open }),
  cinematicMode: false,
  setCinematicMode: (on) => set({ cinematicMode: on }),

  detailPanelOpen: false,
  selectedShipmentId: null,
  openDetail: (id) => set({ detailPanelOpen: true, selectedShipmentId: id }),
  closeDetail: () => set({ detailPanelOpen: false }),

  // Phase 5 — graph
  graphLayer: 'instance',
  graphSelectedNodeId: null,
  graphVisibleTypes: new Set<NodeKind>(ALL_NODE_KINDS),
  setGraphLayer: (l) => set({ graphLayer: l, graphSelectedNodeId: null }),
  selectGraphNode: (id) => set({ graphSelectedNodeId: id }),
  toggleGraphType: (k) =>
    set((state) => {
      const next = new Set(state.graphVisibleTypes);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return { graphVisibleTypes: next };
    }),

  // Phase 5 — theme. Initial value is dark; the FOUC-prevention <script>
  // in the document head reads localStorage and sets data-theme on <html>
  // before React mounts. We hydrate this store from the same source on the
  // client (see hydrateThemeFromDom() in this file).
  theme: 'dark',
  setTheme: (t) => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', t);
      try {
        window.localStorage.setItem('agrovia.theme', t);
      } catch {
        /* ignore quota / privacy mode */
      }
    }
    set({ theme: t });
  },
  toggleTheme: () => {
    const next: ThemeMode = (typeof document !== 'undefined' &&
      document.documentElement.getAttribute('data-theme') === 'light')
      ? 'dark'
      : 'light';
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', next);
      try {
        window.localStorage.setItem('agrovia.theme', next);
      } catch {
        /* ignore */
      }
    }
    set({ theme: next });
  },
}));

// Pull the theme that the FOUC-prevention script already applied to <html>
// into the store so components reading useUiStore.theme stay in sync.
export function hydrateThemeFromDom(): void {
  if (typeof document === 'undefined') return;
  const attr = document.documentElement.getAttribute('data-theme');
  if (attr === 'light' || attr === 'dark') {
    useUiStore.setState({ theme: attr });
  }
}
