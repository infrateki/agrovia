# FRESCO 3D Pipeline Intelligence — Execution Guide

## Current Status

T1 has already run — the Next.js project is initialized with all dependencies.

---

## Phase 2: T2 + T3 + T4 (RUN IN PARALLEL)

1. Open `prompts/T2-DATA-LAYER.md` in Cursor → Select All → Copy → Paste into **T2** terminal
2. Open `prompts/T3-3D-ENGINE.md` in Cursor → Select All → Copy → Paste into **T3** terminal
3. Wait ~1-2 minutes for T2 to create types.ts, THEN:
4. Open `prompts/T4-FEATURES-UI.md` in Cursor → Select All → Copy → Paste into **T4** terminal
5. All three run simultaneously (~10-25 min)

**T3 is the heaviest** — it builds 7 zone classes, camera system, particle system, 4 shaders, and selection/label systems. Give it time.

**After ALL three finish**, commit from pwsh:
```powershell
cd C:\Infratek\repos\agrovia
git add -A
git commit -m "feat: T2+T3+T4 — data layer, 3D engine, UI panels"
git push
```

---

## Phase 3: T5 Integration + Deploy (RUN LAST)

1. Open `prompts/T5-DEPLOY.md` → paste into **T5** terminal
2. T5 fixes cross-terminal issues, adds mobile responsive, deploys
3. Wait for T5 to finish (~5-10 min)

**After T5 finishes**, commit from pwsh:
```powershell
cd C:\Infratek\repos\agrovia
git add -A
git commit -m "feat: T5 — integration, mobile, vercel deploy"
git push
```

---

## Phase 4: Deploy to Vercel

From pwsh terminal:

```powershell
cd C:\Infratek\repos\agrovia
npx vercel --prod
```

When prompted:
- Set up and deploy? **Y**
- Which scope? **Select your Vercel account**
- Link to existing project? **N** (create new)
- Project name? **agrovia**
- Directory? **./**
- Override settings? **N**

After first deploy succeeds, add custom domain:

```powershell
npx vercel domains add agrovia.infratek.ai
```

Or go to https://vercel.com → Project Settings → Domains → Add `agrovia.infratek.ai`

---

## If Something Breaks

**Build error after T2/T3/T4:**
Paste this into any terminal:
```
Read COMMS.md and CLAUDE.md. You are the integration verifier. Run `npm run build` and fix ALL errors. Run `npx tsc --noEmit` and fix ALL type errors. Do NOT refactor — only fix what's broken. Update COMMS.md when done.
```

**Terminal crashed / went idle:**
```
Read COMMS.md and CLAUDE.md. You are T[N] — [Role] owner. Check the terminal log in COMMS.md for your previous work. Pick up where you left off or claim a new TODO task.
```

**Context too long (> 60%):**
Type `/compact Focus on the remaining tasks` then continue.
