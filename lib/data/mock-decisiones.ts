import type { DecisionPendiente } from '../types';

export const mockDecisiones: DecisionPendiente[] = [
  {
    id: 'DC-001',
    urgencia: 'alta',
    descripcion:
      'Generar carpeta de defensa para S-8842 antes del arribo (T-7 días)',
    fichaId: 'FO-S-8842',
    responsable: 'Carlos Mendoza',
    deadline: '2026-05-21',
  },
  {
    id: 'DC-002',
    urgencia: 'alta',
    descripcion:
      'Llamar account manager de Tesco UK por concentración de reclamos',
    fichaId: 'FO-zone-llegada',
    responsable: 'Ana Torres',
    deadline: '2026-05-16',
  },
  {
    id: 'DC-003',
    urgencia: 'media',
    descripcion:
      'Reasignar lotes premium de uva frente a caída de precios spot en EE.UU.',
    fichaId: 'FO-zone-transito',
    responsable: 'Diego Ramos',
    deadline: '2026-05-18',
  },
  {
    id: 'DC-004',
    urgencia: 'media',
    descripcion:
      'Revisar dry matter y ventana de tránsito en lotes de palta (S-8844)',
    fichaId: 'FO-zone-embarque',
    responsable: 'Lucía Salas',
    deadline: '2026-05-20',
  },
];
