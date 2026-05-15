'use client';

import { useMemo } from 'react';
import { Layers, Thermometer, X } from 'lucide-react';
import { usePipelineStore } from '@/lib/stores/pipeline-store';
import { useSelectionStore } from '@/lib/stores/selection-store';
import { useUiStore } from '@/lib/stores/ui-store';
import { ZONE_LABELS } from '@/lib/constants';
import { findFichaForEmbarque, findFichaForZone } from '@/lib/data/mock-fichas';
import type { BadgeVariant, Embarque, Lote } from '@/lib/types';
import { Badge } from '@/components/ui/Badge';
import { FichaOperativa } from './FichaOperativa';
import { TemperaturaCurve } from './TemperaturaCurve';
import { DataSourceBadge } from './DataSourceBadge';
import styles from './RightPanel.module.css';

const FRIO_DEFAULT_EMBARQUE = 'S-8842';
const HIGH_RISK_THRESHOLD = 80;

function riskVariant(score: number): BadgeVariant {
  if (score >= 80) return 'bad';
  if (score >= 55) return 'warn';
  return 'good';
}

function ZoneDetail({ zoneLabel, lotes }: { zoneLabel: string; lotes: Lote[] }) {
  const highRisk = lotes.filter((l) => l.riskScore >= 70).length;
  const avgRisk =
    lotes.length === 0
      ? 0
      : Math.round(lotes.reduce((sum, l) => sum + l.riskScore, 0) / lotes.length);

  return (
    <>
      <div>
        <div className={styles.eyebrow}>Lotes activos en {zoneLabel}</div>
      </div>

      <div className={styles.statBlock}>
        <div className={styles.stat}>
          <div className={styles.statLabel}>Lotes</div>
          <div className={styles.statValue}>{lotes.length}</div>
        </div>
        <div className={styles.stat}>
          <div className={styles.statLabel}>Riesgo prom.</div>
          <div className={styles.statValue}>{avgRisk}</div>
        </div>
        <div className={styles.stat}>
          <div className={styles.statLabel}>Alto riesgo</div>
          <div className={styles.statValue}>{highRisk}</div>
        </div>
        <div className={styles.stat}>
          <div className={styles.statLabel}>Variedades</div>
          <div className={styles.statValue}>
            {new Set(lotes.map((l) => l.variedad)).size}
          </div>
        </div>
      </div>

      {lotes.length === 0 ? (
        <div className={styles.empty}>Sin lotes activos en esta zona.</div>
      ) : (
        <div className={styles.list}>
          {lotes.map((l) => (
            <div key={l.id} className={styles.loteRow}>
              <span className={styles.loteId}>{l.id}</span>
              <span className={styles.loteMeta}>
                {l.variedad} · {l.calibre}
              </span>
              <Badge
                text={`${l.riskScore}`}
                variant={riskVariant(l.riskScore)}
                size="sm"
              />
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function DefaultSummary() {
  return (
    <>
      <div>
        <div className={styles.eyebrow}>Vista general</div>
        <div className={styles.subtitle}>
          Selecciona una zona del pipeline para inspeccionar lotes, métricas y
          generar la ficha operativa.
        </div>
      </div>
      <div className={styles.empty}>
        Haz clic en una zona del modelo 3D para ver el detalle aquí.
      </div>
    </>
  );
}

function FrioMonitor({ embarque }: { embarque: Embarque }) {
  return (
    <>
      <div>
        <div className={styles.eyebrow}>Cadena de frío · monitoreo</div>
        <div className={styles.subtitle}>
          Lecturas en vivo del data logger embarcado. Embarque activo:{' '}
          <strong>{embarque.id}</strong> ({embarque.naviera}).
        </div>
      </div>
      <TemperaturaCurve embarqueId={embarque.id} height={220} />
      <DataSourceBadge
        source="Emerson · IoT Reefer"
        timestamp={embarque.fechaZarpe}
        confidence="high"
        isMock
      />
    </>
  );
}

export function RightPanel() {
  const rightPanelOpen = useUiStore((s) => s.rightPanelOpen);
  const setRightPanelOpen = useUiStore((s) => s.setRightPanelOpen);
  const activeView = useUiStore((s) => s.activeView);

  const selectedZone = useSelectionStore((s) => s.selectedZone);
  const selectedObjectId = useSelectionStore((s) => s.selectedObjectId);

  const lotes = usePipelineStore((s) => s.lotes);
  const embarques = usePipelineStore((s) => s.embarques);

  // Resolve which embarque (if any) the panel should focus on.
  const focusedEmbarque = useMemo<Embarque | undefined>(() => {
    // Direct object selection from the 3D scene (e.g. clicking a container).
    if (selectedObjectId) {
      const direct = embarques.find((e) => e.id === selectedObjectId);
      if (direct) return direct;
    }
    // Promote any high-risk embarque sitting in the selected zone.
    if (selectedZone) {
      const inZone = embarques
        .filter((e) => e.currentZone === selectedZone)
        .sort((a, b) => b.riskScore - a.riskScore);
      if (inZone.length > 0 && inZone[0] && inZone[0].riskScore >= HIGH_RISK_THRESHOLD) {
        return inZone[0];
      }
    }
    return undefined;
  }, [selectedObjectId, selectedZone, embarques]);

  const ficha = useMemo(() => {
    if (focusedEmbarque) {
      const f = findFichaForEmbarque(focusedEmbarque.id);
      if (f) return f;
    }
    if (selectedZone) {
      return findFichaForZone(selectedZone);
    }
    return undefined;
  }, [focusedEmbarque, selectedZone]);

  const zoneLotes = useMemo(
    () => (selectedZone ? lotes.filter((l) => l.zone === selectedZone) : []),
    [selectedZone, lotes],
  );

  const isFrioMode = activeView === 'frio' && !ficha;

  // Header title selection
  let title = 'Detalle';
  let HeaderIcon: typeof Layers | typeof Thermometer = Layers;
  if (isFrioMode) {
    title = 'Cadena de frío';
    HeaderIcon = Thermometer;
  } else if (ficha) {
    title = ficha.titulo;
  } else if (selectedZone) {
    title = ZONE_LABELS[selectedZone];
  }

  // Standalone frío embarque (only when no ficha/selection drives content).
  const frioEmbarque = useMemo<Embarque | undefined>(() => {
    if (!isFrioMode) return undefined;
    return embarques.find((e) => e.id === FRIO_DEFAULT_EMBARQUE);
  }, [isFrioMode, embarques]);

  return (
    <aside className={`${styles.panel} ${rightPanelOpen ? styles.open : ''}`}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>
          <HeaderIcon size={16} color="var(--color-accent-green-light)" />
          <span className={styles.headerTitleText}>{title}</span>
        </div>
        <button
          type="button"
          className={styles.close}
          onClick={() => setRightPanelOpen(false)}
          aria-label="Cerrar panel"
        >
          <X size={16} />
        </button>
      </div>

      <div className={styles.body}>
        {ficha ? (
          <>
            <FichaOperativa ficha={ficha} />
            {selectedZone && !focusedEmbarque ? (
              <>
                <div className={styles.divider} />
                <ZoneDetail
                  zoneLabel={ZONE_LABELS[selectedZone]}
                  lotes={zoneLotes}
                />
              </>
            ) : null}
          </>
        ) : isFrioMode && frioEmbarque ? (
          <FrioMonitor embarque={frioEmbarque} />
        ) : selectedZone ? (
          <ZoneDetail
            zoneLabel={ZONE_LABELS[selectedZone]}
            lotes={zoneLotes}
          />
        ) : (
          <DefaultSummary />
        )}
      </div>
    </aside>
  );
}
