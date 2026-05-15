'use client';

import { useMemo } from 'react';
import { usePipelineStore } from '@/lib/stores/pipeline-store';
import type { SceneId } from './store';
import styles from './SceneDataOverlay.module.css';

interface Props {
  scene: SceneId;
}

function MiniTempChart() {
  const temperaturas = usePipelineStore((s) => s.temperaturas);

  const { points, peak, peakX, w, h } = useMemo(() => {
    const W = 380;
    const H = 120;
    const series = temperaturas
      .filter((t) => t.embarqueId === 'S-8842')
      .slice(0, 240); // ~5 days of readings
    if (series.length === 0) {
      return { points: '', peak: 0, peakX: 0, w: W, h: H };
    }
    const values = series.map((s) => s.valor);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = Math.max(0.5, max - min);
    const padY = 10;
    const padX = 4;
    const usableH = H - padY * 2;
    const usableW = W - padX * 2;

    const coords = values.map((v, i) => {
      const x = padX + (i / (values.length - 1)) * usableW;
      const y = padY + (1 - (v - min) / range) * usableH;
      return { x, y };
    });
    const pts = coords.map((c) => `${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ');

    const peakIdx = values.indexOf(max);
    const pxAtPeak = coords[peakIdx]?.x ?? 0;

    return { points: pts, peak: max, peakX: pxAtPeak, w: W, h: H };
  }, [temperaturas]);

  return (
    <svg className={styles.chart} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id="tempFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FF4444" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#FF4444" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <line
        x1="0"
        y1={h / 2}
        x2={w}
        y2={h / 2}
        stroke="rgba(255,255,255,0.08)"
        strokeDasharray="3 4"
      />
      {points ? (
        <>
          <polyline
            points={`${points} ${w},${h} 0,${h}`}
            fill="url(#tempFill)"
            stroke="none"
          />
          <polyline
            points={points}
            fill="none"
            stroke="#FF8C8C"
            strokeWidth="1.6"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <circle cx={peakX} cy={12} r="4" fill="#FF4444" />
          <line
            x1={peakX}
            y1={14}
            x2={peakX}
            y2={h - 8}
            stroke="rgba(255,68,68,0.45)"
            strokeDasharray="2 3"
          />
          <text
            x={Math.min(peakX + 8, w - 60)}
            y={14}
            fontSize="11"
            fill="#FFB3B3"
            fontWeight="700"
          >
            +{peak.toFixed(1)}°C
          </text>
        </>
      ) : null}
    </svg>
  );
}

export function SceneDataOverlay({ scene }: Props) {
  const kpis = usePipelineStore((s) => s.kpis);

  return (
    <div className={styles.host} aria-hidden>
      {scene === 1 ? (
        <div className={styles.kpiBar} key="kpi">
          {kpis.map((k) => (
            <div className={styles.kpiItem} key={k.id}>
              <span className={styles.kpiLabel}>{k.label}</span>
              <span className={styles.kpiValue}>{k.value}</span>
            </div>
          ))}
        </div>
      ) : null}

      {scene === 2 ? (
        <div className={styles.riskBadge} key="risk">
          <div className={styles.riskScore}>91/100</div>
          <div className={styles.riskLabel}>Riesgo Crítico · S-8842</div>
        </div>
      ) : null}

      {scene === 3 ? (
        <div className={styles.tempCard} key="temp">
          <div className={styles.tempTitle}>Curva de temperatura</div>
          <div className={styles.tempSubtitle}>S-8842 · 7 días de tránsito</div>
          <MiniTempChart />
          <div className={styles.tempLegend}>
            <span>Set-point: -0.5 °C</span>
            <span className={styles.tempPeak}>Excursión +5.8 °C · día 4</span>
          </div>
        </div>
      ) : null}

      {scene === 4 ? (
        <div className={styles.impactCard} key="impact">
          <div className={styles.impactLabel}>Impacto económico</div>
          <div className={styles.impactValue}>$85,000</div>
          <div className={styles.impactSub}>en riesgo de reclamo · Walmart US</div>
          <div className={styles.actionList}>
            <span className={styles.action}>Preparar evidencia y carpeta de defensa</span>
            <span className={styles.action}>Contactar al account manager</span>
            <span className={styles.action}>Respuesta comercial proactiva</span>
          </div>
        </div>
      ) : null}

      {scene === 5 ? (
        <div className={styles.tagline} key="tagline">
          <div className={styles.taglineEyebrow}>AgroVIA</div>
          <div className={styles.taglineText}>
            ¿Cuánto riesgo se pierde hoy entre planillas, sensores y correos?
          </div>
        </div>
      ) : null}
    </div>
  );
}
