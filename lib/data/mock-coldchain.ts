import type { CamaraFrioStatus, ExcursionEvent } from '@/lib/types';

// === Cámaras de frío — estado actual ===
export const MOCK_CAMARAS: CamaraFrioStatus[] = [
  {
    id: 'CF-01',
    nombre: 'CF-01 · Arándano',
    tempActual: 0.2,
    setPoint: 0.0,
    deltaTemp: 0.2,
    humedadPct: 93,
    palletsActuales: 28,
    palletsCapacidad: 30,
    horasOperacion: 18.5,
    estado: 'normal',
    ultimaLectura: '11:45',
  },
  {
    id: 'CF-02',
    nombre: 'CF-02 · Arándano',
    tempActual: 0.5,
    setPoint: 0.0,
    deltaTemp: 0.5,
    humedadPct: 91,
    palletsActuales: 24,
    palletsCapacidad: 30,
    horasOperacion: 12.0,
    estado: 'normal',
    ultimaLectura: '11:45',
  },
  {
    id: 'CF-03',
    nombre: 'CF-03 · Uva',
    tempActual: -0.8,
    setPoint: -1.0,
    deltaTemp: 0.2,
    humedadPct: 94,
    palletsActuales: 30,
    palletsCapacidad: 30,
    horasOperacion: 24.0,
    estado: 'normal',
    ultimaLectura: '11:45',
  },
  {
    id: 'CF-04',
    nombre: 'CF-04 · Palta',
    tempActual: 6.8,
    setPoint: 5.5,
    deltaTemp: 1.3,
    humedadPct: 88,
    palletsActuales: 22,
    palletsCapacidad: 30,
    horasOperacion: 8.0,
    estado: 'alerta',
    ultimaLectura: '11:42',
  },
  {
    id: 'CF-05',
    nombre: 'CF-05 · Mango',
    tempActual: 10.2,
    setPoint: 10.0,
    deltaTemp: 0.2,
    humedadPct: 90,
    palletsActuales: 18,
    palletsCapacidad: 24,
    horasOperacion: 6.0,
    estado: 'normal',
    ultimaLectura: '11:45',
  },
  {
    id: 'CF-06',
    nombre: 'CF-06 · Pre-Cool',
    tempActual: 2.1,
    setPoint: 0.0,
    deltaTemp: 2.1,
    humedadPct: 95,
    palletsActuales: 12,
    palletsCapacidad: 24,
    horasOperacion: 3.5,
    estado: 'normal',
    ultimaLectura: '11:45',
  },
];

// === 24h temperature monitor — 48 puntos (cada 30 min) por cámara ===
export interface TempReading24h {
  timestamp: string; // ISO
  label: string; // HH:mm
  cf01: number;
  cf02: number;
  cf03: number;
  cf04: number;
  cf05: number;
  cf06: number;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function pad(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

function generateTemp24h(): TempReading24h[] {
  // Final reading = 2026-05-15 11:45 local. 48 points back at 30-min spacing
  // → first point = 2026-05-14 12:15.
  const endMs = new Date('2026-05-15T11:45:00').getTime();
  const stepMs = 30 * 60 * 1000;
  const out: TempReading24h[] = [];
  for (let i = 0; i < 48; i += 1) {
    const ms = endMs - (47 - i) * stepMs;
    const d = new Date(ms);
    const label = `${pad(d.getHours())}:${pad(d.getMinutes())}`;

    // CF-01 — Arándano: estable en torno a 0.0-0.5°C
    const cf01 = 0.2 + 0.22 * Math.sin(i * 0.71) + 0.08 * Math.sin(i * 1.37 + 0.4);
    // CF-02 — Arándano: ligeramente más alto, mismo patrón
    const cf02 = 0.42 + 0.18 * Math.sin(i * 0.55 + 1.1) + 0.1 * Math.sin(i * 1.21);
    // CF-03 — Uva: estable en -0.8°C
    const cf03 = -0.8 + 0.14 * Math.sin(i * 0.63 + 0.5) + 0.05 * Math.sin(i * 1.7);
    // CF-04 — Palta: 5.5 estable las primeras 20h (40 puntos), deriva a 6.8 en las últimas 4h
    let cf04: number;
    if (i < 40) {
      cf04 = 5.5 + 0.13 * Math.sin(i * 0.42 + 0.3);
    } else {
      const t01 = (i - 39) / 8; // 0..1 over last 4h
      // ease-in curve to make the rise feel like a developing problem
      const eased = t01 * t01 * 0.65 + t01 * 0.35;
      cf04 = 5.5 + (6.8 - 5.5) * eased + 0.06 * Math.sin(i * 0.9);
    }
    // CF-05 — Mango: estable en 10.0-10.3°C
    const cf05 = 10.15 + 0.16 * Math.sin(i * 0.58 + 0.2) + 0.05 * Math.sin(i * 1.4);
    // CF-06 — Pre-Cool: 14.5°C ambiente las primeras 20.5h (41 puntos),
    // luego curva de pre-cooling exponencial bajando a ~2.1°C en las últimas 3.5h.
    let cf06: number;
    if (i < 41) {
      cf06 = 14.5 + 0.35 * Math.sin(i * 0.62) + 0.18 * Math.sin(i * 1.18 + 0.6);
    } else {
      const t01 = (i - 40) / 7; // 0..1 over last 3.5h
      cf06 = 2.1 + (14.5 - 2.1) * Math.exp(-2.8 * t01);
    }

    out.push({
      timestamp: d.toISOString(),
      label,
      cf01: round2(cf01),
      cf02: round2(cf02),
      cf03: round2(cf03),
      cf04: round2(cf04),
      cf05: round2(cf05),
      cf06: round2(cf06),
    });
  }
  return out;
}

export const MOCK_TEMP_24H: TempReading24h[] = generateTemp24h();

// === Embarques en tránsito — monitoreo de frío ===
export interface EmbarqueTempMonitorRow {
  id: string;
  embarque: string;
  contenedor: string;
  destino: string;
  setPoint: number;
  tempActual: number;
  deltaTemp: number;
  diasTransito: number;
  eta: string;
  alertas: number;
  estado: 'normal' | 'alerta' | 'crítico' | 'entregado';
  alertasDescr?: string;
}

export const MOCK_EMBARQUE_TEMP_MONITOR: EmbarqueTempMonitorRow[] = [
  {
    id: 'S-8842',
    embarque: 'S-8842',
    contenedor: 'MSCU-7842190',
    destino: 'Walmart US · EE.UU.',
    setPoint: -0.5,
    tempActual: 1.2,
    deltaTemp: 1.7,
    diasTransito: 11,
    eta: '21 May',
    alertas: 1,
    estado: 'crítico',
    alertasDescr: 'Excursión +5.8°C día 4',
  },
  {
    id: 'S-8843',
    embarque: 'S-8843',
    contenedor: 'HLXU-3391028',
    destino: "Driscoll's · EE.UU.",
    setPoint: -1.0,
    tempActual: -0.8,
    deltaTemp: 0.2,
    diasTransito: 17,
    eta: '15 May',
    alertas: 0,
    estado: 'normal',
  },
  {
    id: 'S-8844',
    embarque: 'S-8844',
    contenedor: 'MSKU-5519477',
    destino: 'Tesco UK · Reino Unido',
    setPoint: 5.5,
    tempActual: 5.7,
    deltaTemp: 0.2,
    diasTransito: 0,
    eta: '5 Jun',
    alertas: 0,
    estado: 'normal',
  },
  {
    id: 'S-8845',
    embarque: 'S-8845',
    contenedor: 'CMAU-9220844',
    destino: 'AEON Japan · Japón',
    setPoint: -1.0,
    tempActual: -0.6,
    deltaTemp: 0.4,
    diasTransito: 7,
    eta: '29 May',
    alertas: 0,
    estado: 'normal',
  },
  {
    id: 'S-8846',
    embarque: 'S-8846',
    contenedor: 'HLBU-6614029',
    destino: 'Carrefour France · Francia',
    setPoint: -0.5,
    tempActual: 0.3,
    deltaTemp: 0.8,
    diasTransito: 19,
    eta: '13 May',
    alertas: 1,
    estado: 'alerta',
    alertasDescr: 'Variación intermitente día 12',
  },
  {
    id: 'S-8847',
    embarque: 'S-8847',
    contenedor: 'MSCU-1108372',
    destino: 'Walmart US · EE.UU.',
    setPoint: 10.0,
    tempActual: 10.2,
    deltaTemp: 0.2,
    diasTransito: 0,
    eta: '1 Jun',
    alertas: 0,
    estado: 'normal',
  },
  {
    id: 'S-8848',
    embarque: 'S-8848',
    contenedor: 'MSKU-7748103',
    destino: 'Tesco UK · Reino Unido',
    setPoint: 7.0,
    tempActual: 7.1,
    deltaTemp: 0.1,
    diasTransito: 0,
    eta: '8 Jun',
    alertas: 0,
    estado: 'normal',
  },
  {
    id: 'S-8849',
    embarque: 'S-8849',
    contenedor: 'CMAU-3308516',
    destino: 'MercadoLibre · Perú',
    setPoint: 5.5,
    tempActual: 5.6,
    deltaTemp: 0.1,
    diasTransito: 30,
    eta: '2 May',
    alertas: 0,
    estado: 'entregado',
  },
];

// === Historial de excursiones — últimos 7 días ===
export const MOCK_EXCURSION_HISTORY: ExcursionEvent[] = [
  {
    id: 'EX-01',
    fecha: '2026-05-14 09:30',
    ubicacion: 'Contenedor MSCU-7842190 (S-8842)',
    duracion: '2h 15min',
    tempMax: 5.8,
    productoAfectado: 'Arándano — EE.UU.',
    impacto: 'severo',
    accionTomada: 'Carpeta de defensa en preparación',
  },
  {
    id: 'EX-02',
    fecha: '2026-05-13 14:20',
    ubicacion: 'Cámara 4 — Palta',
    duracion: '45min',
    tempMax: 7.2,
    productoAfectado: 'Palta Hass — Francia',
    impacto: 'moderado',
    accionTomada: 'Sensor recalibrado, técnico notificado',
  },
  {
    id: 'EX-03',
    fecha: '2026-05-11 03:15',
    ubicacion: 'Cámara 6 — Pre-Cool',
    duracion: '1h 30min',
    tempMax: 4.1,
    productoAfectado: 'Arándano — Japón',
    impacto: 'leve',
    accionTomada: 'Compresor reiniciado automáticamente',
  },
  {
    id: 'EX-04',
    fecha: '2026-05-09 22:45',
    ubicacion: 'Contenedor HLXU-3391028',
    duracion: '30min',
    tempMax: 3.2,
    productoAfectado: 'Uva — UK',
    impacto: 'leve',
    accionTomada: 'Ventilación ajustada por naviera',
  },
  {
    id: 'EX-05',
    fecha: '2026-05-07 11:00',
    ubicacion: 'Cámara 2 — Arándano',
    duracion: '20min',
    tempMax: 2.8,
    productoAfectado: 'Arándano — EE.UU.',
    impacto: 'leve',
    accionTomada: 'Puerta dejada abierta, protocolo reforzado',
  },
];
