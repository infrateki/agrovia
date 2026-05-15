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
}));
