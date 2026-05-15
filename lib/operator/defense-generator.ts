import type { ChatMessage } from '@/lib/types';
import { collectStream, streamChat } from './stream-handler';

/**
 * Generate a claims defense packet for a given reclamo ID.
 * Returns formatted markdown text from FRESCO.
 */
export async function generateDefensePacket(
  reclamoId: string,
  options: { signal?: AbortSignal; onChunk?: (chunk: string, total: string) => void } = {},
): Promise<string> {
  const prompt = `Genera una carpeta de defensa completa para el reclamo ${reclamoId}. Incluye estas secciones con sus títulos en negrita:

1. **Resumen del caso** — qué reclama el cliente y monto en juego.
2. **Evidencia disponible** — listado puntual (logger, fotos QC, certificados, brix/calibre).
3. **Línea de tiempo** — eventos clave desde cosecha hasta arribo, con fechas.
4. **Análisis de temperatura** — comportamiento de la cadena de frío y desviaciones.
5. **Respuesta comercial recomendada** — postura inicial, descuento límite, mensajes para account manager, responsables.

Sé directo, cita IDs / fechas / montos / scores. Máximo 350 palabras.`;
  const userMsg: ChatMessage = {
    id: `defense-${reclamoId}-${Date.now()}`,
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
