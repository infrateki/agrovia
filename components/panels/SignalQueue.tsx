'use client';

import { useMemo } from 'react';
import { Radar } from 'lucide-react';
import { usePipelineStore } from '@/lib/stores/pipeline-store';
import type { BadgeVariant, SignalSource } from '@/lib/types';
import { Badge } from '@/components/ui/Badge';
import styles from './SignalQueue.module.css';

const SOURCE_LABEL: Record<SignalSource, string> = {
  internal: 'Interna',
  market: 'Mercado',
  client: 'Cliente',
  regulatory: 'Regulatorio',
};

const SOURCE_VARIANT: Record<SignalSource, BadgeVariant> = {
  internal: 'good',
  market: 'info',
  client: 'warn',
  regulatory: 'bad',
};

function scoreColor(score: number): string {
  if (score >= 80) return 'var(--color-alert-red)';
  if (score >= 65) return 'var(--color-alert-amber)';
  if (score >= 50) return 'var(--color-cold-blue)';
  return 'var(--color-text-secondary)';
}

export function SignalQueue() {
  const senales = usePipelineStore((s) => s.senales);

  const sorted = useMemo(
    () => [...senales].sort((a, b) => b.score - a.score),
    [senales],
  );

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div className={styles.title}>
          <Radar size={16} color="var(--color-signal-purple)" />
          Cola de señales activas
        </div>
        <span className={styles.count}>{sorted.length} señales</span>
      </div>

      <div className={styles.list}>
        {sorted.map((s) => (
          <div key={s.id} className={styles.card}>
            <div className={styles.score} style={{ color: scoreColor(s.score) }}>
              {s.score}
            </div>
            <div className={styles.body}>
              <span className={styles.titulo}>{s.titulo}</span>
              <span className={styles.descripcion}>{s.descripcion}</span>
              <div className={styles.footer}>
                <span className={styles.accion}>→ {s.accion}</span>
                <Badge
                  text={SOURCE_LABEL[s.fuente]}
                  variant={SOURCE_VARIANT[s.fuente]}
                  size="sm"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
