'use client';

import { useEffect } from 'react';
import { useCinematicStore } from './store';
import styles from './PresentationMode.module.css';

const LEGEND = [
  { color: '#1A5C3A', label: 'Verde · Flujo normal / Sin riesgo' },
  { color: '#FF8800', label: 'Ámbar · Advertencia / Riesgo moderado' },
  { color: '#FF4444', label: 'Rojo · Alerta / Riesgo alto' },
  { color: '#4488FF', label: 'Azul · Temperatura / Cadena de frío' },
  { color: '#6B5CE7', label: 'Púrpura · Señales de mercado' },
  { color: '#D4A843', label: 'Dorado · Documentos / Valor monetario' },
];

export function PresentationMode() {
  const presentationMode = useCinematicStore((s) => s.presentationMode);

  useEffect(() => {
    if (presentationMode) {
      document.body.classList.add('presentation-mode-on');
    } else {
      document.body.classList.remove('presentation-mode-on');
    }
    return () => {
      document.body.classList.remove('presentation-mode-on');
    };
  }, [presentationMode]);

  if (!presentationMode) return null;

  return (
    <>
      <div className={styles.legend} aria-label="Leyenda de colores">
        <span className={styles.legendTitle}>Leyenda de colores</span>
        {LEGEND.map((row) => (
          <div className={styles.legendRow} key={row.label}>
            <span className={styles.swatch} style={{ background: row.color, color: row.color }} />
            <span>{row.label}</span>
          </div>
        ))}
      </div>
      <div className={styles.watermark}>Datos de demostración</div>
    </>
  );
}
