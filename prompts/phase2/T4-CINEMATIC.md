Read COMMS.md and CLAUDE.md. You are T4 — Cinematic Story Mode owner for Phase 2.

Your job is to create a guided 90-second demo experience that tells a compelling story, plus a presentation mode optimized for Zoom demos with bigger typography and higher contrast. This is what makes clients lean forward.

### Component 1: Story Mode

**`components/cinematic/StoryMode.tsx`** ('use client')

A full-screen overlay that orchestrates a 5-scene guided demo. When activated, it:
1. Dims the UI (sidebar, bottom bar fade to 20% opacity)
2. Shows narration text overlays on the 3D scene
3. Controls the camera to move between zones
4. Highlights relevant data at each story beat
5. Ends with a call-to-action

**The 5 Scenes** (each with narration overlay text + camera position + data highlight):

```
Scene 1: CONTEXTO (0:00 — 0:18)
Camera: Pipeline overview, slowly dollying in
Narration: "Esta es la operación postcosecha completa de una agroexportadora peruana. Cada zona —desde la cosecha hasta el punto de venta— genera datos que hoy viven dispersos en planillas, sensores, correos y WhatsApp."
Highlight: All zones glow subtly in sequence left→right
Data: Show total KPIs fading in at bottom

Scene 2: ALERTA (0:18 — 0:36)
Camera: Smooth transition to Zone Frío, then to Zone Tránsito
Narration: "El sistema detecta que el embarque S-8842 —arándanos a Estados Unidos— muestra convergencia de riesgo: excursión de temperatura, tránsito largo y patrón histórico de reclamos del cliente."
Highlight: Zone Frío pulses red, then Zone Tránsito pulses red
Data: Risk badge "91/100" appears floating near the zones

Scene 3: INSPECCIÓN (0:36 — 0:54)
Camera: Zoom into Zone Frío, cross-section view
Narration: "Con un click, el equipo inspecciona: la curva de temperatura muestra una excursión de +5.8°C durante 2 horas en el día 4 de tránsito. La cadena de frío se quebró."
Highlight: Temperature curve appears as overlay
Data: Show temperature chart with excursion highlighted in red

Scene 4: CAUSA Y ACCIÓN (0:54 — 1:12)
Camera: Pull back slightly, ficha operativa slides in from right
Narration: "FRESCO identifica la causa probable, calcula el impacto económico —$85,000 en riesgo— y recomienda acciones específicas: preparar evidencia, contactar al cliente, generar respuesta comercial proactiva."
Highlight: Ficha operativa with causa + acción visible
Data: Impact "$85,000" pulses

Scene 5: CIERRE (1:12 — 1:30)
Camera: Return to pipeline overview, all zones visible
Narration: "En 60 segundos, el equipo pasó de desconocer el riesgo a tener un plan de acción con responsable y evidencia. Eso es AgroVIA: el modelo operativo que convierte datos dispersos en decisiones."
Highlight: All zones glow green, then fade to normal
Data: Final tagline: "¿Cuánto riesgo se pierde hoy entre planillas, sensores y correos?"
```

**Implementation:**
- Use a state machine: `idle | scene1 | scene2 | scene3 | scene4 | scene5 | complete`
- Each scene has: { duration, narration, cameraTarget, highlights, dataOverlay }
- GSAP timeline for camera transitions between scenes
- Narration text uses CSS animation: fade in from bottom, hold, fade out
- Camera positions read from ZONE_CONFIGS + CameraSystem.transitionToZone
- Temperature chart overlay appears as a floating div positioned via CSS (not CSS2D — simpler)
- Ficha operativa in Scene 4: use the actual FichaOperativa component from T2 (import it), but rendered as an overlay
- Progress bar at bottom: thin green line advancing from 0% to 100% over 90 seconds
- Skip button: "Saltar demo" in top-right corner
- Play/pause: click anywhere to pause, click again to resume

**`components/cinematic/StoryMode.module.css`** — Full-screen overlay, z-index above everything.

**`components/cinematic/NarrationOverlay.tsx`** ('use client')
- Shows the narration text at bottom-center of screen
- Large text: 28px on desktop, 20px on mobile
- Semi-transparent dark background behind text for readability
- Fade-in/fade-out CSS animation per scene
- Text is white with subtle text-shadow

**`components/cinematic/SceneDataOverlay.tsx`** ('use client')
- Floating data cards that appear during specific scenes
- Scene 1: KPI summary bar
- Scene 2: Risk badge "91/100 — RIESGO CRÍTICO" with pulsing border
- Scene 3: Mini temperature chart (TemperaturaCurve from T2, rendered small)
- Scene 4: Impact card "$85,000 en riesgo"
- Scene 5: Closing tagline
- Each fades in/out with the scene

**`components/cinematic/ProgressBar.tsx`** ('use client')
- Thin bar (3px) at very bottom of screen
- Green fill advancing left-to-right over total duration
- Scene markers: 5 small dots at scene boundaries
- Click on a dot to jump to that scene

### Component 2: Presentation Mode

**`components/cinematic/PresentationMode.tsx`** ('use client')

A toggle that optimizes the entire UI for screen-sharing / Zoom demos:

When activated:
- All font sizes increase 30% (apply a CSS class to body that sets font-size: 130%)
- KPI values get even bigger (36px → 48px)
- Labels get brighter (from muted to secondary color)
- Sidebar items get more spacing
- A color legend appears at the bottom-left:
  - 🟢 Verde = Flujo normal / Sin riesgo
  - 🟡 Ámbar = Advertencia / Riesgo moderado
  - 🔴 Rojo = Alerta / Riesgo alto
  - 🔵 Azul = Temperatura / Cadena de frío
  - 🟣 Púrpura = Señales de mercado
  - 🟡 Dorado = Documentos / Valor monetario
- Bottom bar labels become larger and more visible
- "DATOS DE DEMOSTRACIÓN" watermark in corner (subtle but clear)

Toggle button: add to TopBar as a "Presentación" button with MonitorPlay icon

### Component 3: Demo Script Panel

**`components/cinematic/DemoScript.tsx`** ('use client')

A teleprompter-style panel for the presenter:
- Shows the 5-scene script with timing
- Current scene is highlighted
- Scrolls automatically with the story mode
- Shows key talking points per scene
- Can be shown on a secondary screen or as a sidebar
- Toggle with Ctrl+Shift+D shortcut

### Integration Points

**Update `components/layout/BottomBar.tsx`** (or coordinate via COMMS.md):
- The SIM section's Play button should start Story Mode
- Add a "Presentación" toggle in the SIM section or TopBar

**Update `components/layout/TopBar.tsx`**:
- Add "Modo Presentación" button with MonitorPlay icon
- Add "Demo Guiada" button with Play icon that starts StoryMode

**Since you don't own BottomBar.tsx or TopBar.tsx**, create the StoryMode and PresentationMode as STANDALONE components that can be activated via:
1. A keyboard shortcut (F5 for Story Mode, F8 for Presentation Mode)
2. A floating FAB (Floating Action Button) in bottom-right corner with Play icon
3. URL query param: `?demo=true` auto-starts story mode, `?present=true` enables presentation mode

Create a **`components/cinematic/DemoFAB.tsx`** ('use client'):
- Floating button in bottom-right: "▶ Demo" with play icon
- On click: starts StoryMode
- Secondary button: "📺 Presentación" toggle
- Glassmorphism styling, small, non-intrusive

### Files you own
- components/cinematic/StoryMode.tsx + .module.css (NEW)
- components/cinematic/NarrationOverlay.tsx + .module.css (NEW)
- components/cinematic/SceneDataOverlay.tsx + .module.css (NEW)
- components/cinematic/ProgressBar.tsx + .module.css (NEW)
- components/cinematic/PresentationMode.tsx + .module.css (NEW)
- components/cinematic/DemoScript.tsx + .module.css (NEW)
- components/cinematic/DemoFAB.tsx + .module.css (NEW)
- components/cinematic/index.ts (NEW — barrel export)

### Files you must NOT touch
- components/three/* (T1 phase 2)
- components/panels/* (T2 phase 2 is adding decision panels)
- lib/operator/* (T3 phase 2)
- app/api/* (T3 phase 2)
- lib/stores/* (import only — use useUiStore.setCinematicMode and useSelectionStore)

### Integration with app/page.tsx
You need StoryMode and DemoFAB to render. Since you don't own app/page.tsx, create a **`components/cinematic/CinematicProvider.tsx`** ('use client') that wraps all cinematic components:
```tsx
export function CinematicProvider() {
  return (
    <>
      <StoryMode />
      <PresentationMode />
      <DemoFAB />
    </>
  );
}
```
Document in COMMS.md that T5 should add `<CinematicProvider />` to page.tsx during integration.

### Dependencies
- Import ZONE_CONFIGS from lib/constants
- Import useUiStore, useSelectionStore from stores
- Import TemperaturaCurve from T2's panels (if available, otherwise create a simplified inline version)
- GSAP for camera timeline (already installed)

### Constraints
- ALL narration text in Spanish
- Named exports only, CSS Modules
- Story mode must be skippable and pausable
- Presentation mode must be toggleable without breaking normal mode
- Keyboard shortcuts: F5 (story), F8 (present), Escape (exit both)
- Total story duration: 90 seconds (configurable)
- Must work without Claude API (no dependency on T3)

### When done
1. `npx tsc --noEmit` — must pass
2. `npm run build` — must pass
3. Update COMMS.md: mark T4-Phase2 as ✅ DONE
4. Note: "CinematicProvider needs to be added to page.tsx by T5"
