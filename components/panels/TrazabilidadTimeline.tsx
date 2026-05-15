'use client';

import { useMemo } from 'react';
import { AlertTriangle, Check } from 'lucide-react';
import { ZONE_LABELS, ZONE_ORDER } from '@/lib/constants';
import { useSelectionStore } from '@/lib/stores/selection-store';
import { usePipelineStore } from '@/lib/stores/pipeline-store';
import type { Embarque, PipelineZone } from '@/lib/types';
import styles from './TrazabilidadTimeline.module.css';

type Status = 'completed' | 'current' | 'future' | 'incident';

interface Step {
  zone: PipelineZone;
  label: string;
  status: Status;
  timestamp: string;
  note: string;
}

const ZARPE_TO_ZONE_OFFSET_DAYS: Record<PipelineZone, number> = {
  cosecha: -14,
  seleccion: -12,
  packing: -10,
  frio: -7,
  embarque: -2,
  transito: 0,
  llegada: 16,
};

function statusFor(
  zoneIdx: number,
  currentIdx: number,
  zone: PipelineZone,
  incidentZones: Set<PipelineZone>,
): Status {
  if (incidentZones.has(zone)) return 'incident';
  if (zoneIdx < currentIdx) return 'completed';
  if (zoneIdx === currentIdx) return 'current';
  return 'future';
}

function shortDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'short',
    });
  } catch {
    return '—';
  }
}

function deriveTimestamps(zarpe: string): Record<PipelineZone, string> {
  const base = new Date(zarpe).getTime();
  const out: Record<PipelineZone, string> = {} as Record<PipelineZone, string>;
  for (const zone of ZONE_ORDER) {
    const offsetDays = ZARPE_TO_ZONE_OFFSET_DAYS[zone];
    out[zone] = new Date(base + offsetDays * 24 * 60 * 60 * 1000).toISOString();
  }
  return out;
}

const ZONE_NOTES: Record<PipelineZone, string> = {
  cosecha: 'Lote cosechado en parcela',
  seleccion: 'Selección por calibre y color',
  packing: 'Empacado y etiquetado',
  frio: 'Enfriamiento en cámara',
  embarque: 'Cargado en contenedor reefer',
  transito: 'Travesía marítima en curso',
  llegada: 'Arribo y descarga en destino',
};

function buildSteps(embarque: Embarque): Step[] {
  const currentIdx = ZONE_ORDER.indexOf(embarque.currentZone);
  const incidentZones = new Set<PipelineZone>();
  if (embarque.id === 'S-8842') {
    incidentZones.add('transito');
  }
  const timestamps = deriveTimestamps(embarque.fechaZarpe);

  return ZONE_ORDER.map((zone, idx) => ({
    zone,
    label: ZONE_LABELS[zone],
    status: statusFor(idx, currentIdx, zone, incidentZones),
    timestamp: timestamps[zone],
    note: ZONE_NOTES[zone],
  }));
}

interface TrazabilidadTimelineProps {
  embarqueId?: string;
}

export function TrazabilidadTimeline({
  embarqueId,
}: TrazabilidadTimelineProps) {
  const embarques = usePipelineStore((s) => s.embarques);
  const setSelectedZone = useSelectionStore((s) => s.setSelectedZone);

  const embarque = useMemo(
    () => embarques.find((e) => e.id === embarqueId),
    [embarques, embarqueId],
  );

  const steps = useMemo(
    () => (embarque ? buildSteps(embarque) : []),
    [embarque],
  );

  if (!embarque || steps.length === 0) {
    return (
      <div className={styles.empty}>
        Sin trazabilidad disponible para el objeto seleccionado.
      </div>
    );
  }

  return (
    <div className={styles.timeline} role="list">
      <div className={styles.track} aria-hidden="true">
        <div className={styles.progressBg} />
      </div>
      <ol className={styles.stepRow}>
        {steps.map((step) => {
          const isIncident = step.status === 'incident';
          const isCurrent = step.status === 'current';
          const isCompleted = step.status === 'completed';
          return (
            <li
              key={step.zone}
              className={`${styles.step} ${styles[`status-${step.status}`]}`}
              role="listitem"
            >
              <button
                type="button"
                className={styles.dotBtn}
                onClick={() => setSelectedZone(step.zone)}
                aria-label={`Saltar a zona ${step.label}`}
                title={isIncident ? `Incidente: ${step.note}` : step.note}
              >
                <span className={styles.dot}>
                  {isIncident ? (
                    <AlertTriangle size={11} />
                  ) : isCompleted ? (
                    <Check size={11} />
                  ) : isCurrent ? (
                    <span className={styles.pulseInner} />
                  ) : null}
                </span>
              </button>
              <span className={styles.stepLabel}>{step.label}</span>
              <span className={styles.stepDate}>{shortDate(step.timestamp)}</span>
              <span className={styles.stepNote}>{step.note}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
