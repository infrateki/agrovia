import type { FichaOperativa, PipelineZone } from '../types';

export const mockFichas: FichaOperativa[] = [
  // === Flagship: S-8842 high-risk arándano shipment to Walmart US ===
  {
    id: 'FO-S-8842',
    targetType: 'embarque',
    targetId: 'S-8842',
    zona: 'transito',
    riskScore: 91,
    riskLabel: 'CRÍTICO',
    titulo: 'S-8842 · Arándanos a Walmart US',
    resumenRiesgo:
      'Convergencia de temperatura irregular, tránsito largo y patrón histórico de reclamos del cliente.',
    causasProbables: [
      'Excursión de temperatura detectada día 4 (+5.8 °C por 2 horas)',
      'Walmart acumula 3 reclamos en últimos 90 días sobre arándanos',
      'Variedad arándano altamente sensible a quiebre de cadena de frío',
      'ETA proyecta tránsito 17 días — sobre ventana óptima de 14',
    ],
    accionesRecomendadas: [
      'Avisar de inmediato al responsable de cuenta (Carlos M.)',
      'Generar carpeta de defensa con curva de temperatura + QC en origen',
      'Solicitar fotos de arribo al agente en Filadelfia',
      'Preparar respuesta comercial proactiva antes del descargue',
      'Bloquear lotes hermanos (L-1001, L-1002) para inspección dirigida',
    ],
    responsable: {
      nombre: 'Carlos Mendoza',
      rol: 'Gerente Comercial',
    },
    impacto: {
      valorEmbarque: 180000,
      probabilidadReclamo: 0.62,
      montoEstimado: 85000,
      moneda: 'USD',
    },
  },

  // === Normal-risk reference: S-8845 grape shipment to AEON Japan ===
  {
    id: 'FO-S-8845',
    targetType: 'embarque',
    targetId: 'S-8845',
    zona: 'transito',
    riskScore: 22,
    riskLabel: 'BAJO',
    titulo: 'S-8845 · Uva a AEON Japan',
    resumenRiesgo:
      'Cadena de frío estable, cliente premium con historial limpio y tránsito dentro de ventana.',
    causasProbables: [
      'Sensor reporta -0.8 °C ± 0.2 °C de forma constante',
      'Lotes L-1009 y L-1010 con brix 17.8–18.5 (sobre target)',
      'AEON Japan: solo 2 reclamos en último año fiscal',
    ],
    accionesRecomendadas: [
      'Mantener monitoreo estándar cada 6 horas',
      'Confirmar documentación fitosanitaria con SENASA',
      'Coordinar ventana de descargue en puerto de Yokohama',
    ],
    responsable: {
      nombre: 'Lucía Salas',
      rol: 'Coordinadora de Exportación',
    },
    impacto: {
      valorEmbarque: 145000,
      probabilidadReclamo: 0.08,
      montoEstimado: 5800,
      moneda: 'USD',
    },
  },

  // === Zone-level fichas ===
  {
    id: 'FO-zone-cosecha',
    targetType: 'zone',
    targetId: 'cosecha',
    zona: 'cosecha',
    riskScore: 35,
    riskLabel: 'BAJO',
    titulo: 'Cosecha · Origen de pipeline',
    resumenRiesgo:
      'Volumen entrante por encima del forecast; ningún lote en estado crítico al momento.',
    causasProbables: [
      'Pico estacional en zona Trujillo-Sur',
      'Cuadrillas operando a 95% de capacidad',
      'Clima estable últimos 7 días',
    ],
    accionesRecomendadas: [
      'Coordinar refuerzo de cuadrillas para mañana',
      'Validar capacidad de packing aguas abajo',
    ],
    responsable: {
      nombre: 'Diego Ramos',
      rol: 'Jefe de Campo',
    },
    impacto: {
      valorEmbarque: 0,
      probabilidadReclamo: 0.05,
      montoEstimado: 12000,
      moneda: 'USD',
    },
  },
  {
    id: 'FO-zone-seleccion',
    targetType: 'zone',
    targetId: 'seleccion',
    zona: 'seleccion',
    riskScore: 28,
    riskLabel: 'BAJO',
    titulo: 'Selección · Calibre y color',
    resumenRiesgo:
      'Línea operando dentro de parámetros; descarte 6.2% sobre meta de 7%.',
    causasProbables: [
      'Calibre estable en lotes de arándano de Olmos',
      'Operadoras certificadas en turno completo',
    ],
    accionesRecomendadas: [
      'Mantener auditoría aleatoria cada 4 horas',
      'Revisar calibración semanal de cámaras ópticas',
    ],
    responsable: {
      nombre: 'María Pérez',
      rol: 'Supervisora de Línea',
    },
    impacto: {
      valorEmbarque: 0,
      probabilidadReclamo: 0.04,
      montoEstimado: 6000,
      moneda: 'USD',
    },
  },
  {
    id: 'FO-zone-packing',
    targetType: 'zone',
    targetId: 'packing',
    zona: 'packing',
    riskScore: 42,
    riskLabel: 'MEDIO',
    titulo: 'Packing · Empaque y etiquetado',
    resumenRiesgo:
      'Lote L-1011 (uva) con score 68 — revisar firmeza antes de cierre de pallets.',
    causasProbables: [
      'Brix bajo (16.2) en lotes de Fundo Camaná 5',
      'Tiempo de exposición fuera de cámara extendido',
    ],
    accionesRecomendadas: [
      'Acelerar paletizado de L-1011',
      'Reducir tiempo en zona templada a < 25 minutos',
      'Reforzar inspección de sello de clamshells',
    ],
    responsable: {
      nombre: 'Jorge Silva',
      rol: 'Jefe de Packing',
    },
    impacto: {
      valorEmbarque: 78000,
      probabilidadReclamo: 0.18,
      montoEstimado: 14000,
      moneda: 'USD',
    },
  },
  {
    id: 'FO-zone-frio',
    targetType: 'zone',
    targetId: 'frio',
    zona: 'frio',
    riskScore: 31,
    riskLabel: 'BAJO',
    titulo: 'Frío · Pre-enfriamiento y conservación',
    resumenRiesgo:
      'Cámaras estables; histórico reciente sin excursiones en sala principal.',
    causasProbables: [
      'Temperatura promedio 0.1 °C, dentro de spec',
      'Backup eléctrico verificado hace 12 horas',
    ],
    accionesRecomendadas: [
      'Verificar set point antes de carga de S-8848',
      'Validar humedad relativa al 92% para cítricos',
    ],
    responsable: {
      nombre: 'Ana Torres',
      rol: 'Jefa de Cadena de Frío',
    },
    impacto: {
      valorEmbarque: 0,
      probabilidadReclamo: 0.07,
      montoEstimado: 9500,
      moneda: 'USD',
    },
  },
  {
    id: 'FO-zone-embarque',
    targetType: 'zone',
    targetId: 'embarque',
    zona: 'embarque',
    riskScore: 48,
    riskLabel: 'MEDIO',
    titulo: 'Embarque · Carga y documentación',
    resumenRiesgo:
      'Lotes de palta cargados con dry matter al límite — riesgo de blandura en arribo.',
    causasProbables: [
      'L-1013 (palta) con dry matter 24.1 — borderline',
      'Patrón histórico: 3 quejas en categoría palta UE en 14 días',
      'Ventana de tránsito ampliada por congestión en Callao',
    ],
    accionesRecomendadas: [
      'Re-validar dry matter en muestreo de salida',
      'Coordinar fast-track de carga con naviera Maersk',
      'Alertar a cliente Tesco UK sobre tránsito ampliado',
    ],
    responsable: {
      nombre: 'Lucía Salas',
      rol: 'Coordinadora de Exportación',
    },
    impacto: {
      valorEmbarque: 165000,
      probabilidadReclamo: 0.22,
      montoEstimado: 36000,
      moneda: 'USD',
    },
  },
  {
    id: 'FO-zone-transito',
    targetType: 'zone',
    targetId: 'transito',
    zona: 'transito',
    riskScore: 76,
    riskLabel: 'ALTO',
    titulo: 'Tránsito · Monitoreo en alta mar',
    resumenRiesgo:
      'S-8842 muestra excursión grave en logger. Decisión comercial requerida antes del arribo.',
    causasProbables: [
      'Excursión +5.8 °C por 2 horas en día 4 (S-8842)',
      'Caída de precios spot de uva en EE.UU. -8% w/w',
      'Concentración de reclamos sobre Tesco UK último trimestre',
    ],
    accionesRecomendadas: [
      'Activar protocolo de defensa para S-8842',
      'Reasignar lotes premium hacia compradores tier A',
      'Programar llamada con account manager Tesco',
    ],
    responsable: {
      nombre: 'Carlos Mendoza',
      rol: 'Gerente Comercial',
    },
    impacto: {
      valorEmbarque: 325000,
      probabilidadReclamo: 0.45,
      montoEstimado: 96000,
      moneda: 'USD',
    },
  },
  {
    id: 'FO-zone-llegada',
    targetType: 'zone',
    targetId: 'llegada',
    zona: 'llegada',
    riskScore: 54,
    riskLabel: 'MEDIO',
    titulo: 'Llegada · Inspección y entrega',
    resumenRiesgo:
      'Reclamo abierto de Carrefour (R-001) sobre S-8846 — investigación en curso.',
    causasProbables: [
      'Arándanos S-8846 con blandura sobre umbral en arribo',
      'Tránsito S-8846 prolongado por escala en Cartagena',
    ],
    accionesRecomendadas: [
      'Adjuntar evidencia QC + curva térmica al expediente R-001',
      'Coordinar inspección dirigida con surveyor en destino',
      'Negociar nota de crédito parcial si rechazo es <12%',
    ],
    responsable: {
      nombre: 'Ana Torres',
      rol: 'Gerente de Postventa',
    },
    impacto: {
      valorEmbarque: 92000,
      probabilidadReclamo: 0.55,
      montoEstimado: 28000,
      moneda: 'USD',
    },
  },
];

export function findFichaForEmbarque(
  embarqueId: string,
): FichaOperativa | undefined {
  return mockFichas.find(
    (f) => f.targetType === 'embarque' && f.targetId === embarqueId,
  );
}

export function findFichaForZone(
  zone: PipelineZone,
): FichaOperativa | undefined {
  return mockFichas.find(
    (f) => f.targetType === 'zone' && f.targetId === zone,
  );
}

export function findFichaById(id: string): FichaOperativa | undefined {
  return mockFichas.find((f) => f.id === id);
}
