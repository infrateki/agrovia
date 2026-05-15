import type { Reclamo } from '../types';

export const mockReclamos: Reclamo[] = [
  {
    id: 'R-001',
    embarqueId: 'S-8846',
    clienteId: 'C-004',
    tipo: 'calidad',
    monto: 28000,
    fecha: '2026-05-13',
    status: 'investigating',
    evidenciaUrls: [
      '/evidencia/R-001/foto-arribo.jpg',
      '/evidencia/R-001/qc-report.pdf',
    ],
    descripcion:
      'Carrefour reporta blandura por encima del umbral en arándanos al arribo. Posible correlación con tránsito prolongado y temperatura ligeramente elevada.',
  },
  {
    id: 'R-002',
    embarqueId: 'S-8842',
    clienteId: 'C-001',
    tipo: 'temperatura',
    monto: 85000,
    fecha: '2026-05-12',
    status: 'open',
    evidenciaUrls: [
      '/evidencia/R-002/curva-temperatura.png',
      '/evidencia/R-002/data-logger.csv',
    ],
    descripcion:
      'Walmart anticipa rechazo parcial por excursión de temperatura registrada en día 4 de tránsito (pico 5.8 °C). Carpeta de defensa en preparación.',
  },
  {
    id: 'R-003',
    embarqueId: 'S-8847',
    clienteId: 'C-001',
    tipo: 'calibre',
    monto: 12000,
    fecha: '2026-05-09',
    status: 'resolved',
    evidenciaUrls: ['/evidencia/R-003/calibre-muestreo.pdf'],
    descripcion:
      'Walmart reclama mezcla de calibres 8s y 10s fuera de especificación contractual. Resuelto con nota de crédito parcial y compromiso de re-muestreo.',
  },
  {
    id: 'R-004',
    embarqueId: 'S-8843',
    clienteId: 'C-002',
    tipo: 'calidad',
    monto: 45000,
    fecha: '2026-05-14',
    status: 'open',
    evidenciaUrls: [
      '/evidencia/R-004/inspeccion-arribo.jpg',
      '/evidencia/R-004/brix-test.pdf',
    ],
    descripcion:
      "Driscoll's marca uvas con desgrane elevado y brix bajo el target en arribo. Pendiente revisar protocolo de packing y muestreo de salida.",
  },
  {
    id: 'R-005',
    embarqueId: 'S-8849',
    clienteId: 'C-006',
    tipo: 'temperatura',
    monto: 32000,
    fecha: '2026-04-30',
    status: 'closed',
    evidenciaUrls: [
      '/evidencia/R-005/logger-historico.csv',
      '/evidencia/R-005/respuesta-cliente.pdf',
    ],
    descripcion:
      'MercadoLibre Perú reportó excursión menor en cámara durante carga. Cerrado con compensación logística; cadena de frío recuperada en menos de 90 minutos.',
  },
];
