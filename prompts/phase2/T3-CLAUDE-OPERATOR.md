Read COMMS.md and CLAUDE.md. You are T3 — Live Claude Operator owner for Phase 2.

ultrathink

Your job is to wire up the real Anthropic Claude API so the FRESCO operator chat actually works. The operator should be able to generate risk briefs, claims defense packets, answer questions about embarques/lotes/clientes, and explain causes of risk — all grounded in the mock data as if it were real operational data.

### Architecture

**API Route: `app/api/chat/route.ts`**
- POST endpoint that receives { messages: ChatMessage[], context?: string }
- Calls Anthropic API with claude-sonnet-4-20250514 model
- Streams the response back using ReadableStream
- System prompt includes full domain context (see below)
- Max tokens: 1024
- Temperature: 0.3 (more deterministic for operational responses)

**System Prompt** — The operator's brain. Create `lib/operator/system-prompt.ts`:

```
Eres FRESCO, el operador de inteligencia postcosecha de AgroVIA. Tu rol es Chief of Staff postcosecha para una empresa agroexportadora peruana.

CONTEXTO OPERATIVO:
- La empresa exporta arándanos, uva de mesa, palta, mango y cítricos
- Mercados principales: EE.UU., Europa, Japón, Perú
- [Insert full mock data summary: all embarques with IDs, statuses, risk scores]
- [Insert all clientes with scores and reclamo counts]
- [Insert all señales activas with scores]
- [Insert temperature excursion data for S-8842]
- [Insert all reclamos abiertos]

ALERTAS ACTIVAS:
- S-8842 (arándanos → EE.UU.): Excursión de temperatura día 4, +5.8°C por 2h. Riesgo convergente con historial de reclamos del cliente Tesco. Score: 91/100.
- Tesco UK: 5 reclamos en 6 semanas, score 74/100 bajando.

CAPACIDADES:
1. Preparar briefs ejecutivos de riesgo por embarque
2. Generar carpetas de defensa para reclamos
3. Explicar causas probables de desviaciones
4. Recomendar acciones con responsables específicos
5. Resumir el estado del pipeline completo
6. Responder preguntas sobre lotes, clientes, temperaturas

REGLAS:
- Responde SIEMPRE en español
- Sé directo y operativo — no hagas preámbulos largos
- Incluye datos específicos (IDs, montos, fechas, scores)
- Cuando recomiendes acciones, asigna un responsable
- Si no tienes datos suficientes, di qué datos faltan
- Formatea con bullet points y negritas para escaneo rápido
- Si te piden un brief, usa estructura: Situación → Riesgo → Causa → Acción → Responsable
```

Fill the system prompt with ACTUAL data from the mock files (import and serialize).

**Streaming Handler: `lib/operator/stream-handler.ts`**
- Function that creates the fetch call to /api/chat
- Returns an async iterator of text chunks
- Handles errors gracefully (network, rate limit, API errors)

**Updated OperatorChat: `components/panels/OperatorChat.tsx`**
REPLACE the mock delay response with real Claude API streaming:
- On send: POST to /api/chat with conversation history
- Stream the response token by token into the chat
- Show typing indicator while waiting for first token
- Handle errors: show "Error de conexión — reintenta" message
- Add retry button on failed messages
- Keep conversation history in Zustand store (or local state)
- Limit history to last 10 messages to manage token usage

**Brief Generator: `lib/operator/brief-generator.ts`**
- Function: generateBrief(embarqueId: string) → Promise<string>
- Calls Claude with specific prompt: "Genera un brief ejecutivo de riesgo para el embarque {id}. Usa la estructura: Situación, Riesgo, Causa Probable, Acción Recomendada, Responsable, Impacto Económico."
- Returns formatted markdown text
- Used by FichaOperativa's "Generar Brief" button (T2 creates the button, you create the function it calls)

**Claims Defense Generator: `lib/operator/defense-generator.ts`**
- Function: generateDefensePacket(reclamoId: string) → Promise<string>
- Calls Claude with: "Genera una carpeta de defensa para el reclamo {id}. Incluye: resumen del caso, evidencia disponible, línea de tiempo, análisis de temperatura, y respuesta comercial recomendada."
- Returns formatted markdown
- Used by ClaimsDefense's "Generar carpeta" button

**Export: `lib/operator/index.ts`** — Barrel export of all operator functions.

### Environment Variable

The API key must be set as `ANTHROPIC_API_KEY` in the environment. Create/update `.env.local` template:
```
ANTHROPIC_API_KEY=sk-ant-...
```

In the API route, read from `process.env.ANTHROPIC_API_KEY`. If not set, return a helpful error: "API key no configurada. Configura ANTHROPIC_API_KEY en .env.local"

For the demo where no API key is set, the chat should gracefully fallback to a pre-scripted response explaining that the API connection is pending.

### API Route Implementation Detail

```typescript
// app/api/chat/route.ts
import { NextRequest } from 'next/server';
import { getSystemPrompt } from '@/lib/operator/system-prompt';

export async function POST(req: NextRequest) {
  const { messages } = await req.json();
  const apiKey = process.env.ANTHROPIC_API_KEY;
  
  if (!apiKey) {
    // Return mock response for demo
    return Response.json({ 
      content: "⚠️ Modo demo: FRESCO está operando con respuestas predefinidas. Configura ANTHROPIC_API_KEY para inteligencia conversacional completa.\n\n**Embarque S-8842** presenta riesgo convergente...",
      mock: true 
    });
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: getSystemPrompt(),
      messages: messages.map((m: any) => ({
        role: m.role,
        content: m.text,
      })),
      stream: true,
    }),
  });

  // Stream the response back
  // ... (implement SSE streaming)
}
```

### Suggested Quick-Ask Buttons

Add to OperatorChat UI (below the input):
- "¿Qué embarques necesitan acción?" 
- "Brief de S-8842"
- "Resumen del pipeline"
- "Riesgo por cliente"

These are pre-filled prompts the user can click instead of typing.

### Files you own
- app/api/chat/route.ts (NEW)
- lib/operator/system-prompt.ts (NEW)
- lib/operator/stream-handler.ts (NEW)
- lib/operator/brief-generator.ts (NEW)
- lib/operator/defense-generator.ts (NEW)
- lib/operator/index.ts (NEW)
- components/panels/OperatorChat.tsx (UPDATE — replace mock with real API)
- components/panels/OperatorChat.module.css (UPDATE if needed)
- .env.example (UPDATE — add ANTHROPIC_API_KEY)

### Files you must NOT touch
- components/three/* (T1 phase 2)
- components/panels/FichaOperativa.tsx (T2 phase 2)
- components/panels/RightPanel.tsx (T2 phase 2)
- components/layout/* (T4 phase 2)
- lib/types.ts (T2 may be adding types)
- lib/stores/* (don't modify existing stores)

### Constraints
- Anthropic API only (not OpenAI, not other providers)
- Model: claude-sonnet-4-20250514 for speed
- ALL operator responses in Spanish
- Graceful fallback when no API key — demo must still work
- Stream responses for perceived speed
- Don't expose the API key to the client — server-side only via API route
- System prompt must include actual mock data values for grounded responses

### When done
1. `npx tsc --noEmit` — must pass
2. `npm run build` — must pass
3. Test: `npm run dev`, open chat, send "¿Qué embarques necesitan acción?" — should get either real Claude response or graceful mock fallback
4. Update COMMS.md: mark T3-Phase2 as ✅ DONE
