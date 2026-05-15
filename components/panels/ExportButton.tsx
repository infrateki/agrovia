"use client";

import { FileDown } from "lucide-react";
import { usePipelineStore } from "@/lib/stores/pipeline-store";
import styles from "./ExportButton.module.css";

interface ExportButtonProps {
  label?: string;
  compact?: boolean;
}

export function ExportButton({
  label = "Exportar reporte",
  compact = false,
}: ExportButtonProps) {
  const dataSource = usePipelineStore((s) => s.dataSource);

  const openReport = () => {
    const url = `/api/export?source=${dataSource}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <button
      type="button"
      className={compact ? styles.btnCompact : styles.btn}
      onClick={openReport}
      aria-label="Exportar reporte semanal de riesgo"
      title="Abre el reporte en una pestaña nueva. Usa Ctrl+P para guardar como PDF."
    >
      <FileDown size={compact ? 12 : 14} strokeWidth={1.75} />
      {!compact && <span>{label}</span>}
    </button>
  );
}
