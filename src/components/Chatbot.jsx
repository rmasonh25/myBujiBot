


import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import './ChatBot.css'; // make sure this import exists

export default function ChatBot() {
  const [open, setOpen] = useState(true);          // bubble toggles this
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hi! I am myBujiBot. How can I help?' }
  ]);
  const listRef = useRef(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    // autoscroll to bottom on new message
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, open]);

  const send = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;

    setMessages((m) => [...m, { sender: 'user', text }]);
    setInput('');
    setSending(true);

    try {
      const res = await axios.post(
        '/api/chat',
        { question: text },
        { headers: { 'Content-Type': 'application/json' } }
      );

      const payload = res.data;
      const botText =
        (typeof payload === 'string' && payload) ||
        payload?.answer ||
        payload?.message ||
        payload?.content ||
        (Array.isArray(payload) ? JSON.stringify(payload) : JSON.stringify(payload, null, 2));

      setMessages((m) => [...m, { sender: 'bot', text: botText }]);
    } catch (err) {
      console.error(err);
      setMessages((m) => [...m, { sender: 'bot', text: 'Error retrieving response' }]);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {/* Floating bubble */}
      <button
        className={`mbb-bubble ${open ? 'mbb-bubble-open' : ''}`}
        aria-expanded={open}
        aria-label={open ? 'Close chat' : 'Open chat'}
        onClick={() => setOpen(o => !o)}
        type="button"
      >
        {/* Simple bot icon */}
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M11 2h2v3h-2zM6 8a6 6 0 1 1 12 0v1h1a3 3 0 0 1 3 3v3a4 4 0 0 1-4 4h-1.1A5.9 5.9 0 0 1 12 22a5.9 5.9 0 0 1-4.9-3H6a4 4 0 0 1-4-4v-3a3 3 0 0 1 3-3h1V8zm2 1h8V8a4 4 0 1 0-8 0v1zm-3 3a1 1 0 0 0-1 1v3a2 2 0 0 0 2 2h2.1A3.9 3.9 0 0 0 12 19a3.9 3.9 0 0 0 3.9-1H18a2 2 0 0 0 2-2v-3a1 1 0 0 0-1-1h-2v1a1 1 0 1 1-2 0v-1H9v1a1 1 0 1 1-2 0v-1H5z"/>
        </svg>
      </button>

      {/* Chat panel */}
      {open && (
        <div className="mbb-panel" role="dialog" aria-label="myBujiBot chat">
          {/* Header */}
          <div className="mbb-header">
            <div className="mbb-title">myBujiBot</div>
            <button
              className="mbb-close"
              onClick={() => setOpen(false)}
              type="button"
              aria-label="Close chat"
              title="Close"
            >×</button>
          </div>

          {/* Messages */}
          <div className="mbb-body" ref={listRef}>
            {messages.map((m, i) => (
              <div key={i} className={`mbb-msg ${m.sender === 'user' ? 'mbb-right' : 'mbb-left'}`}>
                <div className={`mbb-bubble-msg ${m.sender === 'user' ? 'mbb-user' : 'mbb-bot'}`}>
                  {typeof m.text === 'string'
                    ? m.text
                    : <pre className="mbb-pre">{JSON.stringify(m.text, null, 2)}</pre>}
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <form className="mbb-inputbar" onSubmit={send}>
            <input
              className="mbb-input"
              placeholder="Type your message…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={sending}
            />
            <button className="mbb-send" type="submit" disabled={sending || !input.trim()}>
              {sending ? 'Sending…' : 'Send'}
            </button>
          </form>

          {/* Footer */}
          <div className="mbb-footer">© 2025 Bujisoft LLC</div>
        </div>
      )}
    </>
  );
}
