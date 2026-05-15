'use client';

import { MonitorPlay, Play, ClipboardList } from 'lucide-react';
import { useCinematicStore } from './store';
import styles from './DemoFAB.module.css';

export function DemoFAB() {
  const storyStatus = useCinematicStore((s) => s.storyStatus);
  const presentationMode = useCinematicStore((s) => s.presentationMode);
  const scriptOpen = useCinematicStore((s) => s.scriptOpen);
  const startStory = useCinematicStore((s) => s.startStory);
  const togglePresentationMode = useCinematicStore((s) => s.togglePresentationMode);
  const toggleScript = useCinematicStore((s) => s.toggleScript);

  // Hide the FAB while the story is running — its own controls take over
  if (storyStatus !== 'idle') return null;

  return (
    <div className={styles.fab}>
      <button type="button" className={styles.primary} onClick={() => startStory()}>
        <Play size={14} />
        Demo guiada
        <span className={styles.kbd}>F5</span>
      </button>
      <button
        type="button"
        className={`${styles.secondary} ${presentationMode ? styles.secondaryActive : ''}`}
        onClick={() => togglePresentationMode()}
        aria-pressed={presentationMode}
      >
        <MonitorPlay size={13} />
        Presentación
        <span className={styles.kbd}>F8</span>
      </button>
      <button
        type="button"
        className={`${styles.secondary} ${scriptOpen ? styles.secondaryActive : ''}`}
        onClick={() => toggleScript()}
        aria-pressed={scriptOpen}
      >
        <ClipboardList size={13} />
        Guion
        <span className={styles.kbd}>Ctrl+Shift+D</span>
      </button>
    </div>
  );
}
