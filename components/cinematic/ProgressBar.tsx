'use client';

import { useCinematicStore, SCENE_START, TOTAL_DURATION_SEC, type SceneId } from './store';
import styles from './ProgressBar.module.css';

const SCENE_IDS: SceneId[] = [1, 2, 3, 4, 5];

function fmt(seconds: number) {
  const s = Math.max(0, Math.min(TOTAL_DURATION_SEC, Math.floor(seconds)));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, '0')}`;
}

export function ProgressBar() {
  const elapsed = useCinematicStore((s) => s.elapsed);
  const currentScene = useCinematicStore((s) => s.currentScene);
  const jumpToScene = useCinematicStore((s) => s.jumpToScene);
  const pct = Math.min(100, (elapsed / TOTAL_DURATION_SEC) * 100);

  return (
    <div className={styles.wrap}>
      <div className={styles.track}>
        <div className={styles.fill} style={{ width: `${pct}%` }} />
        <div className={styles.markers}>
          {SCENE_IDS.map((id) => {
            const left = (SCENE_START[id] / TOTAL_DURATION_SEC) * 100;
            const cls =
              id === currentScene
                ? `${styles.dot} ${styles.dotActive}`
                : id < currentScene
                  ? `${styles.dot} ${styles.dotPast}`
                  : styles.dot;
            return (
              <button
                key={id}
                type="button"
                className={cls}
                style={{ left: `${left}%` }}
                onClick={(e) => {
                  e.stopPropagation();
                  jumpToScene(id);
                }}
                aria-label={`Ir a escena ${id}`}
              />
            );
          })}
        </div>
        <span className={styles.timeLabel}>
          {fmt(elapsed)} / {fmt(TOTAL_DURATION_SEC)}
        </span>
      </div>
    </div>
  );
}
