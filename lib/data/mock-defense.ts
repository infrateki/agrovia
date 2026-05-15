import type { ClaimDefenseItem } from '../types';

export const mockDefenseItems: ClaimDefenseItem[] = [
  {
    id: 'D-001',
    nombre: 'Fotos de inspección QC',
    fuente: 'Sistema QC',
    status: 'ready',
  },
  {
    id: 'D-002',
    nombre: 'Curva de temperatura',
    fuente: 'Data logger Emerson',
    status: 'ready',
  },
  {
    id: 'D-003',
    nombre: 'Línea de tiempo de packing',
    fuente: 'ERP Nisira',
    status: 'ready',
  },
  {
    id: 'D-004',
    nombre: 'Registro de tratamiento',
    fuente: 'Sistema fitosanitario',
    status: 'ready',
  },
  {
    id: 'D-005',
    nombre: 'Ficha técnica del cliente',
    fuente: 'CRM / GraphRAG',
    status: 'draft',
  },
  {
    id: 'D-006',
    nombre: 'Respuesta comercial borrador',
    fuente: 'Operador FRESCO',
    status: 'draft',
  },
];
