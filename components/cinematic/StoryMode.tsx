'use client';

import { useEffect, useRef } from 'react';
import { Pause, Play, SkipForward, X } from 'lucide-react';
import { useSelectionStore } from '@/lib/stores/selection-store';
import { useUiStore } from '@/lib/stores/ui-store';
import { NarrationOverlay } from './NarrationOverlay';
import { ProgressBar } from './ProgressBar';
import { SceneDataOverlay } from './SceneDataOverlay';
import { SCENES } from './scenes';
import type { PipelineZone } from '@/lib/types';
import {
  TOTAL_DURATION_SEC,
  sceneFromElapsed,
  useCinematicStore,
} from './store';
import styles from './StoryMode.module.css';

interface AppliedBeats {
  lastZoneApplied: PipelineZone | null | undefined;
}

export function StoryMode() {
  const storyStatus = useCinematicStore((s) => s.storyStatus);
  const elapsed = useCinematicStore((s) => s.elapsed);
  const currentScene = useCinematicStore((s) => s.currentScene);
  const setElapsed = useCinematicStore((s) => s.setElapsed);
  const setScene = useCinematicStore((s) => s.setScene);
  const pauseStory = useCinematicStore((s) => s.pauseStory);
  const resumeStory = useCinematicStore((s) => s.resumeStory);
  const stopStory = useCinematicStore((s) => s.stopStory);
  const completeStory = useCinematicStore((s) => s.completeStory);
  const startStory = useCinematicStore((s) => s.startStory);

  const setCinematicMode = useUiStore((s) => s.setCinematicMode);
  const openDetail = useUiStore((s) => s.openDetail);
  const closeDetail = useUiStore((s) => s.closeDetail);
  const setActiveView = useUiStore((s) => s.setActiveView);
  const setSelectedZone = useSelectionStore((s) => s.setSelectedZone);

  const beatsRef = useRef<AppliedBeats>({ lastZoneApplied: undefined });
  const rafRef = useRef<number | null>(null);
  const prevTsRef = useRef<number | null>(null);

  const active = storyStatus !== 'idle';

  // Drive cinematicMode flag + dim class on <body>. Also jump to the 3D view
  // (grafo) so the demo plays full-bleed, and ensure the detail panel is closed
  // until a scripted beat opens it.
  useEffect(() => {
    if (!active) return;
    setCinematicMode(true);
    document.body.classList.add('story-mode-on');
    setActiveView('grafo');
    closeDetail();
    return () => {
      setCinematicMode(false);
      document.body.classList.remove('story-mode-on');
      closeDetail();
    };
  }, [active, setCinematicMode, setActiveView, closeDetail]);

  // Scene-driven shipment detail: scenes 2-4 are about S-8842. Open the
  // shipment panel via the store (no DOM touching), close on scene 5/idle.
  useEffect(() => {
    if (!active) return;
    if (currentScene >= 2 && currentScene <= 4) {
      // grafo view suppresses the panel; switch to frio so the panel renders
      // alongside the 3D detail of the cold chain scenes.
      setActiveView('frio');
      openDetail('S-8842');
    } else {
      closeDetail();
    }
  }, [active, currentScene, openDetail, closeDetail, setActiveView]);

  // Clock + scene resolution
  useEffect(() => {
    if (storyStatus !== 'running') {
      prevTsRef.current = null;
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      return;
    }

    function tick(ts: number) {
      const prev = prevTsRef.current;
      prevTsRef.current = ts;
      const next = useCinematicStore.getState().elapsed + (prev === null ? 0 : (ts - prev) / 1000);

      if (next >= TOTAL_DURATION_SEC) {
        useCinematicStore.getState().setElapsed(TOTAL_DURATION_SEC);
        useCinematicStore.getState().setScene(5);
        useCinematicStore.getState().completeStory();
        return;
      }

      useCinematicStore.getState().setElapsed(next);
      const scene = sceneFromElapsed(next);
      if (scene !== useCinematicStore.getState().currentScene) {
        useCinematicStore.getState().setScene(scene);
      }
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [storyStatus]);

  // Apply scene beats (camera target via setSelectedZone)
  useEffect(() => {
    if (!active) {
      beatsRef.current.lastZoneApplied = undefined;
      return;
    }
    // Find latest beat <= elapsed across all scenes
    const all = SCENES.flatMap((s) => s.beats);
    let latest = all[0];
    for (const b of all) {
      if (b.at <= elapsed) latest = b;
    }
    if (latest && latest.zone !== beatsRef.current.lastZoneApplied) {
      beatsRef.current.lastZoneApplied = latest.zone;
      setSelectedZone(latest.zone);
    }
  }, [elapsed, active, setSelectedZone]);

  // Reset selected zone when story ends/exits
  useEffect(() => {
    if (storyStatus === 'idle') {
      setSelectedZone(null);
      beatsRef.current.lastZoneApplied = undefined;
    }
  }, [storyStatus, setSelectedZone]);

  // Keyboard: Escape exits
  useEffect(() => {
    if (!active) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        stopStory();
      }
      if (e.code === 'Space') {
        e.preventDefault();
        const st = useCinematicStore.getState().storyStatus;
        if (st === 'running') pauseStory();
        else if (st === 'paused') resumeStory();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, pauseStory, resumeStory, stopStory]);

  if (!active) return null;

  function onBackdropClick() {
    if (storyStatus === 'running') pauseStory();
    else if (storyStatus === 'paused') resumeStory();
  }

  function onSkip(e: React.MouseEvent) {
    e.stopPropagation();
    stopStory();
  }

  function onTogglePlay(e: React.MouseEvent) {
    e.stopPropagation();
    if (storyStatus === 'running') pauseStory();
    else if (storyStatus === 'paused') resumeStory();
  }

  function onNextScene(e: React.MouseEvent) {
    e.stopPropagation();
    const next = Math.min(5, currentScene + 1);
    useCinematicStore.getState().jumpToScene(next as 1 | 2 | 3 | 4 | 5);
  }

  if (storyStatus === 'complete') {
    return (
      <div className={styles.completeOverlay}>
        <span className={styles.completeTitle}>Demo guiada · AgroVIA</span>
        <h2 className={styles.completeHeadline}>
          De datos dispersos a decisiones, en 60 segundos.
        </h2>
        <p className={styles.completeSub}>
          Esta es la promesa operativa: un solo lugar donde el equipo ve, entiende y actúa
          sobre el riesgo postcosecha.
        </p>
        <div className={styles.completeActions}>
          <button type="button" className={styles.completePrimary} onClick={() => startStory()}>
            Repetir demo
          </button>
          <button type="button" className={styles.btn} onClick={() => stopStory()}>
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.root} onClick={onBackdropClick}>
      <div className={styles.controls}>
        <button type="button" className={styles.btn} onClick={onTogglePlay}>
          {storyStatus === 'running' ? <Pause size={14} /> : <Play size={14} />}
          {storyStatus === 'running' ? 'Pausar' : 'Reanudar'}
        </button>
        <button type="button" className={styles.btn} onClick={onNextScene}>
          <SkipForward size={14} />
          Siguiente escena
        </button>
        <button type="button" className={styles.btn} onClick={onSkip}>
          <X size={14} />
          Saltar demo
        </button>
      </div>

      <SceneDataOverlay scene={currentScene} />
      <NarrationOverlay scene={currentScene} />
      <ProgressBar />

      {storyStatus === 'paused' ? (
        <div className={styles.pausedBanner}>En pausa · clic para reanudar</div>
      ) : null}
    </div>
  );
}
