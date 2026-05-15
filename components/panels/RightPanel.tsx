'use client';

import { useMemo } from 'react';
import { Layers, X } from 'lucide-react';
import { usePipelineStore } from '@/lib/stores/pipeline-store';
import { useSelectionStore } from '@/lib/stores/selection-store';
import { useUiStore } from '@/lib/stores/ui-store';
import { ZONE_LABELS } from '@/lib/constants';
import type { BadgeVariant, Lote } from '@/lib/types';
import { Badge } from '@/components/ui/Badge';
import styles from './RightPanel.module.css';

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
        <div className={styles.eyebrow}>Zona seleccionada</div>
        <div className={styles.subtitle}>Detalle operativo y lotes activos en {zoneLabel}.</div>
      </div>

      <div className={styles.statBlock}>
        <div className={styles.stat}>
          <div className={styles.statLabel}>Lotes activos</div>
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

      <div>
        <div className={styles.eyebrow} style={{ marginBottom: 8 }}>
          Lotes
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
      </div>
    </>
  );
}

function DefaultSummary() {
  return (
    <>
      <div>
        <div className={styles.eyebrow}>Vista general</div>
        <div className={styles.subtitle}>
          Selecciona una zona del pipeline para inspeccionar lotes, métricas y señales asociadas.
        </div>
      </div>
      <div className={styles.empty}>
        Haz clic en una zona del modelo 3D para ver el detalle aquí.
      </div>
    </>
  );
}

export function RightPanel() {
  const rightPanelOpen = useUiStore((s) => s.rightPanelOpen);
  const setRightPanelOpen = useUiStore((s) => s.setRightPanelOpen);
  const selectedZone = useSelectionStore((s) => s.selectedZone);
  const lotes = usePipelineStore((s) => s.lotes);

  const zoneLotes = useMemo(
    () => (selectedZone ? lotes.filter((l) => l.zone === selectedZone) : []),
    [selectedZone, lotes],
  );

  const title = selectedZone ? ZONE_LABELS[selectedZone] : 'Detalle';

  return (
    <aside className={`${styles.panel} ${rightPanelOpen ? styles.open : ''}`}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>
          <Layers size={16} color="var(--color-accent-green-light)" />
          {title}
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
        {selectedZone ? (
          <ZoneDetail zoneLabel={ZONE_LABELS[selectedZone]} lotes={zoneLotes} />
        ) : (
          <DefaultSummary />
        )}
      </div>
    </aside>
  );
}
