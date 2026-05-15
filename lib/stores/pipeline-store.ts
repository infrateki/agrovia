import { create } from 'zustand';
import {
  mockChatMessages,
  mockClientes,
  mockDefenseItems,
  mockEmbarques,
  mockKpis,
  mockLotes,
  mockReclamos,
  mockSenales,
  mockTemperaturas,
} from '../data';
import type {
  ChatMessage,
  ClaimDefenseItem,
  Cliente,
  Embarque,
  KpiData,
  Lote,
  Reclamo,
  Senal,
  Temperatura,
} from '../types';

export type DataSourceMode = 'mock' | 'imported';

interface PipelineState {
  lotes: Lote[];
  embarques: Embarque[];
  clientes: Cliente[];
  reclamos: Reclamo[];
  temperaturas: Temperatura[];
  senales: Senal[];
  kpis: KpiData[];
  chatMessages: ChatMessage[];
  defenseItems: ClaimDefenseItem[];
  addChatMessage: (message: ChatMessage) => void;
  // Phase 2: data import (T5)
  dataSource: DataSourceMode;
  importedAt: string | null; // ISO timestamp of last import
  importLotes: (lotes: Lote[]) => void;
  importEmbarques: (embarques: Embarque[]) => void;
  importClientes: (clientes: Cliente[]) => void;
  importTemperaturas: (temps: Temperatura[]) => void;
  resetToMockData: () => void;
}

export const usePipelineStore = create<PipelineState>((set) => ({
  lotes: mockLotes,
  embarques: mockEmbarques,
  clientes: mockClientes,
  reclamos: mockReclamos,
  temperaturas: mockTemperaturas,
  senales: mockSenales,
  kpis: mockKpis,
  chatMessages: mockChatMessages,
  defenseItems: mockDefenseItems,
  addChatMessage: (message) =>
    set((state) => ({ chatMessages: [...state.chatMessages, message] })),
  // Phase 2
  dataSource: 'mock',
  importedAt: null,
  importLotes: (lotes) =>
    set({ lotes, dataSource: 'imported', importedAt: new Date().toISOString() }),
  importEmbarques: (embarques) =>
    set({
      embarques,
      dataSource: 'imported',
      importedAt: new Date().toISOString(),
    }),
  importClientes: (clientes) =>
    set({
      clientes,
      dataSource: 'imported',
      importedAt: new Date().toISOString(),
    }),
  importTemperaturas: (temperaturas) =>
    set({
      temperaturas,
      dataSource: 'imported',
      importedAt: new Date().toISOString(),
    }),
  resetToMockData: () =>
    set({
      lotes: mockLotes,
      embarques: mockEmbarques,
      clientes: mockClientes,
      reclamos: mockReclamos,
      temperaturas: mockTemperaturas,
      senales: mockSenales,
      kpis: mockKpis,
      defenseItems: mockDefenseItems,
      dataSource: 'mock',
      importedAt: null,
    }),
}));
