'use client';

import { useMemo } from 'react';
import {
  FileText,
  FolderArchive,
  Phone,
  Sparkles,
} from 'lucide-react';
import { usePipelineStore } from '@/lib/stores/pipeline-store';
import { ZONE_LABELS } from '@/lib/constants';
import type { FichaOperativa as Ficha, RiskLevel } from '@/lib/types';
import { CausaAccionCard } from './CausaAccionCard';
import { ImpactoEconomico } from './ImpactoEconomico';
import { TrazabilidadTimeline } from './TrazabilidadTimeline';
import { TemperaturaCurve } from './TemperaturaCurve';
import { DataSourceBadge } from './DataSourceBadge';
import styles from './FichaOperativa.module.css';

interface FichaOperativaProps {
  ficha: Ficha;
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join('');
}

const RISK_CLASS: Record<RiskLevel, string> = {
  BAJO: styles['risk-bajo'] ?? '',
  MEDIO: styles['risk-medio'] ?? '',
  ALTO: styles['risk-alto'] ?? '',
  CRÍTICO: styles['risk-critico'] ?? '',
};

export function FichaOperativa({ ficha }: FichaOperativaProps) {
  const embarques = usePipelineStore((s) => s.embarques);
  const temperaturas = usePipelineStore((s) => s.temperaturas);

  const isEmbarque = ficha.targetType === 'embarque';
  const embarque = useMemo(
    () => (isEmbarque ? embarques.find((e) => e.id === ficha.targetId) : undefined),
    [isEmbarque, embarques, ficha.targetId],
  );

  const hasTempSeries = useMemo(
    () =>
      isEmbarque
        ? temperaturas.some((t) => t.embarqueId === ficha.targetId)
        : false,
    [isEmbarque, temperaturas, ficha.targetId],
  );

  const zoneLabel = ZONE_LABELS[ficha.zona];
  const riskClass = RISK_CLASS[ficha.riskLabel];

  const fichaTimestamp = useMemo(() => {
    // Anchor to embarque ETA if available, otherwise "now-ish" frozen ISO.
    if (embarque?.fechaZarpe) return embarque.fechaZarpe;
    return new Date().toISOString();
  }, [embarque]);

  return (
    <div className={styles.ficha}>
      {/* === Header === */}
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <div className={styles.eyebrow}>
            Ficha operativa · {zoneLabel}
          </div>
          <span className={`${styles.riskPill} ${riskClass}`}>
            <span className={styles.riskScore}>{ficha.riskScore}</span>
            <span className={styles.riskLabel}>{ficha.riskLabel}</span>
          </span>
        </div>
        <h2 className={styles.title}>{ficha.titulo}</h2>
        <DataSourceBadge
          source="GraphRAG · CRM · Loggers"
          timestamp={fichaTimestamp}
          confidence={ficha.riskScore >= 80 ? 'high' : 'medium'}
          isMock
        />
      </header>

      {/* === Risk summary === */}
      <section className={`${styles.summaryCard} ${riskClass}`}>
        <div className={styles.summaryHeader}>
          <Sparkles size={14} />
          <span>Nivel de riesgo: {ficha.riskLabel}</span>
        </div>
        <div className={styles.barTrack} aria-hidden="true">
          <div
            className={styles.barFill}
            style={{ width: `${Math.min(100, Math.max(0, ficha.riskScore))}%` }}
          />
        </div>
        <p className={styles.summaryText}>{ficha.resumenRiesgo}</p>
      </section>

      {/* === Trazabilidad timeline (only for embarque) === */}
      {isEmbarque && embarque ? (
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTitle}>Trazabilidad</span>
            <DataSourceBadge
              source="ERP Nisira"
              timestamp={embarque.fechaZarpe}
              confidence="high"
              isMock
            />
          </div>
          <TrazabilidadTimeline embarqueId={embarque.id} />
        </section>
      ) : null}

      {/* === Causa Probable === */}
      <CausaAccionCard
        type="causa"
        title="Causa probable"
        items={ficha.causasProbables}
      />

      {/* === Acción Recomendada === */}
      <CausaAccionCard
        type="accion"
        title="Acción recomendada"
        items={ficha.accionesRecomendadas}
      />

      {/* === Temperature curve for embarque if data exists === */}
      {isEmbarque && hasTempSeries ? (
        <TemperaturaCurve embarqueId={ficha.targetId} height={180} />
      ) : null}

      {/* === Responsable === */}
      <section className={styles.responsable}>
        <div className={styles.avatar} aria-hidden="true">
          {initials(ficha.responsable.nombre)}
        </div>
        <div className={styles.responsableInfo}>
          <div className={styles.responsableLabel}>Responsable</div>
          <div className={styles.responsableName}>
            {ficha.responsable.nombre}
            <span className={styles.responsableRole}>
              · {ficha.responsable.rol}
            </span>
          </div>
        </div>
      </section>

      {/* === Impacto económico === */}
      <ImpactoEconomico
        valorEmbarque={ficha.impacto.valorEmbarque}
        probabilidadReclamo={ficha.impacto.probabilidadReclamo}
        montoEstimado={ficha.impacto.montoEstimado}
        moneda={ficha.impacto.moneda ?? 'USD'}
      />

      {/* === Quick actions === */}
      <div className={styles.actions}>
        <button type="button" className={`${styles.actionBtn} ${styles.actionBrief}`}>
          <FileText size={14} />
          Generar Brief
        </button>
        <button type="button" className={`${styles.actionBtn} ${styles.actionDefense}`}>
          <FolderArchive size={14} />
          Carpeta Defensa
        </button>
        <button type="button" className={`${styles.actionBtn} ${styles.actionContact}`}>
          <Phone size={14} />
          Contactar
        </button>
      </div>
    </div>
  );
}
