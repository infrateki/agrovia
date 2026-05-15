'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { useUiStore } from '@/lib/stores/ui-store';
import { useSelectionStore } from '@/lib/stores/selection-store';
import { ZONE_CONFIGS } from '@/lib/constants';
import { SceneManager } from './SceneManager';
import { CameraSystem } from './systems/CameraSystem';
import { ParticleFlow } from './systems/ParticleFlow';
import { SelectionSystem } from './systems/SelectionSystem';
import { LabelSystem } from './systems/LabelSystem';
import { RiskGlow } from './systems/RiskGlow';
import { CinematicMode } from './systems/CinematicMode';
import styles from './PipelineCanvas.module.css';

export function PipelineCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // Renderer (HDR-friendly: ACES tone mapping + softer VSM shadows)
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    });
    const pixelRatio = Math.min(window.devicePixelRatio, 2);
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.VSMShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.domElement.classList.add(styles.canvas);
    container.appendChild(renderer.domElement);

    // Scene + systems
    const sceneManager = new SceneManager();

    // Image-Based Lighting via PMREM RoomEnvironment — generates a 256×256
    // pre-filtered cubemap from a synthetic studio room and assigns it to
    // scene.environment. Every PBR material with metalness > 0 immediately
    // gets realistic reflections; matte materials get free ambient fill.
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();
    const roomEnv = new RoomEnvironment();
    const envMap = pmremGenerator.fromScene(roomEnv, 0.04).texture;
    sceneManager.scene.environment = envMap;
    sceneManager.scene.environmentIntensity = 0.35;

    const cameraSystem = new CameraSystem(width, height, renderer.domElement);
    const particleFlow = new ParticleFlow(pixelRatio);
    sceneManager.scene.add(particleFlow.points);

    const riskGlow = new RiskGlow();
    sceneManager.scene.add(riskGlow);

    const labelSystem = new LabelSystem(container, width, height);
    labelSystem.addToScene(sceneManager.scene);

    // Post-processing: HDR composer + selective bloom on emissives.
    // HalfFloat target preserves >1.0 luminance from emissive materials so
    // the bloom pass can lift them above threshold cleanly.
    const composer = new EffectComposer(
      renderer,
      new THREE.WebGLRenderTarget(width, height, {
        type: THREE.HalfFloatType,
        samples: 4,
        colorSpace: THREE.LinearSRGBColorSpace,
      }),
    );
    composer.setPixelRatio(pixelRatio);
    composer.setSize(width, height);
    composer.addPass(new RenderPass(sceneManager.scene, cameraSystem.camera));
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(width, height),
      0.28, // strength  (lowered again — floor specular was hitting threshold)
      0.18, // radius    (tight, no cross-screen smear)
      1.5,  // threshold (only TRUE emissives >1.5 linear: LEDs, GPS, sensors)
    );
    composer.addPass(bloomPass);
    composer.addPass(new OutputPass());

    const selectionSystem = new SelectionSystem(
      renderer.domElement,
      sceneManager.getAllZones(),
      cameraSystem,
    );

    const cinematic = new CinematicMode(cameraSystem);

    // Initial layer visibility from store
    const initialLayers = useUiStore.getState().layers;
    particleFlow.setVisible(initialLayers.flow);
    riskGlow.setVisible(initialLayers.riesgo);

    // Subscribe to layer visibility changes + cinematic toggle
    const unsubLayers = useUiStore.subscribe((state, prev) => {
      if (state.layers !== prev.layers) {
        particleFlow.setVisible(state.layers.flow);
        riskGlow.setVisible(state.layers.riesgo);
      }
      if (state.viewMode !== prev.viewMode) {
        labelSystem.setViewMode(state.viewMode);
      }
      if (state.cinematicMode !== prev.cinematicMode) {
        if (state.cinematicMode && !cinematic.isPlaying()) {
          cinematic.start();
        } else if (!state.cinematicMode && cinematic.isPlaying()) {
          cinematic.stop();
        }
      }
    });

    // Subscribe to selection changes -> camera transitions
    const unsubSelection = useSelectionStore.subscribe((state, prev) => {
      if (state.selectedZone !== prev.selectedZone) {
        if (state.selectedZone) {
          const cfg = ZONE_CONFIGS.find((z) => z.id === state.selectedZone);
          if (cfg) {
            useUiStore.getState().setViewMode('zone');
            cameraSystem.transitionToZone(cfg);
            for (const z of sceneManager.getAllZones()) {
              z.setHighlight(z.userData.zoneId === state.selectedZone);
            }
          }
        } else {
          useUiStore.getState().setViewMode('pipeline');
          cameraSystem.resetToOverview();
          for (const z of sceneManager.getAllZones()) {
            z.setHighlight(false);
          }
        }
      }
    });

    // Initialize labels' view mode
    labelSystem.setViewMode(useUiStore.getState().viewMode);

    // Resize
    const handleResize = () => {
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      renderer.setSize(w, h);
      composer.setSize(w, h);
      bloomPass.setSize(w, h);
      cameraSystem.resize(w, h);
      labelSystem.resize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Animation loop
    const clock = new THREE.Clock();
    let rafId = 0;
    let running = true;

    // Dev-only performance probe (logs renderer.info once after warmup)
    let perfLogged = false;
    const perfWarmupSec = 2;
    let perfElapsed = 0;

    const tick = () => {
      if (!running) return;
      const delta = clock.getDelta();
      sceneManager.update(delta);
      particleFlow.update(delta);
      riskGlow.update(delta);
      cameraSystem.update();
      selectionSystem.update();
      composer.render(delta);
      labelSystem.render(sceneManager.scene, cameraSystem.camera);

      if (!perfLogged && process.env.NODE_ENV !== 'production') {
        perfElapsed += delta;
        if (perfElapsed >= perfWarmupSec) {
          perfLogged = true;
          const info = renderer.info;
          console.log('[PipelineCanvas] renderer.info', {
            triangles: info.render.triangles,
            calls: info.render.calls,
            geometries: info.memory.geometries,
            textures: info.memory.textures,
          });
        }
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    return () => {
      running = false;
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', handleResize);
      unsubLayers();
      unsubSelection();
      cinematic.dispose();
      selectionSystem.dispose();
      labelSystem.dispose();
      particleFlow.dispose();
      riskGlow.dispose();
      cameraSystem.dispose();
      sceneManager.dispose();
      composer.dispose();
      pmremGenerator.dispose();
      envMap.dispose();
      if (renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return <div ref={containerRef} className={styles.root} />;
}
