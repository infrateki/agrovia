"use client";

import { useState, type CSSProperties } from "react";
import { Play, Pause, FastForward, Square } from "lucide-react";
import { useUiStore } from "@/lib/stores/ui-store";
import { cn } from "@/lib/utils";
import styles from "./BottomBar.module.css";

type ViewMode = "pipeline" | "zone" | "object";

const VIEW_MODES: { id: ViewMode; label: string }[] = [
  { id: "pipeline", label: "Pipeline" },
  { id: "zone", label: "Zona" },
  { id: "object", label: "Objeto" },
];

interface ConfigLayer {
  id: string;
  label: string;
  color: string;
}

const CONFIG_LAYERS: ConfigLayer[] = [
  { id: "flow", label: "Flujo", color: "var(--color-accent-green-light)" },
  { id: "temp", label: "Temp", color: "var(--color-alert-red)" },
  { id: "risk", label: "Riesgo", color: "var(--color-alert-amber)" },
  { id: "docs", label: "Docs", color: "var(--color-accent-gold)" },
  { id: "signals", label: "Señales", color: "var(--color-signal-purple)" },
  { id: "graph", label: "Grafo", color: "var(--color-cold-blue)" },
];

const DEFAULT_LAYERS: Record<string, boolean> = {
  flow: true,
  temp: true,
  risk: true,
  docs: false,
  signals: true,
  graph: false,
};

function activeStyle(color: string): CSSProperties {
  return {
    background: color,
    borderColor: color,
  };
}

function minutesToHHMM(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

export function BottomBar() {
  const [time, setTime] = useState(720);
  const [mode, setMode] = useState<ViewMode>("pipeline");
  const [layers, setLayers] = useState<Record<string, boolean>>(DEFAULT_LAYERS);
  const cinematicMode = useUiStore((s) => s.cinematicMode);
  const setCinematicMode = useUiStore((s) => s.setCinematicMode);

  const toggleLayer = (id: string) => {
    setLayers((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className={styles.bottombar}>
      <section className={cn(styles.section, styles.sectionTimeline)}>
        <span className={styles.label}>Timeline</span>
        <div className={styles.timelineRow}>
          <span className={styles.timelineLabel}>00:00</span>
          <input
            type="range"
            min={0}
            max={1439}
            value={time}
            onChange={(e) => setTime(Number(e.target.value))}
            className={styles.timelineSlider}
            aria-label={`Tiempo ${minutesToHHMM(time)}`}
          />
          <span className={styles.timelineLabel}>23:59</span>
        </div>
      </section>

      <section className={cn(styles.section, styles.sectionMode)}>
        <span className={styles.label}>Mode</span>
        <div className={styles.pillRow}>
          {VIEW_MODES.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              className={cn(styles.modePill, mode === id && styles.modePillActive)}
              onClick={() => setMode(id)}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      <section className={cn(styles.section, styles.sectionSim)}>
        <span className={styles.label}>Sim</span>
        <div className={styles.simRow}>
          <button
            type="button"
            className={cn(styles.simBtn, cinematicMode && styles.simBtnActive)}
            aria-label={cinematicMode ? "Pausar tour cinemático" : "Reproducir tour cinemático"}
            aria-pressed={cinematicMode}
            onClick={() => setCinematicMode(!cinematicMode)}
          >
            {cinematicMode ? <Pause size={12} strokeWidth={2} /> : <Play size={12} strokeWidth={2} />}
          </button>
          <button type="button" className={styles.simBtn} aria-label="Pausar" disabled>
            <Pause size={12} strokeWidth={2} />
          </button>
          <button type="button" className={styles.simBtn} aria-label="Avanzar" disabled>
            <FastForward size={12} strokeWidth={2} />
          </button>
          <button
            type="button"
            className={styles.simBtn}
            aria-label="Detener tour cinemático"
            onClick={() => setCinematicMode(false)}
          >
            <Square size={12} strokeWidth={2} />
          </button>
        </div>
      </section>

      <section className={cn(styles.section, styles.sectionReadout)}>
        <span className={styles.label}>Readout</span>
        <div className={styles.readoutRow}>
          <span className={cn(styles.kpi, styles.kpiRed)}>$1.84M</span>
          <span className={cn(styles.kpi, styles.kpiAmber)}>428</span>
          <span className={cn(styles.kpi, styles.kpiGreen)}>$312K</span>
          <span className={cn(styles.kpi, styles.kpiGreen)}>78/100</span>
        </div>
      </section>

      <section className={cn(styles.section, styles.sectionConfig)}>
        <span className={styles.label}>Config</span>
        <div className={styles.configRow}>
          {CONFIG_LAYERS.map(({ id, label, color }) => {
            const active = layers[id];
            return (
              <button
                key={id}
                type="button"
                className={cn(styles.configToggle, active && styles.configToggleActive)}
                onClick={() => toggleLayer(id)}
                style={active ? activeStyle(color) : undefined}
                aria-pressed={active}
              >
                {label}
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
