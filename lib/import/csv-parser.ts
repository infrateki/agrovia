import type {
  Cliente,
  ClienteSegmento,
  Embarque,
  EmbarqueStatus,
  Lote,
  PipelineZone,
  Temperatura,
  Variedad,
} from '@/lib/types';

// ============================================================================
// Low-level CSV tokenization
// ============================================================================

/** Split a single CSV line, honoring "quoted, fields, with commas". */
function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cur += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      out.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out.map((s) => s.trim());
}

interface ParsedCsv {
  headers: string[];
  rows: Record<string, string>[];
}

function parseCsv(csvText: string): ParsedCsv {
  const lines = csvText
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .filter((l) => l.trim().length > 0);

  if (lines.length === 0) return { headers: [], rows: [] };

  const headers = splitCsvLine(lines[0]).map((h) => h.toLowerCase());
  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = splitCsvLine(lines[i]);
    const row: Record<string, string> = {};
    for (let c = 0; c < headers.length; c++) {
      row[headers[c]] = cols[c] ?? '';
    }
    rows.push(row);
  }
  return { headers, rows };
}

// ============================================================================
// Value coercion
// ============================================================================

function parseNumber(raw: string): number | null {
  if (raw === '' || raw == null) return null;
  // Strip thousands separators (commas) but keep decimal dot.
  const cleaned = raw.replace(/,/g, '');
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

/** Parse ISO (YYYY-MM-DD or full) or DD/MM/YYYY → ISO date string (YYYY-MM-DD). */
function parseDate(raw: string): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  // ISO direct
  const iso = new Date(trimmed);
  if (!Number.isNaN(iso.getTime()) && /^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
    return trimmed.length > 10 ? trimmed : trimmed.slice(0, 10);
  }
  // DD/MM/YYYY
  const m = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (m) {
    const [, d, mo, y] = m;
    const dd = d.padStart(2, '0');
    const mm = mo.padStart(2, '0');
    return `${y}-${mm}-${dd}`;
  }
  // Last-ditch: Date.parse
  if (!Number.isNaN(iso.getTime())) {
    return iso.toISOString();
  }
  return null;
}

function missingFields(
  row: Record<string, string>,
  required: string[],
): string[] {
  return required.filter((k) => !row[k] || row[k].trim() === '');
}

function checkRequiredHeaders(
  headers: string[],
  required: string[],
): string | null {
  const missing = required.filter((h) => !headers.includes(h));
  return missing.length === 0 ? null : `Faltan columnas requeridas: ${missing.join(', ')}`;
}

// ============================================================================
// Type guards / coercers for enum unions
// ============================================================================

const VARIEDADES: Variedad[] = ['arandano', 'uva', 'palta', 'mango', 'citricos'];
const ZONES: PipelineZone[] = [
  'cosecha',
  'seleccion',
  'packing',
  'frio',
  'embarque',
  'transito',
  'llegada',
];
const EMBARQUE_STATUSES: EmbarqueStatus[] = [
  'en-camara',
  'cargado',
  'en-transito',
  'en-puerto',
  'entregado',
];
const CLIENTE_SEGMENTOS: ClienteSegmento[] = ['premium', 'standard', 'emergente'];

function asVariedad(raw: string): Variedad | null {
  const v = raw.toLowerCase().replace(/[áéíóú]/g, (c) =>
    ({ á: 'a', é: 'e', í: 'i', ó: 'o', ú: 'u' })[c] ?? c,
  );
  return (VARIEDADES as string[]).includes(v) ? (v as Variedad) : null;
}

function asZone(raw: string): PipelineZone | null {
  const v = raw
    .toLowerCase()
    .replace(/[áéíóú]/g, (c) =>
      ({ á: 'a', é: 'e', í: 'i', ó: 'o', ú: 'u' })[c] ?? c,
    );
  return (ZONES as string[]).includes(v) ? (v as PipelineZone) : null;
}

function asEmbarqueStatus(raw: string): EmbarqueStatus | null {
  const v = raw.toLowerCase().replace(/_/g, '-');
  return (EMBARQUE_STATUSES as string[]).includes(v)
    ? (v as EmbarqueStatus)
    : null;
}

function asClienteSegmento(raw: string): ClienteSegmento | null {
  const v = raw.toLowerCase();
  return (CLIENTE_SEGMENTOS as string[]).includes(v)
    ? (v as ClienteSegmento)
    : null;
}

// ============================================================================
// Public parsers
// ============================================================================

export interface ParseResult<T> {
  data: T[];
  errors: string[];
}

const LOTE_REQUIRED = [
  'id',
  'parcela',
  'variedad',
  'calibre',
  'brix',
  'drymatter',
  'fechacosecha',
  'riskscore',
  'zone',
];

export function parseLotesCsv(csvText: string): ParseResult<Lote> {
  const { headers, rows } = parseCsv(csvText);
  const errors: string[] = [];
  const headerErr = checkRequiredHeaders(headers, LOTE_REQUIRED);
  if (headerErr) return { data: [], errors: [headerErr] };

  const data: Lote[] = [];
  rows.forEach((row, idx) => {
    const rowNum = idx + 2; // 1 = header
    const missing = missingFields(row, LOTE_REQUIRED);
    if (missing.length > 0) {
      errors.push(`Fila ${rowNum}: faltan campos (${missing.join(', ')})`);
      return;
    }
    const variedad = asVariedad(row.variedad);
    if (!variedad) {
      errors.push(`Fila ${rowNum}: variedad inválida "${row.variedad}"`);
      return;
    }
    const zone = asZone(row.zone);
    if (!zone) {
      errors.push(`Fila ${rowNum}: zona inválida "${row.zone}"`);
      return;
    }
    const brix = parseNumber(row.brix);
    const dryMatter = parseNumber(row.drymatter);
    const riskScore = parseNumber(row.riskscore);
    const fechaCosecha = parseDate(row.fechacosecha);
    if (brix == null || dryMatter == null || riskScore == null) {
      errors.push(`Fila ${rowNum}: brix/dryMatter/riskScore no numérico`);
      return;
    }
    if (!fechaCosecha) {
      errors.push(`Fila ${rowNum}: fechaCosecha no parseable`);
      return;
    }
    data.push({
      id: row.id,
      parcela: row.parcela,
      variedad,
      calibre: row.calibre,
      brix,
      dryMatter,
      fechaCosecha,
      riskScore,
      zone,
      embarqueId: row.embarqueid || undefined,
    });
  });
  return { data, errors };
}

const EMBARQUE_REQUIRED = [
  'id',
  'contenedor',
  'naviera',
  'setpointtemp',
  'fechazarpe',
  'eta',
  'clienteid',
  'loteids',
  'status',
  'riskscore',
  'currentzone',
];

export function parseEmbarquesCsv(csvText: string): ParseResult<Embarque> {
  const { headers, rows } = parseCsv(csvText);
  const errors: string[] = [];
  const headerErr = checkRequiredHeaders(headers, EMBARQUE_REQUIRED);
  if (headerErr) return { data: [], errors: [headerErr] };

  const data: Embarque[] = [];
  rows.forEach((row, idx) => {
    const rowNum = idx + 2;
    const missing = missingFields(row, EMBARQUE_REQUIRED);
    if (missing.length > 0) {
      errors.push(`Fila ${rowNum}: faltan campos (${missing.join(', ')})`);
      return;
    }
    const status = asEmbarqueStatus(row.status);
    const currentZone = asZone(row.currentzone);
    const setPointTemp = parseNumber(row.setpointtemp);
    const riskScore = parseNumber(row.riskscore);
    const fechaZarpe = parseDate(row.fechazarpe);
    const eta = parseDate(row.eta);
    if (!status) {
      errors.push(`Fila ${rowNum}: status inválido "${row.status}"`);
      return;
    }
    if (!currentZone) {
      errors.push(`Fila ${rowNum}: currentZone inválida "${row.currentzone}"`);
      return;
    }
    if (setPointTemp == null || riskScore == null) {
      errors.push(`Fila ${rowNum}: setPointTemp/riskScore no numéricos`);
      return;
    }
    if (!fechaZarpe || !eta) {
      errors.push(`Fila ${rowNum}: fechaZarpe/eta no parseables`);
      return;
    }
    const loteIds = row.loteids
      .split(/[|;]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    data.push({
      id: row.id,
      contenedor: row.contenedor,
      naviera: row.naviera,
      setPointTemp,
      fechaZarpe,
      eta,
      clienteId: row.clienteid,
      loteIds,
      status,
      riskScore,
      currentZone,
    });
  });
  return { data, errors };
}

const CLIENTE_REQUIRED = [
  'id',
  'nombre',
  'pais',
  'segmento',
  'score',
  'totalreclamos',
  'totalembarques',
  'montoreclamosusd',
];

export function parseClientesCsv(csvText: string): ParseResult<Cliente> {
  const { headers, rows } = parseCsv(csvText);
  const errors: string[] = [];
  const headerErr = checkRequiredHeaders(headers, CLIENTE_REQUIRED);
  if (headerErr) return { data: [], errors: [headerErr] };

  const data: Cliente[] = [];
  rows.forEach((row, idx) => {
    const rowNum = idx + 2;
    const missing = missingFields(row, CLIENTE_REQUIRED);
    if (missing.length > 0) {
      errors.push(`Fila ${rowNum}: faltan campos (${missing.join(', ')})`);
      return;
    }
    const segmento = asClienteSegmento(row.segmento);
    const score = parseNumber(row.score);
    const totalReclamos = parseNumber(row.totalreclamos);
    const totalEmbarques = parseNumber(row.totalembarques);
    const montoReclamosUsd = parseNumber(row.montoreclamosusd);
    if (!segmento) {
      errors.push(`Fila ${rowNum}: segmento inválido "${row.segmento}"`);
      return;
    }
    if (
      score == null ||
      totalReclamos == null ||
      totalEmbarques == null ||
      montoReclamosUsd == null
    ) {
      errors.push(`Fila ${rowNum}: campos numéricos inválidos`);
      return;
    }
    const preferencias = (row.preferencias || '')
      .split(/[|;]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    data.push({
      id: row.id,
      nombre: row.nombre,
      pais: row.pais,
      segmento,
      score,
      preferencias,
      totalReclamos,
      totalEmbarques,
      montoReclamosUsd,
    });
  });
  return { data, errors };
}

const TEMPERATURA_REQUIRED = ['id', 'embarqueid', 'timestamp', 'valor', 'sensorid', 'zona'];

export function parseTemperaturasCsv(csvText: string): ParseResult<Temperatura> {
  const { headers, rows } = parseCsv(csvText);
  const errors: string[] = [];
  const headerErr = checkRequiredHeaders(headers, TEMPERATURA_REQUIRED);
  if (headerErr) return { data: [], errors: [headerErr] };

  const data: Temperatura[] = [];
  rows.forEach((row, idx) => {
    const rowNum = idx + 2;
    const missing = missingFields(row, TEMPERATURA_REQUIRED);
    if (missing.length > 0) {
      errors.push(`Fila ${rowNum}: faltan campos (${missing.join(', ')})`);
      return;
    }
    const zona = asZone(row.zona);
    const valor = parseNumber(row.valor);
    const timestamp = parseDate(row.timestamp) || row.timestamp;
    if (!zona) {
      errors.push(`Fila ${rowNum}: zona inválida "${row.zona}"`);
      return;
    }
    if (valor == null) {
      errors.push(`Fila ${rowNum}: valor no numérico`);
      return;
    }
    if (!timestamp) {
      errors.push(`Fila ${rowNum}: timestamp no parseable`);
      return;
    }
    data.push({
      id: row.id,
      embarqueId: row.embarqueid,
      timestamp,
      valor,
      sensorId: row.sensorid,
      zona,
    });
  });
  return { data, errors };
}
