'use client';

import { useEffect, useRef, useState } from 'react';
import { Bot, Send } from 'lucide-react';
import { usePipelineStore } from '@/lib/stores/pipeline-store';
import type { ChatMessage } from '@/lib/types';
import styles from './OperatorChat.module.css';

const MOCK_RESPONSES = [
  'Estoy revisando los embarques activos. El S-8842 sigue siendo el de mayor riesgo: pico de 5.8 °C en día 4 y cliente sensible a blandura.',
  'Recomiendo priorizar la carpeta de defensa de R-002 y agendar una llamada con el account manager antes del arribo.',
  'Las señales SG-001 y SG-005 convergen sobre Walmart US — vale la pena un brief comercial antes del cierre del día.',
  'Puedo generar el resumen ejecutivo con curva de temperatura, fotos QC y respuesta sugerida. ¿Procedo?',
];

export function OperatorChat() {
  const chatMessages = usePipelineStore((s) => s.chatMessages);
  const addChatMessage = usePipelineStore((s) => s.addChatMessage);
  const [draft, setDraft] = useState('');
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [chatMessages, typing]);

  function handleSend() {
    const text = draft.trim();
    if (!text) return;
    const userMsg: ChatMessage = {
      id: `M-${Date.now()}`,
      role: 'user',
      text,
      timestamp: new Date().toISOString(),
    };
    addChatMessage(userMsg);
    setDraft('');
    setTyping(true);

    const reply = MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)];
    window.setTimeout(() => {
      const botMsg: ChatMessage = {
        id: `M-${Date.now() + 1}`,
        role: 'bot',
        text: reply,
        timestamp: new Date().toISOString(),
      };
      addChatMessage(botMsg);
      setTyping(false);
    }, 1500);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
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
            En línea · respondiendo
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
        {typing ? (
          <div className={`${styles.row} ${styles.rowBot}`}>
            <span className={styles.botAvatar}>
              <Bot size={14} />
            </span>
            <div className={`${styles.bubble} ${styles.bot} ${styles.typing}`}>
              <span className={styles.dot} />
              <span className={styles.dot} />
              <span className={styles.dot} />
            </div>
          </div>
        ) : null}
      </div>

      <div className={styles.inputRow}>
        <input
          className={styles.input}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Pregúntale a FRESCO..."
        />
        <button
          className={styles.send}
          type="button"
          onClick={handleSend}
          disabled={!draft.trim() || typing}
        >
          <Send size={14} />
          Enviar
        </button>
      </div>
    </div>
  );
}
