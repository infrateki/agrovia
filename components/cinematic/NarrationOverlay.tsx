'use client';

import { SCENES } from './scenes';
import type { SceneId } from './store';
import styles from './NarrationOverlay.module.css';

interface Props {
  scene: SceneId;
}

export function NarrationOverlay({ scene }: Props) {
  const def = SCENES.find((s) => s.id === scene);
  if (!def) return null;
  return (
    <div className={styles.wrap}>
      <div className={styles.bubble} key={scene}>
        <div className={styles.eyebrow}>
          Escena {scene} · {def.title}
        </div>
        <p className={styles.text}>{def.narration}</p>
      </div>
    </div>
  );
}
