'use client';

import { useEffect, useRef, useState } from 'react';
import { Bot, RotateCcw, Send } from 'lucide-react';
import { usePipelineStore } from '@/lib/stores/pipeline-store';
import type { ChatMessage } from '@/lib/types';
import { OperatorStreamError, streamChat } from '@/lib/operator';
import styles from './OperatorChat.module.css';

const HISTORY_LIMIT = 10;

const QUICK_ASKS: Array<{ label: string; prompt: string }> = [
  { label: '¿Qué embarques necesitan acción?', prompt: '¿Qué embarques necesitan acción hoy? Lista los 3 de mayor prioridad con la acción recomendada y responsable.' },
  { label: 'Brief de S-8842', prompt: 'Brief ejecutivo del embarque S-8842 con estructura Situación → Riesgo → Causa → Acción → Responsable → Impacto Económico.' },
  { label: 'Resumen del pipeline', prompt: 'Dame un resumen del estado del pipeline: cuántos embarques por zona, cuáles los críticos, y dónde se concentra el riesgo económico.' },
  { label: 'Riesgo por cliente', prompt: 'Ránkea a los clientes por riesgo (score + reclamos abiertos + monto expuesto) y recomienda acción comercial para los 2 más críticos.' },
];

interface LiveState {
  /** Id of the in-progress assistant message bubble. */
  msgId: string;
  text: string;
  abort: AbortController;
}

interface FailedSend {
  text: string;
  reason: string;
}

export function OperatorChat() {
  const chatMessages = usePipelineStore((s) => s.chatMessages);
  const addChatMessage = usePipelineStore((s) => s.addChatMessage);
  const [draft, setDraft] = useState('');
  const [live, setLive] = useState<LiveState | null>(null);
  const [failed, setFailed] = useState<FailedSend | null>(null);
  const [demoNotice, setDemoNotice] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [chatMessages, live]);

  useEffect(() => {
    return () => {
      // Abort any in-flight stream on unmount
      if (live) live.abort.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || live) return;
    setFailed(null);

    const userMsg: ChatMessage = {
      id: `M-u-${Date.now()}`,
      role: 'user',
      text: trimmed,
      timestamp: new Date().toISOString(),
    };
    addChatMessage(userMsg);

    const liveMsgId = `M-b-${Date.now() + 1}`;
    const abort = new AbortController();
    setLive({ msgId: liveMsgId, text: '', abort });

    // Build history: existing messages + the user message we just appended
    const history: ChatMessage[] = [...chatMessages, userMsg].slice(-HISTORY_LIMIT);

    try {
      const { chunks, mode } = await streamChat({ messages: history, signal: abort.signal });
      if (mode === 'mock') setDemoNotice(true);

      let acc = '';
      let gotAny = false;
      for await (const chunk of chunks) {
        if (abort.signal.aborted) break;
        acc += chunk;
        gotAny = true;
        setLive((prev) => (prev ? { ...prev, text: acc } : prev));
      }
      if (!gotAny) throw new OperatorStreamError(500, 'Stream vacío desde el operador');

      const botMsg: ChatMessage = {
        id: liveMsgId,
        role: 'bot',
        text: acc,
        timestamp: new Date().toISOString(),
      };
      addChatMessage(botMsg);
      setLive(null);
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        setLive(null);
        return;
      }
      const reason =
        err instanceof OperatorStreamError
          ? `Error ${err.status}: ${err.message}`
          : `Error de conexión — ${(err as Error).message}`;
      setLive(null);
      setFailed({ text: trimmed, reason });
    }
  }

  function handleSendClick() {
    const t = draft;
    setDraft('');
    void send(t);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendClick();
    }
  }

  function retry() {
    if (!failed) return;
    const t = failed.text;
    setFailed(null);
    void send(t);
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <span className={styles.avatar}>
          <Bot size={16} />
        </span>
        <div className={styles.headerText}>
          <span className={styles.headerTitle}>FRESCO Operator</span>
          <span className={styles.headerStatus}>
            <span className={styles.statusDot} />
            {demoNotice ? 'Modo demo · respuestas predefinidas' : 'En línea · respondiendo'}
          </span>
        </div>
      </div>

      <div className={styles.messages} ref={scrollRef}>
        {chatMessages.map((m) => (
          <div
            key={m.id}
            className={`${styles.row} ${m.role === 'user' ? styles.rowUser : styles.rowBot}`}
          >
            {m.role === 'bot' ? (
              <span className={styles.botAvatar}>
                <Bot size={14} />
              </span>
            ) : null}
            <div className={`${styles.bubble} ${m.role === 'user' ? styles.user : styles.bot}`}>
              {m.text}
            </div>
          </div>
        ))}

        {live ? (
          <div className={`${styles.row} ${styles.rowBot}`}>
            <span className={styles.botAvatar}>
              <Bot size={14} />
            </span>
            {live.text.length === 0 ? (
              <div className={`${styles.bubble} ${styles.bot} ${styles.typing}`}>
                <span className={styles.dot} />
                <span className={styles.dot} />
                <span className={styles.dot} />
              </div>
            ) : (
              <div className={`${styles.bubble} ${styles.bot}`}>
                {live.text}
                <span className={styles.caret} aria-hidden="true" />
              </div>
            )}
          </div>
        ) : null}

        {failed ? (
          <div className={`${styles.row} ${styles.rowBot}`}>
            <span className={styles.botAvatar}>
              <Bot size={14} />
            </span>
            <div className={`${styles.bubble} ${styles.bot} ${styles.errorBubble}`}>
              <div className={styles.errorText}>{failed.reason}</div>
              <button type="button" className={styles.retry} onClick={retry}>
                <RotateCcw size={12} />
                Reintentar
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <div className={styles.quickAsks}>
        {QUICK_ASKS.map((q) => (
          <button
            key={q.label}
            type="button"
            className={styles.quickAsk}
            onClick={() => void send(q.prompt)}
            disabled={Boolean(live)}
          >
            {q.label}
          </button>
        ))}
      </div>

      <div className={styles.inputRow}>
        <input
          className={styles.input}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Pregúntale a FRESCO..."
          disabled={Boolean(live)}
        />
        <button
          className={styles.send}
          type="button"
          onClick={handleSendClick}
          disabled={!draft.trim() || Boolean(live)}
        >
          <Send size={14} />
          Enviar
        </button>
      </div>
    </div>
  );
}
