import type { NextRequest } from 'next/server';
import { getSystemPrompt } from '@/lib/operator/system-prompt';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface IncomingMessage {
  role: 'user' | 'bot' | 'assistant';
  text?: string;
  content?: string;
}

interface ChatRequestBody {
  messages: IncomingMessage[];
  context?: string;
}

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-20250514';
const MAX_TOKENS = 1024;
const TEMPERATURE = 0.3;
const HISTORY_LIMIT = 10;

const MOCK_RESPONSE = `⚠️ **Modo demo:** FRESCO está operando con respuestas predefinidas. Configura \`ANTHROPIC_API_KEY\` en \`.env.local\` para inteligencia conversacional completa.

**Embarque S-8842** (Walmart US) presenta riesgo convergente:
- **Situación:** Excursión a 5.8 °C en día 4 de tránsito (~2h por encima del setpoint −0.5 °C).
- **Riesgo:** Blandura al arribo. Reclamo **R-002** abierto por USD 85 000.
- **Causa probable:** Falla intermitente del compresor o reapertura de puerta del reefer.
- **Acción:** Preparar carpeta de defensa con curva del data-logger y QC fotos previas. Llamada con account manager Walmart antes del arribo (21-may).
- **Responsable:** Operaciones + Comercial Walmart.

Otras prioridades del día:
- **R-004 (Driscoll's):** brix bajo en S-8843, revisar protocolo de packing.
- **Tesco UK (C-003):** score bajando a 74; agendar revisión trimestral.
- **SG-002:** precios spot uva en EE.UU. cayendo 8% w/w — priorizar lotes premium tier A.`;

function normalizeMessages(messages: IncomingMessage[]): Array<{
  role: 'user' | 'assistant';
  content: string;
}> {
  return messages
    .slice(-HISTORY_LIMIT)
    .map((m) => ({
      role: m.role === 'bot' || m.role === 'assistant' ? ('assistant' as const) : ('user' as const),
      content: (m.text ?? m.content ?? '').toString(),
    }))
    .filter((m) => m.content.trim().length > 0);
}

function streamPlainText(text: string): Response {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      // Emit in small chunks so the client typing animation feels alive.
      const tokens = text.split(/(\s+)/);
      for (const t of tokens) {
        controller.enqueue(encoder.encode(t));
        await new Promise((r) => setTimeout(r, 18));
      }
      controller.close();
    },
  });
  return new Response(stream, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Operator-Mode': 'mock',
    },
  });
}

function pipeAnthropicStream(upstream: ReadableStream<Uint8Array>): ReadableStream<Uint8Array> {
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = '';

  return new ReadableStream({
    async start(controller) {
      const reader = upstream.getReader();
      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          let nl = buffer.indexOf('\n');
          while (nl !== -1) {
            const line = buffer.slice(0, nl).trimEnd();
            buffer = buffer.slice(nl + 1);
            nl = buffer.indexOf('\n');
            if (!line.startsWith('data:')) continue;
            const payload = line.slice(5).trim();
            if (!payload || payload === '[DONE]') continue;
            try {
              const evt = JSON.parse(payload) as {
                type?: string;
                delta?: { type?: string; text?: string };
              };
              if (evt.type === 'content_block_delta' && evt.delta?.type === 'text_delta' && evt.delta.text) {
                controller.enqueue(encoder.encode(evt.delta.text));
              }
            } catch {
              // skip malformed SSE chunk
            }
          }
        }
      } catch (err) {
        controller.enqueue(encoder.encode(`\n\n[error de stream: ${(err as Error).message}]`));
      } finally {
        controller.close();
        reader.releaseLock();
      }
    },
  });
}

export async function POST(req: NextRequest): Promise<Response> {
  let body: ChatRequestBody;
  try {
    body = (await req.json()) as ChatRequestBody;
  } catch {
    return Response.json({ error: 'JSON inválido' }, { status: 400 });
  }
  if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
    return Response.json({ error: 'messages requerido' }, { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return streamPlainText(MOCK_RESPONSE);
  }

  const messages = normalizeMessages(body.messages);
  if (messages.length === 0) {
    return Response.json({ error: 'mensajes vacíos' }, { status: 400 });
  }

  let upstream: Response;
  try {
    upstream = await fetch(ANTHROPIC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        temperature: TEMPERATURE,
        system: getSystemPrompt(),
        messages,
        stream: true,
      }),
    });
  } catch (err) {
    return new Response(
      `Error de conexión con Anthropic: ${(err as Error).message}`,
      { status: 502, headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
    );
  }

  if (!upstream.ok || !upstream.body) {
    const errText = await upstream.text().catch(() => '');
    return new Response(
      `Anthropic API ${upstream.status}: ${errText.slice(0, 500) || upstream.statusText}`,
      { status: upstream.status, headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
    );
  }

  return new Response(pipeAnthropicStream(upstream.body), {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Operator-Mode': 'live',
    },
  });
}
