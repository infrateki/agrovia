'use client';

import { useEffect, useRef } from 'react';
import { ClipboardList, X } from 'lucide-react';
import { SCENES, TALKING_POINTS } from './scenes';
import { useCinematicStore, type SceneId } from './store';
import styles from './DemoScript.module.css';

function fmt(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function DemoScript() {
  const scriptOpen = useCinematicStore((s) => s.scriptOpen);
  const setScriptOpen = useCinematicStore((s) => s.setScriptOpen);
  const toggleScript = useCinematicStore((s) => s.toggleScript);
  const currentScene = useCinematicStore((s) => s.currentScene);
  const storyStatus = useCinematicStore((s) => s.storyStatus);
  const jumpToScene = useCinematicStore((s) => s.jumpToScene);
  const bodyRef = useRef<HTMLDivElement | null>(null);

  // Ctrl+Shift+D toggle
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.ctrlKey && e.shiftKey && (e.key === 'D' || e.key === 'd')) {
        e.preventDefault();
        toggleScript();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toggleScript]);

  // Auto-scroll the active scene into view
  useEffect(() => {
    if (!scriptOpen) return;
    const el = bodyRef.current?.querySelector<HTMLElement>(`[data-scene="${currentScene}"]`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [scriptOpen, currentScene]);

  if (!scriptOpen) return null;

  return (
    <aside className={styles.panel} aria-label="Guion del demo">
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <ClipboardList size={16} color="var(--color-accent-gold)" />
          <span className={styles.title}>Guion del demo</span>
          <span className={styles.hint}>Ctrl + Shift + D</span>
        </div>
        <button
          type="button"
          className={styles.close}
          onClick={() => setScriptOpen(false)}
          aria-label="Cerrar guion"
        >
          <X size={14} />
        </button>
      </div>

      <div className={styles.body} ref={bodyRef}>
        {SCENES.map((s) => {
          const active = storyStatus !== 'idle' && currentScene === s.id;
          return (
            <div
              key={s.id}
              data-scene={s.id}
              className={`${styles.scene} ${active ? styles.sceneActive : ''}`}
              onClick={() => jumpToScene(s.id as SceneId)}
              role="button"
              tabIndex={0}
            >
              <div className={styles.sceneHead}>
                <span className={styles.sceneName}>
                  {s.id}. {s.title}
                </span>
                <span className={styles.sceneTime}>
                  {fmt(s.startSec)} → {fmt(s.endSec)}
                </span>
              </div>
              <p className={styles.narration}>&ldquo;{s.narration}&rdquo;</p>
              <div className={styles.points}>
                {TALKING_POINTS[s.id].map((p) => (
                  <span className={styles.point} key={p}>
                    {p}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
