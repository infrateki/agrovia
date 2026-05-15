'use client';

import styles from './VarietySelector.module.css';

interface Props {
  selected: string;
  onChange: (v: string) => void;
  options?: string[];
}

const DEFAULT_OPTIONS = [
  'Todos',
  'Arándano',
  'Uva',
  'Palta',
  'Mango',
  'Cítricos',
];

const VARIETY_COLORS: Record<string, string> = {
  Todos: '#8B949E',
  Arándano: '#6B21A8',
  Uva: '#2D6B30',
  Palta: '#1A5C3A',
  Mango: '#D4A843',
  Cítricos: '#FF8800',
};

export function VarietySelector({
  selected,
  onChange,
  options = DEFAULT_OPTIONS,
}: Props) {
  return (
    <div className={styles.root} role="radiogroup">
      {options.map((opt) => {
        const color = VARIETY_COLORS[opt] ?? 'var(--color-accent-green-light)';
        const active = selected === opt;
        return (
          <button
            key={opt}
            type="button"
            role="radio"
            aria-checked={active}
            className={[styles.pill, active ? styles.active : ''].join(' ')}
            style={
              active
                ? {
                    background: color,
                    borderColor: color,
                    color: '#fff',
                  }
                : {
                    borderColor: color,
                    color,
                  }
            }
            onClick={() => onChange(opt)}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}
