import type { Senal } from '../types';

export const mockSenales: Senal[] = [
  {
    id: 'SG-001',
    tipo: 'riesgo',
    fuente: 'internal',
    score: 91,
    titulo: 'Embarque de arándanos muestra patrón de excursión de temperatura',
    descripcion:
      'El logger del embarque S-8842 (Walmart US) registró una excursión a 5.8 °C en día 4 de tránsito. Patrón consistente con reclamos previos por blandura al arribo.',
    accion: 'Preparar carpeta de defensa antes de llegada',
    fecha: '2026-05-12T09:30:00Z',
  },
  {
    id: 'SG-002',
    tipo: 'mercado',
    fuente: 'market',
    score: 74,
    titulo: 'Precios de uva en EE.UU. bajando mientras volumen llega a pico',
    descripcion:
      'Mercados spot en Filadelfia y Miami muestran caída de 8% w/w mientras llegada peruana sube. Riesgo de margen en lotes commodity.',
    accion: 'Priorizar lotes premium para compradores tier A',
    fecha: '2026-05-13T14:10:00Z',
  },
  {
    id: 'SG-003',
    tipo: 'calidad',
    fuente: 'client',
    score: 68,
    titulo: 'Aumento de quejas por llegadas blandas en categoría palta',
    descripcion:
      'Tres clientes en UE reportan firmeza por debajo de target en últimos 14 días. Posible vínculo con dry matter límite y ventana de tránsito ampliada.',
    accion: 'Revisar dry matter y ventanas de tránsito',
    fecha: '2026-05-13T17:45:00Z',
  },
  {
    id: 'SG-004',
    tipo: 'regulatorio',
    fuente: 'regulatory',
    score: 62,
    titulo: 'APHIS actualiza requisitos fitosanitarios para cítricos',
    descripcion:
      'Nuevos protocolos APHIS para cítricos peruanos entran en vigor en 30 días. Impacta documentación de inspección en origen.',
    accion: 'Verificar certificaciones vigentes con SENASA',
    fecha: '2026-05-11T08:00:00Z',
  },
  {
    id: 'SG-005',
    tipo: 'riesgo',
    fuente: 'client',
    score: 78,
    titulo: 'Cliente Tesco reporta 3 reclamos en últimas 6 semanas',
    descripcion:
      'Frecuencia de reclamos sobre Tesco UK supera el promedio histórico. Score de cliente bajó de 82 a 74 en el trimestre.',
    accion:
      'Agendar llamada con account manager, preparar historial',
    fecha: '2026-05-10T11:20:00Z',
  },
  {
    id: 'SG-006',
    tipo: 'mercado',
    fuente: 'market',
    score: 45,
    titulo: 'Volumen de arándano peruano supera forecast en 15%',
    descripcion:
      'ProArándanos publica cifras semanales con volumen 15% sobre proyección. Riesgo de saturación en destinos tradicionales.',
    accion: 'Evaluar impacto en precios y reasignar destinos',
    fecha: '2026-05-12T20:00:00Z',
  },
];
