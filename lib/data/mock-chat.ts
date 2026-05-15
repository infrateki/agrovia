import type { ChatMessage } from '../types';

export const mockChatMessages: ChatMessage[] = [
  {
    id: 'M-001',
    role: 'user',
    text: '¿Qué embarques necesitan acción hoy?',
    timestamp: '2026-05-14T09:01:00Z',
  },
  {
    id: 'M-002',
    role: 'bot',
    text: '3 embarques requieren atención. Prioridad máxima: S-8842, arándanos a EE.UU., porque los datos del logger, la blandura QC y el historial de reclamos del cliente convergen.',
    timestamp: '2026-05-14T09:01:08Z',
  },
  {
    id: 'M-003',
    role: 'user',
    text: 'Prepara el brief de acción.',
    timestamp: '2026-05-14T09:02:14Z',
  },
  {
    id: 'M-004',
    role: 'bot',
    text: 'Listo: avisar al responsable de cuenta, adjuntar curva de temperatura, pedir fotos de llegada y preparar respuesta comercial. ¿Quieres que genere la carpeta de defensa completa?',
    timestamp: '2026-05-14T09:02:22Z',
  },
];
