'use client';

import { useEffect } from 'react';
import { DemoFAB } from './DemoFAB';
import { DemoScript } from './DemoScript';
import { PresentationMode } from './PresentationMode';
import { StoryMode } from './StoryMode';
import { useCinematicStore } from './store';

export function CinematicProvider() {
  const startStory = useCinematicStore((s) => s.startStory);
  const stopStory = useCinematicStore((s) => s.stopStory);
  const togglePresentationMode = useCinematicStore((s) => s.togglePresentationMode);
  const setPresentationMode = useCinematicStore((s) => s.setPresentationMode);

  // URL query params: ?demo=true auto-starts story; ?present=true enables presentation
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('present') === 'true') setPresentationMode(true);
    if (params.get('demo') === 'true') {
      // small delay so the 3D scene has a chance to mount before camera moves
      const t = window.setTimeout(() => startStory(), 600);
      return () => window.clearTimeout(t);
    }
  }, [setPresentationMode, startStory]);

  // Global keyboard shortcuts: F5 story, F8 presentation, Escape exits
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      // F5 — start story (don't preventDefault outside of focused app contexts to avoid
      // surprising refresh behavior; but here we explicitly take over since this is a demo app)
      if (e.key === 'F5') {
        e.preventDefault();
        const status = useCinematicStore.getState().storyStatus;
        if (status === 'idle') startStory();
      }
      if (e.key === 'F8') {
        e.preventDefault();
        togglePresentationMode();
      }
      if (e.key === 'Escape') {
        const state = useCinematicStore.getState();
        if (state.storyStatus !== 'idle') {
          stopStory();
        } else if (state.presentationMode) {
          setPresentationMode(false);
        } else if (state.scriptOpen) {
          state.setScriptOpen(false);
        }
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [startStory, stopStory, togglePresentationMode, setPresentationMode]);

  return (
    <>
      <PresentationMode />
      <DemoScript />
      <StoryMode />
      <DemoFAB />
    </>
  );
}
