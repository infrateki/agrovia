'use client';

import { useEffect, useId, useMemo, useState } from 'react';
import type { GaugeColorZones } from '@/lib/types';
import styles from './CircularGauge.module.css';

interface Props {
  value: number;
  min: number;
  max: number;
  target?: number;
  label: string;
  unit: string;
  size?: 'sm' | 'md' | 'lg';
  colorZones?: GaugeColorZones;
  invertZones?: boolean;
  className?: string;
}

// 270° sweep, starting at 7 o'clock (135° in SVG space, going clockwise).
// We draw on a 200×200 viewBox, center (100,100), radius 80.
const VB = 200;
const CENTER = 100;
const RADIUS = 80;
const START_ANGLE = 135; // 7 o'clock, SVG degrees clockwise from +x axis
const SWEEP = 270;

const SIZE_MAP: Record<NonNullable<Props['size']>, number> = {
  sm: 120,
  md: 160,
  lg: 200,
};

const DEFAULT_ZONES: GaugeColorZones = {
  green: [0, 60],
  amber: [60, 85],
  red: [85, 100],
};

function polar(angleDeg: number, r: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: CENTER + r * Math.cos(rad), y: CENTER + r * Math.sin(rad) };
}

function arcPath(startDeg: number, endDeg: number, r: number) {
  const start = polar(startDeg, r);
  const end = polar(endDeg, r);
  const largeArc = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

function colorFor(
  pct: number,
  zones: GaugeColorZones,
  invert: boolean,
): string {
  const greenC = 'var(--color-accent-green-light)';
  const amberC = 'var(--color-alert-amber)';
  const redC = 'var(--color-alert-red)';
  const greenStop = invert ? redC : greenC;
  const redStop = invert ? greenC : redC;
  const value = pct * 100;
  if (value <= zones.green[1]) return greenStop;
  if (value <= zones.amber[1]) return amberC;
  if (value <= zones.red[1]) return redStop;
  return redStop;
}

export function CircularGauge({
  value,
  min,
  max,
  target,
  label,
  unit,
  size = 'md',
  colorZones = DEFAULT_ZONES,
  invertZones = false,
  className,
}: Props) {
  const px = SIZE_MAP[size];
  const uid = useId();
  const range = max - min || 1;

  // Mount animation: from min sweep to actual
  const [displayValue, setDisplayValue] = useState(min);
  useEffect(() => {
    const id = requestAnimationFrame(() => setDisplayValue(value));
    return () => cancelAnimationFrame(id);
  }, [value]);

  const pct = clamp((displayValue - min) / range, 0, 1);

  const bgArc = useMemo(
    () => arcPath(START_ANGLE, START_ANGLE + SWEEP, RADIUS),
    [],
  );

  const arcColor = colorFor(pct, colorZones, invertZones);

  const targetAngle =
    typeof target === 'number'
      ? START_ANGLE + clamp((target - min) / range, 0, 1) * SWEEP
      : null;

  const ticks = useMemo(() => {
    const out: { angle: number; label: string }[] = [];
    for (let i = 0; i < 5; i++) {
      const t = i / 4;
      const angle = START_ANGLE + t * SWEEP;
      const v = min + t * range;
      out.push({
        angle,
        label: Number.isFinite(v)
          ? Math.abs(v) >= 100
            ? v.toFixed(0)
            : v.toFixed(1).replace(/\.0$/, '')
          : '',
      });
    }
    return out;
  }, [min, range]);

  // Compute path length for stroke-dasharray animation
  // For 270° arc with r=80, length = 270/360 * 2 * π * 80 ≈ 376.99
  const fullLen = (SWEEP / 360) * 2 * Math.PI * RADIUS;
  const valueLen = pct * fullLen;

  return (
    <div
      className={[styles.root, styles[size], className]
        .filter(Boolean)
        .join(' ')}
      style={{ width: px }}
    >
      <div className={styles.svgWrap}>
        <svg
          viewBox={`0 0 ${VB} ${VB}`}
          width={px}
          height={px}
          role="img"
          aria-label={`${label}: ${displayValue.toFixed(1)} ${unit}`}
        >
          {/* Outer thin ring */}
          <circle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS + 8}
            fill="none"
            stroke="rgba(255,255,255,0.04)"
            strokeWidth="1"
          />
          {/* Background arc */}
          <path
            d={bgArc}
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="10"
            fill="none"
            strokeLinecap="round"
          />
          {/* Value arc — animated via stroke-dasharray */}
          <path
            d={bgArc}
            stroke={arcColor}
            strokeWidth="10"
            fill="none"
            strokeLinecap="round"
            style={{
              strokeDasharray: `${fullLen} ${fullLen}`,
              strokeDashoffset: fullLen - valueLen,
              transition: 'stroke-dashoffset 1s ease-out, stroke 0.4s ease',
              filter: `drop-shadow(0 0 6px ${arcColor})`,
            }}
          />

          {/* Tick marks */}
          {ticks.map((t, i) => {
            const inner = polar(t.angle, RADIUS - 14);
            const outer = polar(t.angle, RADIUS - 4);
            const tlabel = polar(t.angle, RADIUS - 24);
            return (
              <g key={`${uid}-tick-${i}`}>
                <line
                  x1={inner.x}
                  y1={inner.y}
                  x2={outer.x}
                  y2={outer.y}
                  stroke="rgba(255,255,255,0.32)"
                  strokeWidth="1.2"
                />
                <text
                  x={tlabel.x}
                  y={tlabel.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="9"
                  fill="rgba(255,255,255,0.45)"
                >
                  {t.label}
                </text>
              </g>
            );
          })}

          {/* Target marker */}
          {targetAngle !== null
            ? (() => {
                const p = polar(targetAngle, RADIUS);
                const inner = polar(targetAngle, RADIUS - 12);
                return (
                  <g>
                    <line
                      x1={inner.x}
                      y1={inner.y}
                      x2={p.x}
                      y2={p.y}
                      stroke="#fff"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <circle cx={p.x} cy={p.y} r="3" fill="#fff" />
                  </g>
                );
              })()
            : null}

          {/* Center text */}
          <text
            x={CENTER}
            y={CENTER - 4}
            textAnchor="middle"
            dominantBaseline="middle"
            className={styles.centerValue}
            fontWeight="700"
          >
            {displayValue.toFixed(displayValue % 1 === 0 ? 0 : 1)}
          </text>
          <text
            x={CENTER}
            y={CENTER + 18}
            textAnchor="middle"
            dominantBaseline="middle"
            className={styles.centerUnit}
          >
            {unit}
          </text>
        </svg>
      </div>
      <p className={styles.label}>{label}</p>
    </div>
  );
}
