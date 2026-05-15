'use client';

import {
  FileText,
  GitBranch,
  Radar,
  Thermometer,
  Waves,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { useUiStore } from '@/lib/stores/ui-store';
import type { LayerVisibility } from '@/lib/types';
import styles from './ConfigToggles.module.css';

interface LayerSpec {
  key: keyof LayerVisibility;
  label: string;
  color: string;
  Icon: LucideIcon;
}

const LAYERS: LayerSpec[] = [
  { key: 'flow', label: 'Flujo', color: '#1A5C3A', Icon: Waves },
  { key: 'temperatura', label: 'Temp', color: '#FF4444', Icon: Thermometer },
  { key: 'riesgo', label: 'Riesgo', color: '#FF8800', Icon: Zap },
  { key: 'documentos', label: 'Docs', color: '#D4A843', Icon: FileText },
  { key: 'senales', label: 'Señales', color: '#6B5CE7', Icon: Radar },
  { key: 'grafo', label: 'Grafo', color: '#4488FF', Icon: GitBranch },
];

export function ConfigToggles() {
  const layers = useUiStore((s) => s.layers);
  const toggleLayer = useUiStore((s) => s.toggleLayer);

  return (
    <div className={styles.wrap}>
      {LAYERS.map(({ key, label, color, Icon }) => {
        const active = layers[key];
        const style = active
          ? { background: color, borderColor: color }
          : { color };
        return (
          <button
            key={key}
            type="button"
            onClick={() => toggleLayer(key)}
            className={`${styles.pill} ${active ? styles.active : ''}`}
            style={style}
            aria-pressed={active}
          >
            <Icon size={13} />
            {label}
          </button>
        );
      })}
    </div>
  );
}
