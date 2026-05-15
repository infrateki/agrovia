import { create } from 'zustand';
import { DEFAULT_LAYER_VISIBILITY } from '../constants';
import type { LayerVisibility, NavViewId, ViewMode } from '../types';

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
}));
