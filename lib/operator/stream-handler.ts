import type { ChatMessage } from '@/lib/types';

export interface StreamChatOptions {
  messages: ChatMessage[];
  signal?: AbortSignal;
}

export interface StreamResult {
  /** Async iterator over text chunks (already decoded UTF-8 strings). */
  chunks: AsyncIterable<string>;
  /** "live" when Claude is wired, "mock" when running on the demo fallback. */
  mode: 'live' | 'mock' | 'unknown';
}

export class OperatorStreamError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'OperatorStreamError';
  }
}

/**
 * POST to /api/chat and return an async iterator of streamed text chunks.
 * Throws OperatorStreamError on HTTP failure; consumer can show a retry button.
 */
export async function streamChat({ messages, signal }: StreamChatOptions): Promise<StreamResult> {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages }),
    signal,
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new OperatorStreamError(
      res.status,
      errText.trim() || `Error ${res.status} desde /api/chat`,
    );
  }
  if (!res.body) {
    throw new OperatorStreamError(500, 'Respuesta sin cuerpo desde /api/chat');
  }

  const mode = (res.headers.get('X-Operator-Mode') as 'live' | 'mock' | null) ?? 'unknown';
  const stream = res.body;

  async function* iterate(): AsyncIterable<string> {
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        if (!value) continue;
        const text = decoder.decode(value, { stream: true });
        if (text) yield text;
      }
      const tail = decoder.decode();
      if (tail) yield tail;
    } finally {
      reader.releaseLock();
    }
  }

  return { chunks: iterate(), mode };
}

/**
 * Consume an async iterable of text chunks into a single string.
 * Useful for one-shot calls like generateBrief / generateDefensePacket.
 */
export async function collectStream(chunks: AsyncIterable<string>): Promise<string> {
  let out = '';
  for await (const c of chunks) out += c;
  return out;
}
