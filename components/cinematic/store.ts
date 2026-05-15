'use client';

import { create } from 'zustand';

export type SceneId = 1 | 2 | 3 | 4 | 5;
export type StoryStatus = 'idle' | 'running' | 'paused' | 'complete';

interface CinematicState {
  // Story Mode
  storyStatus: StoryStatus;
  currentScene: SceneId;
  elapsed: number; // seconds within the full timeline
  startStory: () => void;
  pauseStory: () => void;
  resumeStory: () => void;
  stopStory: () => void;
  jumpToScene: (scene: SceneId) => void;
  setElapsed: (seconds: number) => void;
  setScene: (scene: SceneId) => void;
  completeStory: () => void;

  // Presentation Mode
  presentationMode: boolean;
  setPresentationMode: (on: boolean) => void;
  togglePresentationMode: () => void;

  // Demo Script teleprompter
  scriptOpen: boolean;
  toggleScript: () => void;
  setScriptOpen: (open: boolean) => void;
}

export const useCinematicStore = create<CinematicState>((set) => ({
  storyStatus: 'idle',
  currentScene: 1,
  elapsed: 0,
  startStory: () =>
    set({ storyStatus: 'running', currentScene: 1, elapsed: 0 }),
  pauseStory: () => set({ storyStatus: 'paused' }),
  resumeStory: () => set({ storyStatus: 'running' }),
  stopStory: () =>
    set({ storyStatus: 'idle', currentScene: 1, elapsed: 0 }),
  jumpToScene: (scene) =>
    set({ currentScene: scene, elapsed: SCENE_START[scene], storyStatus: 'running' }),
  setElapsed: (seconds) => set({ elapsed: seconds }),
  setScene: (scene) => set({ currentScene: scene }),
  completeStory: () => set({ storyStatus: 'complete' }),

  presentationMode: false,
  setPresentationMode: (on) => set({ presentationMode: on }),
  togglePresentationMode: () =>
    set((s) => ({ presentationMode: !s.presentationMode })),

  scriptOpen: false,
  toggleScript: () => set((s) => ({ scriptOpen: !s.scriptOpen })),
  setScriptOpen: (open) => set({ scriptOpen: open }),
}));

export const TOTAL_DURATION_SEC = 90;

export const SCENE_START: Record<SceneId, number> = {
  1: 0,
  2: 18,
  3: 36,
  4: 54,
  5: 72,
};

export const SCENE_END: Record<SceneId, number> = {
  1: 18,
  2: 36,
  3: 54,
  4: 72,
  5: 90,
};

export function sceneFromElapsed(elapsed: number): SceneId {
  if (elapsed < SCENE_END[1]) return 1;
  if (elapsed < SCENE_END[2]) return 2;
  if (elapsed < SCENE_END[3]) return 3;
  if (elapsed < SCENE_END[4]) return 4;
  return 5;
}
