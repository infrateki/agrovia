import { create } from 'zustand';
import type { PipelineZone } from '../types';

interface SelectionState {
  selectedZone: PipelineZone | null;
  setSelectedZone: (zone: PipelineZone | null) => void;
  selectedObjectId: string | null;
  setSelectedObjectId: (id: string | null) => void;
  hoveredObjectId: string | null;
  setHoveredObjectId: (id: string | null) => void;
  clearSelection: () => void;
}

export const useSelectionStore = create<SelectionState>((set) => ({
  selectedZone: null,
  setSelectedZone: (zone) => set({ selectedZone: zone }),
  selectedObjectId: null,
  setSelectedObjectId: (id) => set({ selectedObjectId: id }),
  hoveredObjectId: null,
  setHoveredObjectId: (id) => set({ hoveredObjectId: id }),
  clearSelection: () =>
    set({
      selectedZone: null,
      selectedObjectId: null,
      hoveredObjectId: null,
    }),
}));
