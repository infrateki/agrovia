import type { ChatMessage } from '@/lib/types';
import { collectStream, streamChat } from './stream-handler';

/**
 * Generate an executive risk brief for a given shipment ID.
 * Returns formatted markdown text from FRESCO.
 */
export async function generateBrief(
  embarqueId: string,
  options: { signal?: AbortSignal; onChunk?: (chunk: string, total: string) => void } = {},
): Promise<string> {
  const prompt = `Genera un brief ejecutivo de riesgo para el embarque ${embarqueId}. Usa la estructura: **Situación → Riesgo → Causa Probable → Acción Recomendada → Responsable → Impacto Económico**. Sé conciso, operativo y cita IDs / montos / fechas / scores específicos del contexto. Máximo 250 palabras.`;
  const userMsg: ChatMessage = {
    id: `brief-${embarqueId}-${Date.now()}`,
    role: 'user',
    text: prompt,
    timestamp: new Date().toISOString(),
  };

  const { chunks } = await streamChat({ messages: [userMsg], signal: options.signal });
  if (!options.onChunk) return collectStream(chunks);

  let total = '';
  for await (const chunk of chunks) {
    total += chunk;
    options.onChunk(chunk, total);
  }
  return total;
}
