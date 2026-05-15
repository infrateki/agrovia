"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import {
  Upload,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { usePipelineStore } from "@/lib/stores/pipeline-store";
import {
  parseLotesCsv,
  parseEmbarquesCsv,
  parseClientesCsv,
  parseTemperaturasCsv,
  getLoteTemplate,
  getEmbarqueTemplate,
  getClienteTemplate,
  getTemperaturaTemplate,
  type ParseResult,
} from "@/lib/import";
import styles from "./page.module.css";

type EntityKind = "lotes" | "embarques" | "clientes" | "temperaturas";

const ENTITY_LABELS: Record<EntityKind, string> = {
  lotes: "Lotes",
  embarques: "Embarques",
  clientes: "Clientes",
  temperaturas: "Temperaturas",
};

const TEMPLATE_FNS: Record<EntityKind, () => string> = {
  lotes: getLoteTemplate,
  embarques: getEmbarqueTemplate,
  clientes: getClienteTemplate,
  temperaturas: getTemperaturaTemplate,
};

function downloadCsv(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

interface PreviewState {
  kind: EntityKind;
  fileName: string;
  rawText: string;
  result: ParseResult<unknown>;
}

export default function ImportPage() {
  const importLotes = usePipelineStore((s) => s.importLotes);
  const importEmbarques = usePipelineStore((s) => s.importEmbarques);
  const importClientes = usePipelineStore((s) => s.importClientes);
  const importTemperaturas = usePipelineStore((s) => s.importTemperaturas);
  const resetToMockData = usePipelineStore((s) => s.resetToMockData);
  const dataSource = usePipelineStore((s) => s.dataSource);
  const importedAt = usePipelineStore((s) => s.importedAt);

  const [kind, setKind] = useState<EntityKind>("lotes");
  const [preview, setPreview] = useState<PreviewState | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseFor = useCallback(
    (entity: EntityKind, text: string): ParseResult<unknown> => {
      switch (entity) {
        case "lotes":
          return parseLotesCsv(text) as ParseResult<unknown>;
        case "embarques":
          return parseEmbarquesCsv(text) as ParseResult<unknown>;
        case "clientes":
          return parseClientesCsv(text) as ParseResult<unknown>;
        case "temperaturas":
          return parseTemperaturasCsv(text) as ParseResult<unknown>;
      }
    },
    [],
  );

  const handleFile = useCallback(
    async (file: File) => {
      setSuccessMsg(null);
      const text = await file.text();
      const result = parseFor(kind, text);
      setPreview({ kind, fileName: file.name, rawText: text, result });
    },
    [kind, parseFor],
  );

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const previewRows = useMemo(() => {
    if (!preview) return [];
    return preview.result.data.slice(0, 5) as Record<string, unknown>[];
  }, [preview]);

  const previewColumns = useMemo(() => {
    if (previewRows.length === 0) return [];
    return Object.keys(previewRows[0]);
  }, [previewRows]);

  const commitImport = () => {
    if (!preview || preview.result.data.length === 0) return;
    switch (preview.kind) {
      case "lotes":
        importLotes(preview.result.data as Parameters<typeof importLotes>[0]);
        break;
      case "embarques":
        importEmbarques(
          preview.result.data as Parameters<typeof importEmbarques>[0],
        );
        break;
      case "clientes":
        importClientes(
          preview.result.data as Parameters<typeof importClientes>[0],
        );
        break;
      case "temperaturas":
        importTemperaturas(
          preview.result.data as Parameters<typeof importTemperaturas>[0],
        );
        break;
    }
    setSuccessMsg(
      `${preview.result.data.length} registros importados (${ENTITY_LABELS[preview.kind]}).`,
    );
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onResetToMock = () => {
    resetToMockData();
    setSuccessMsg("Datos restablecidos a la demostración.");
    setPreview(null);
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link href="/" className={styles.backLink}>
          <ArrowLeft size={14} />
          <span>Volver al cockpit</span>
        </Link>
        <h1 className={styles.title}>
          <Upload size={20} strokeWidth={1.75} />
          Importar datos operativos
        </h1>
        <p className={styles.subtitle}>
          Carga archivos CSV con tus datos reales para reemplazar los datos de
          demostración. Los cambios viven solo en esta sesión del navegador.
        </p>
        <div className={styles.statusRow}>
          <span
            className={
              dataSource === "imported"
                ? styles.statusImported
                : styles.statusMock
            }
          >
            {dataSource === "imported"
              ? `Datos importados · ${importedAt ? new Date(importedAt).toLocaleString("es-PE") : ""}`
              : "Operando con datos de demostración"}
          </span>
          {dataSource === "imported" && (
            <button
              type="button"
              onClick={onResetToMock}
              className={styles.resetBtn}
            >
              <RotateCcw size={12} /> Volver a datos demo
            </button>
          )}
        </div>
      </header>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>1. Plantillas</h2>
        <p className={styles.sectionHint}>
          Descarga una plantilla CSV con la estructura correcta antes de cargar
          tus datos.
        </p>
        <div className={styles.templateGrid}>
          {(Object.keys(ENTITY_LABELS) as EntityKind[]).map((entity) => (
            <button
              key={entity}
              type="button"
              className={styles.templateBtn}
              onClick={() =>
                downloadCsv(
                  `template-${entity}.csv`,
                  TEMPLATE_FNS[entity](),
                )
              }
            >
              <FileSpreadsheet size={16} />
              <span className={styles.templateLabel}>
                {ENTITY_LABELS[entity]}
              </span>
              <Download size={14} className={styles.templateDownload} />
            </button>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>2. Selecciona el tipo de datos</h2>
        <div className={styles.kindRow}>
          {(Object.keys(ENTITY_LABELS) as EntityKind[]).map((entity) => (
            <button
              key={entity}
              type="button"
              className={
                kind === entity
                  ? `${styles.kindPill} ${styles.kindPillActive}`
                  : styles.kindPill
              }
              onClick={() => {
                setKind(entity);
                setPreview(null);
                setSuccessMsg(null);
              }}
            >
              {ENTITY_LABELS[entity]}
            </button>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>3. Carga tu archivo CSV</h2>
        <div
          className={
            dragOver ? `${styles.dropzone} ${styles.dropzoneOver}` : styles.dropzone
          }
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
        >
          <Upload size={32} strokeWidth={1.4} />
          <p className={styles.dropzoneTitle}>
            Arrastra el archivo aquí o haz clic para seleccionar
          </p>
          <p className={styles.dropzoneHint}>
            Solo archivos .csv · {ENTITY_LABELS[kind]}
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            className={styles.fileInput}
            onChange={onSelectFile}
          />
          <button
            type="button"
            className={styles.selectBtn}
            onClick={() => fileInputRef.current?.click()}
          >
            Seleccionar archivo
          </button>
        </div>
      </section>

      {successMsg && (
        <div className={styles.successBanner}>
          <CheckCircle2 size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      {preview && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            4. Previsualización · {preview.fileName}
          </h2>

          {preview.result.errors.length > 0 && (
            <div className={styles.errorBlock}>
              <div className={styles.errorTitle}>
                <AlertCircle size={14} /> Validación: {preview.result.errors.length}{" "}
                {preview.result.errors.length === 1 ? "error" : "errores"}
              </div>
              <ul className={styles.errorList}>
                {preview.result.errors.slice(0, 10).map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
                {preview.result.errors.length > 10 && (
                  <li className={styles.errorMore}>
                    +{preview.result.errors.length - 10} errores más…
                  </li>
                )}
              </ul>
            </div>
          )}

          {previewRows.length > 0 ? (
            <>
              <div className={styles.previewMeta}>
                <span className={styles.previewCount}>
                  {preview.result.data.length} registros válidos · mostrando
                  los primeros {previewRows.length}
                </span>
              </div>
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      {previewColumns.map((c) => (
                        <th key={c}>{c}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewRows.map((row, i) => (
                      <tr key={i}>
                        {previewColumns.map((c) => (
                          <td key={c}>{String(row[c] ?? "")}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button
                type="button"
                className={styles.importBtn}
                onClick={commitImport}
              >
                Importar {preview.result.data.length} registros
              </button>
            </>
          ) : (
            <div className={styles.emptyPreview}>
              No hay registros válidos para importar.
            </div>
          )}
        </section>
      )}
    </div>
  );
}
