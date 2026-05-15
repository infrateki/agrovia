# FRESCO AgroVIA — Phase 2 Execution Guide
# "De demo potente a producto que cierra pilotos"

## What Phase 2 Delivers

Phase 1 built the skeleton. Phase 2 makes it breathtaking and operational:

1. **T1 — 3D Ultra-Detail**: Every zone goes from ~15 meshes to 40-60. Fruit crates with actual berries, working conveyor belts, container with corrugated walls and open doors, ship with wake effects, retail shelves with product. Environmental particles everywhere.

2. **T2 — Decision Intelligence Layer**: Click any zone → ficha operativa (risk + cause + action + responsible). Trazabilidad timeline. Temperature curve overlay. Data source badges on every KPI. The "60 seconds to decision" flow.

3. **T3 — Live Claude Operator**: Real Anthropic API integration. The operator generates briefs, claims defense packets, risk explanations. Streaming responses. Curated system prompt with full domain knowledge.

4. **T4 — Cinematic Story Mode**: 90-second guided demo (context → alert → inspection → cause → action). Narration overlays. Presentation mode with 30% bigger typography. Zoom-optimized.

5. **T5 — Data Pipeline + Deploy v2**: CSV/Excel import. Data validation. PDF export of weekly risk report. Data source & timestamp badges. Deploy to agrovia.infratek.ai v2.

---

## Execution Order

```
Phase 1: T1 (3D Ultra-Detail)        — RUN FIRST, ALONE (modifies zone files)
         Wait for T1 to finish (~15-25 min)

Phase 2: T2 ──────┐
         T3 ──────┤                   — RUN IN PARALLEL
         T4 ──────┘
         Wait for ALL to finish (~10-20 min)

Phase 3: T5                           — INTEGRATION + DEPLOY
         Wait for T5 to finish (~5-10 min)
```

T1 runs first because it modifies the zone files that other terminals read.
T2, T3, T4 own completely separate files — zero overlap.
T5 runs last to fix integration issues and deploy.

---

## Before Starting

From pwsh terminal:
```powershell
cd C:\Infratek\repos\agrovia
git add -A
git commit -m "checkpoint: pre-phase-2"
git push
```

This creates a safe rollback point.

---

## Terminal Instructions

1. Open `prompts/phase2/T1-3D-ULTRA.md` → paste into **T1** terminal → wait for completion
2. Then simultaneously:
   - `prompts/phase2/T2-DECISION-LAYER.md` → paste into **T2**
   - `prompts/phase2/T3-CLAUDE-OPERATOR.md` → paste into **T3**
   - `prompts/phase2/T4-CINEMATIC.md` → paste into **T4**
3. Wait for all three, then:
   - `prompts/phase2/T5-DATA-DEPLOY.md` → paste into **T5**

## After Each Phase

```powershell
cd C:\Infratek\repos\agrovia
git add -A
git commit -m "feat: phase2 T1 — 3D ultra-detail zones"
git push
```

(Adjust message for each phase)

## Final Deploy

```powershell
npx vercel --prod
```
