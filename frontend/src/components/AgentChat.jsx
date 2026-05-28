import { useState, useRef, useEffect } from 'react';
import styles from './AgentChat.module.css';

const SUGGESTED_QUESTIONS = [
  'How long will it take me to learn Docker?',
  'Which skill should I tackle first?',
  'Can I learn AWS without prior cloud experience?',
  'What projects should I build to learn Next.js?',
  'How do I bridge the gap from React to Next.js?',
];

export default function AgentChat({ analysis, apiUrl }) {
  const [messages, setMessages] = useState([
    {
      role: 'agent',
      content: `Hey! I'm PathFinder 🧭 I've just analyzed your profile and built your roadmap. Ask me anything about your gaps, timeline, or what to build next.`
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (text) => {
    const message = text || input.trim();
    if (!message || loading) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: message }]);
    setLoading(true);

    try {
      const res = await fetch(`${apiUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, analysisContext: analysis })
      });
      const data = await res.json();
      setMessages(prev => [...prev, {
        role: 'agent',
        content: data.reply || data.error || 'Sorry, something went wrong.'
      }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'agent',
        content: 'Network error. Make sure the backend is running.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.chatContainer}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.agentAvatar}>🧭</div>
          <div className={styles.headerInfo}>
            <span className={styles.agentName}>PathFinder Agent</span>
            <span className={styles.agentStatus}>
              <span className={styles.onlineDot} />
              Online · Powered by Gemini
            </span>
          </div>
        </div>

        {/* Messages */}
        <div className={styles.messages}>
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`${styles.message} ${msg.role === 'user' ? styles.userMessage : styles.agentMessage}`}
            >
              {msg.role === 'agent' && (
                <div className={styles.msgAvatar}>🧭</div>
              )}
              <div className={styles.bubble}>{msg.content}</div>
            </div>
          ))}
          {loading && (
            <div className={`${styles.message} ${styles.agentMessage}`}>
              <div className={styles.msgAvatar}>🧭</div>
              <div className={`${styles.bubble} ${styles.thinkingBubble}`}>
                <span className={styles.dot1} />
                <span className={styles.dot2} />
                <span className={styles.dot3} />
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Suggested questions */}
        <div className={styles.suggestions}>
          {SUGGESTED_QUESTIONS.map(q => (
            <button
              key={q}
              className={styles.suggestionChip}
              onClick={() => send(q)}
              disabled={loading}
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className={styles.inputArea}>
          <input
            id="chat-input"
            className={styles.input}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
            placeholder="Ask about your roadmap..."
            disabled={loading}
          />
          <button
            id="chat-send"
            className={styles.sendBtn}
            onClick={() => send()}
            disabled={loading || !input.trim()}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M22 2L11 13M22 2L15 22 11 13 2 9l20-7z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
