import type { PipelineZone, Temperatura } from '../types';

// Deterministic pseudo-random in [-1, 1] from an integer seed
function noise(seed: number): number {
  const s = Math.sin(seed * 9301 + 49297) * 233280;
  return (s - Math.floor(s)) * 2 - 1;
}

interface Series {
  embarqueId: string;
  sensorId: string;
  startIso: string;
  intervalMin: number;
  count: number;
  zona: PipelineZone;
  valueAt: (i: number) => number;
}

function generate(series: Series): Temperatura[] {
  const out: Temperatura[] = [];
  const start = new Date(series.startIso).getTime();
  const stepMs = series.intervalMin * 60 * 1000;
  for (let i = 0; i < series.count; i += 1) {
    const ts = new Date(start + i * stepMs).toISOString();
    out.push({
      id: `T-${series.embarqueId}-${String(i).padStart(4, '0')}`,
      embarqueId: series.embarqueId,
      timestamp: ts,
      valor: Math.round(series.valueAt(i) * 100) / 100,
      sensorId: series.sensorId,
      zona: series.zona,
    });
  }
  return out;
}

// === S-8842 — Arándanos a Walmart US — 7 días, 336 lecturas, EXCURSIÓN día 4 ===
// Set point -0.5 °C. Days 1–3 ~0.2 ± 0.3. Day 4: spike to 5.8 °C for ~2h then recover to 1.2 °C.
// Days 5–7: drift at ~1.0 ± 0.5.
const S8842_START = '2026-05-04T18:30:00Z';
const S8842_STEP_MIN = 30;
const S8842_COUNT = 336; // 7 days * 48 readings/day

// Index landmarks (each day = 48 readings)
// Day 1: 0..47, Day 2: 48..95, Day 3: 96..143, Day 4: 144..191, Day 5: 192..239,
// Day 6: 240..287, Day 7: 288..335
// Excursion start at hour 12 of day 4 → reading 144 + 24 = 168
// Spike duration: 2 hours = 4 readings at 5.8 °C, ramp up over 2 readings, ramp down over 4 readings
const EXCURSION_PEAK_START = 168;
const EXCURSION_PEAK_END = 172; // 4 readings inclusive of start, exclusive of end
const EXCURSION_RAMP_UP = 2; // before peak
const EXCURSION_RAMP_DOWN = 4; // after peak

function s8842Value(i: number): number {
  let base: number;
  let jitter: number;

  if (i < 144) {
    // Days 1–3: stable around 0.2 °C
    base = 0.2;
    jitter = 0.3;
  } else if (i < EXCURSION_PEAK_START - EXCURSION_RAMP_UP) {
    // Day 4 morning before excursion
    base = 0.3;
    jitter = 0.3;
  } else if (i < EXCURSION_PEAK_START) {
    // Ramp up to peak
    const t = (i - (EXCURSION_PEAK_START - EXCURSION_RAMP_UP)) / EXCURSION_RAMP_UP;
    base = 0.3 + t * (5.8 - 0.3);
    jitter = 0.1;
  } else if (i < EXCURSION_PEAK_END) {
    // Peak: 5.8 °C, very low jitter
    base = 5.8;
    jitter = 0.15;
  } else if (i < EXCURSION_PEAK_END + EXCURSION_RAMP_DOWN) {
    // Ramp down to 1.2 °C
    const t = (i - EXCURSION_PEAK_END) / EXCURSION_RAMP_DOWN;
    base = 5.8 - t * (5.8 - 1.2);
    jitter = 0.2;
  } else if (i < 192) {
    // Rest of day 4 post-recovery
    base = 1.2;
    jitter = 0.3;
  } else {
    // Days 5–7: drift at ~1.0 ± 0.5
    base = 1.0;
    jitter = 0.5;
  }

  return base + noise(i + 1) * jitter;
}

const s8842Series: Series = {
  embarqueId: 'S-8842',
  sensorId: 'EMR-LOG-7842',
  startIso: S8842_START,
  intervalMin: S8842_STEP_MIN,
  count: S8842_COUNT,
  zona: 'transito',
  valueAt: s8842Value,
};

// === S-8845 — Uva a AEON Japan — 5 días, 240 lecturas, perfil normal ===
// Set point -1 °C. Stable -0.8 ± 0.2.
const S8845_START = '2026-05-08T15:45:00Z';
const S8845_STEP_MIN = 30;
const S8845_COUNT = 240;

function s8845Value(i: number): number {
  return -0.8 + noise(i + 5000) * 0.2;
}

const s8845Series: Series = {
  embarqueId: 'S-8845',
  sensorId: 'EMR-LOG-3308',
  startIso: S8845_START,
  intervalMin: S8845_STEP_MIN,
  count: S8845_COUNT,
  zona: 'transito',
  valueAt: s8845Value,
};

export const mockTemperaturas: Temperatura[] = [
  ...generate(s8842Series),
  ...generate(s8845Series),
];
