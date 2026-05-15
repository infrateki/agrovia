"use client";

import { usePipelineStore } from "@/lib/stores/pipeline-store";
import { Badge } from "@/components/ui/Badge";
import styles from "./MobileHero.module.css";

export function MobileHero() {
  const kpis = usePipelineStore((s) => s.kpis);

  return (
    <div className={styles.hero}>
      <div className={styles.header}>
        <span className={styles.logoDot} aria-hidden="true" />
        <h1 className={styles.title}>AgroVIA Móvil</h1>
        <p className={styles.subtitle}>
          Cockpit ejecutivo para riesgo postcosecha, reclamos e inteligencia
          comercial con operador IA
        </p>
      </div>

      <div className={styles.grid}>
        {kpis.map((kpi) => (
          <div key={kpi.id} className={styles.card}>
            <div className={styles.cardLabel}>{kpi.label}</div>
            <div className={styles.cardValue}>{kpi.value}</div>
            <Badge text={kpi.badge} variant={kpi.badgeVariant} size="sm" />
          </div>
        ))}
      </div>

      <p className={styles.note}>
        Accede desde desktop para la experiencia 3D completa
      </p>
    </div>
  );
}
