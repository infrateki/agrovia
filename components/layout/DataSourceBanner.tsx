"use client";

import { useEffect, useState } from "react";
import { FlaskConical, Database, X } from "lucide-react";
import { usePipelineStore } from "@/lib/stores/pipeline-store";
import styles from "./DataSourceBanner.module.css";

function formatRelative(importedAt: string | null): string {
  if (!importedAt) return "";
  const diffMs = Date.now() - new Date(importedAt).getTime();
  const min = Math.round(diffMs / 60000);
  if (min < 1) return "hace un momento";
  if (min < 60) return `hace ${min} min`;
  return `hace ${Math.round(min / 60)} h`;
}

export function DataSourceBanner() {
  const dataSource = usePipelineStore((s) => s.dataSource);
  const importedAt = usePipelineStore((s) => s.importedAt);
  const [dismissed, setDismissed] = useState(false);
  const [, setTick] = useState(0);

  // Bump a tick every 30s so the relative time refreshes. No setState during render.
  useEffect(() => {
    if (!importedAt) return;
    const id = window.setInterval(() => setTick((t) => t + 1), 30_000);
    return () => window.clearInterval(id);
  }, [importedAt]);

  if (dismissed) return null;

  const isImported = dataSource === "imported";
  const Icon = isImported ? Database : FlaskConical;
  const relative = formatRelative(importedAt);

  return (
    <div
      className={
        isImported
          ? `${styles.banner} ${styles.bannerImported}`
          : styles.banner
      }
      role="status"
    >
      <Icon size={12} strokeWidth={2} />
      <span className={styles.text}>
        {isImported
          ? `Datos importados${relative ? ` · ${relative}` : ""}`
          : "Operando con datos de demostración"}
      </span>
      <button
        type="button"
        className={styles.dismiss}
        onClick={() => setDismissed(true)}
        aria-label="Ocultar aviso"
      >
        <X size={11} />
      </button>
    </div>
  );
}
