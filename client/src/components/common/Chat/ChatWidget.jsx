import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector }    from 'react-redux'
import { sendChatMessage, clearChat }  from '../../../redux/Thunks/ChatThunk'
import { toggleChat, openChat }        from '../../../redux/Slices/ChatSlice'

// ─── Markdown renderer (no external dep) ─────────────────────────────────────
function renderMarkdown(text) {
    if (!text) return ''
    let html = text
        .replace(/```[\s\S]*?```/g, m => {
            const code = m.replace(/^```\w*\n?/, '').replace(/```$/, '')
            return `<pre><code>${_esc(code)}</code></pre>`
        })
        .replace(/`([^`]+)`/g, (_, c) => `<code>${_esc(c)}</code>`)
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g,     '<em>$1</em>')
        .replace(/^###\s(.+)/gm,   '<p class="chat-md-h3">$1</p>')
        .replace(/^##\s(.+)/gm,    '<p class="chat-md-h2">$1</p>')
        .replace(/^\|.+\|$/gm,     m => `<span class="chat-md-table-row">${m.replace(/\|/g, ' · ')}</span>`)
        .replace(/^[-*]\s(.+)/gm,  '<li>$1</li>')
        .replace(/(<li>[\s\S]+?<\/li>)/g, '<ul>$1</ul>')
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g,   '<br/>')
    return `<p>${html}</p>`
}
function _esc(s) {
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
}

// ─── Message bubble ───────────────────────────────────────────────────────────
const Bubble = ({ msg }) => {
    const isUser = msg.role === 'user'
    return (
        <div className={`chat-bubble-wrap ${isUser ? 'chat-bubble-wrap--user' : ''}`}>
            {!isUser && (
                <div className="chat-avatar"><span>AI</span></div>
            )}
            <div
                className={`chat-bubble ${isUser ? 'chat-bubble--user' : 'chat-bubble--ai'}`}
                dangerouslySetInnerHTML={isUser ? undefined : { __html: renderMarkdown(msg.text) }}
            >
                {isUser ? msg.text : undefined}
            </div>
        </div>
    )
}

// ─── Typing indicator ─────────────────────────────────────────────────────────
const TypingDots = () => (
    <div className="chat-bubble-wrap">
        <div className="chat-avatar"><span>AI</span></div>
        <div className="chat-bubble chat-bubble--ai chat-typing">
            <span /><span /><span />
        </div>
    </div>
)

// ─── Main widget ──────────────────────────────────────────────────────────────
/**
 * @param {{ role: 'hr'|'employee' }} props
 *
 * Each role reads from its OWN isolated slice namespace:
 *   state.chat.hr       — HR admin conversation
 *   state.chat.employee — Employee conversation
 *
 * They never cross-contaminate.
 */
export const ChatWidget = ({ role }) => {
    const dispatch = useDispatch()

    // ✅ Select ONLY this role's namespace — the other role is invisible
    const { messages, isOpen, isLoading, error } = useSelector(s => s.chat[role] ?? s.chat.hr)

    const [text,    setText]    = useState('')
    const [mounted, setMounted] = useState(false)
    const bottomRef = useRef(null)
    const inputRef  = useRef(null)

    useEffect(() => { setMounted(true) }, [])

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, isLoading])

    useEffect(() => {
        if (isOpen) setTimeout(() => inputRef.current?.focus(), 120)
    }, [isOpen])

    const handleSend = () => {
        if (!text.trim() || isLoading) return
        dispatch(sendChatMessage({ text, role }))
        setText('')
    }

    const handleKey = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
    }

    // ✅ clearChat now receives role so it clears only this role's session
    const handleClear = () => dispatch(clearChat({ role }))

    const SUGGESTIONS = role === 'hr'
        ? [
            'How many pending leave requests are there?',
            'Summarise employee headcount by department',
            'What is our leave approval process?',
          ]
        : [
            'How many leave days do I have left?',
            'What is the process to apply for leave?',
            'When will my salary be processed?',
          ]

    return (
        <>
            <style>{STYLES}</style>

            {/* ── Floating trigger button ── */}
            <button
                className={`chat-fab ${isOpen ? 'chat-fab--open' : ''}`}
                onClick={() => dispatch(toggleChat(role))}
                aria-label="Toggle AI assistant"
            >
                {isOpen ? '✕' : '✦'}
            </button>

            {/* ── Chat panel ── */}
            <div className={`chat-panel ${isOpen ? 'chat-panel--open' : ''} ${mounted ? 'chat-panel--mounted' : ''}`}>

                {/* Header */}
                <div className="chat-header">
                    <div className="chat-header-left">
                        <div className="chat-header-icon">✦</div>
                        <div>
                            <p className="chat-header-title">HR Assistant</p>
                            <p className="chat-header-sub">
                                {role === 'hr' ? 'HR Admin context' : 'Employee context'}
                            </p>
                        </div>
                    </div>
                    <button className="chat-clear-btn" onClick={handleClear} title="Clear conversation">
                        ↺
                    </button>
                </div>

                {/* Messages */}
                <div className="chat-messages">
                    {messages.length === 0 && (
                        <div className="chat-empty">
                            <p className="chat-empty-icon">✦</p>
                            <p className="chat-empty-title">How can I help you?</p>
                            <p className="chat-empty-sub">
                                {role === 'hr'
                                    ? 'Ask about employees, leaves, payroll, departments, or any HR process.'
                                    : 'Ask about your leave balance, salary, notices, or HR processes.'}
                            </p>
                            <div className="chat-suggestions">
                                {SUGGESTIONS.map(s => (
                                    <button key={s} className="chat-suggestion" onClick={() => {
                                        dispatch(openChat(role))
                                        dispatch(sendChatMessage({ text: s, role }))
                                    }}>
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {messages.map(m => <Bubble key={m.id} msg={m} />)}
                    {isLoading && <TypingDots />}
                    {error && <div className="chat-error">⚠ {error}</div>}
                    <div ref={bottomRef} />
                </div>

                {/* Input */}
                <div className="chat-input-row">
                    <textarea
                        ref={inputRef}
                        className="chat-input"
                        placeholder="Ask anything about HR…"
                        value={text}
                        onChange={e => setText(e.target.value)}
                        onKeyDown={handleKey}
                        rows={1}
                        disabled={isLoading}
                    />
                    <button
                        className="chat-send-btn"
                        onClick={handleSend}
                        disabled={!text.trim() || isLoading}
                        aria-label="Send"
                    >
                        ➤
                    </button>
                </div>
                <p className="chat-footer-note">Press Enter to send · Shift+Enter for new line</p>
            </div>
        </>
    )
}

// ─── Scoped styles ────────────────────────────────────────────────────────────
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

.chat-fab {
  position: fixed; bottom: 28px; right: 28px; z-index: 999;
  width: 52px; height: 52px; border-radius: 50%;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border: none; cursor: pointer;
  color: white; font-size: 20px; line-height: 1;
  box-shadow: 0 4px 20px rgba(99,102,241,0.45);
  transition: transform 0.2s, box-shadow 0.2s, font-size 0.15s;
  display: flex; align-items: center; justify-content: center;
}
.chat-fab:hover { transform: scale(1.08); box-shadow: 0 6px 28px rgba(99,102,241,0.55); }
.chat-fab--open { font-size: 16px; }

.chat-panel {
  position: fixed; bottom: 92px; right: 28px; z-index: 998;
  width: 380px; max-width: calc(100vw - 40px);
  height: 580px; max-height: calc(100vh - 120px);
  background: var(--ems-surface, #ffffff);
  border: 1px solid var(--ems-border, rgba(0,0,0,0.08));
  border-radius: 20px;
  box-shadow: 0 16px 60px rgba(0,0,0,0.18);
  display: flex; flex-direction: column;
  font-family: 'DM Sans', sans-serif;
  opacity: 0; pointer-events: none;
  transform: translateY(12px) scale(0.97);
  transition: opacity 0.22s ease, transform 0.22s ease;
  overflow: hidden;
}
.chat-panel--open {
  opacity: 1; pointer-events: all;
  transform: translateY(0) scale(1);
}

.chat-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 16px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  flex-shrink: 0;
}
.chat-header-left { display: flex; align-items: center; gap: 10px; }
.chat-header-icon {
  width: 34px; height: 34px; border-radius: 10px;
  background: rgba(255,255,255,0.2);
  display: flex; align-items: center; justify-content: center;
  font-size: 16px; color: white; flex-shrink: 0;
}
.chat-header-title { font-size: 14px; font-weight: 600; color: white; margin: 0; }
.chat-header-sub   { font-size: 11px; color: rgba(255,255,255,0.65); margin: 0; }
.chat-clear-btn {
  background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.25);
  border-radius: 8px; color: white; font-size: 15px; cursor: pointer;
  width: 30px; height: 30px; display: flex; align-items: center; justify-content: center;
  transition: background 0.15s;
}
.chat-clear-btn:hover { background: rgba(255,255,255,0.25); }

.chat-messages {
  flex: 1; overflow-y: auto; padding: 14px 14px 8px;
  display: flex; flex-direction: column; gap: 10px;
  scroll-behavior: smooth;
}
.chat-messages::-webkit-scrollbar { width: 4px; }
.chat-messages::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 99px; }

.chat-empty {
  flex: 1; display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: 8px; text-align: center; padding: 20px 16px;
}
.chat-empty-icon  { font-size: 2rem; opacity: 0.4; }
.chat-empty-title { font-size: 15px; font-weight: 600; color: var(--ems-text-primary, #0f172a); margin: 0; }
.chat-empty-sub   { font-size: 12px; color: var(--ems-text-faint, rgba(0,0,0,0.4)); margin: 0; max-width: 280px; line-height: 1.5; }
.chat-suggestions { display: flex; flex-direction: column; gap: 6px; margin-top: 10px; width: 100%; }
.chat-suggestion {
  text-align: left; padding: 9px 12px; border-radius: 10px;
  border: 1px solid var(--ems-border, rgba(0,0,0,0.08));
  background: var(--ems-bg-secondary, rgba(0,0,0,0.02));
  font-size: 12px; color: var(--ems-text-muted, rgba(0,0,0,0.6));
  cursor: pointer; font-family: 'DM Sans', sans-serif;
  transition: border-color 0.15s, background 0.15s;
}
.chat-suggestion:hover { border-color: rgba(99,102,241,0.3); background: rgba(99,102,241,0.04); color: #6366f1; }

.chat-bubble-wrap { display: flex; align-items: flex-end; gap: 7px; }
.chat-bubble-wrap--user { flex-direction: row-reverse; }

.chat-avatar {
  width: 28px; height: 28px; border-radius: 50%; flex-shrink: 0;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  display: flex; align-items: center; justify-content: center;
  font-size: 9px; font-weight: 700; color: white;
  font-family: 'DM Serif Display', serif;
}

.chat-bubble {
  max-width: 82%; padding: 10px 13px; border-radius: 14px;
  font-size: 13px; line-height: 1.55; word-break: break-word;
}
.chat-bubble--user {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white; border-bottom-right-radius: 4px;
}
.chat-bubble--ai {
  background: var(--ems-bg-secondary, rgba(0,0,0,0.04));
  border: 1px solid var(--ems-border, rgba(0,0,0,0.07));
  color: var(--ems-text-primary, #0f172a);
  border-bottom-left-radius: 4px;
}

.chat-bubble--ai p   { margin: 0 0 6px; }
.chat-bubble--ai p:last-child { margin-bottom: 0; }
.chat-bubble--ai ul  { margin: 4px 0; padding-left: 16px; }
.chat-bubble--ai li  { margin-bottom: 3px; }
.chat-bubble--ai pre {
  background: var(--ems-bg-secondary, rgba(0,0,0,0.06));
  border-radius: 8px; padding: 8px 10px; margin: 6px 0;
  overflow-x: auto; font-size: 11px;
}
.chat-bubble--ai code {
  background: rgba(99,102,241,0.1); border-radius: 4px;
  padding: 1px 5px; font-size: 11px; color: #6366f1;
}
.chat-bubble--ai pre code { background: none; padding: 0; color: inherit; }
.chat-bubble--ai strong { color: var(--ems-text-primary, #0f172a); }
.chat-bubble--ai .chat-md-h2 { font-weight: 700; font-size: 14px; margin: 8px 0 4px; }
.chat-bubble--ai .chat-md-h3 { font-weight: 600; font-size: 13px; margin: 6px 0 3px; }
.chat-bubble--ai .chat-md-table-row { display: block; font-size: 12px; color: var(--ems-text-muted, rgba(0,0,0,0.5)); padding: 2px 0; }

.chat-typing { display: flex; align-items: center; gap: 4px; padding: 12px 14px; }
.chat-typing span {
  width: 6px; height: 6px; border-radius: 50%;
  background: rgba(99,102,241,0.5);
  animation: chatBounce 1.2s ease infinite;
}
.chat-typing span:nth-child(2) { animation-delay: 0.2s; }
.chat-typing span:nth-child(3) { animation-delay: 0.4s; }
@keyframes chatBounce {
  0%,80%,100% { transform: translateY(0); opacity: 0.5; }
  40%         { transform: translateY(-5px); opacity: 1; }
}

.chat-error {
  font-size: 12px; color: #dc2626;
  background: rgba(239,68,68,0.07);
  border: 1px solid rgba(220,38,38,0.18);
  border-radius: 10px; padding: 8px 12px; margin: 2px 0;
}

.chat-input-row {
  display: flex; align-items: flex-end; gap: 8px;
  padding: 10px 12px 8px;
  border-top: 1px solid var(--ems-border, rgba(0,0,0,0.07));
  flex-shrink: 0;
}
.chat-input {
  flex: 1; resize: none; overflow: hidden;
  padding: 9px 12px;
  border: 1px solid var(--ems-input-border, rgba(0,0,0,0.12));
  background: var(--ems-input-bg, #fff);
  border-radius: 10px; font-family: 'DM Sans', sans-serif;
  font-size: 13px; color: var(--ems-text-primary, #0f172a);
  outline: none; transition: border-color 0.2s, box-shadow 0.2s;
  min-height: 38px; max-height: 120px; line-height: 1.5;
  field-sizing: content;
}
.chat-input:focus { border-color: rgba(99,102,241,0.4); box-shadow: 0 0 0 3px rgba(99,102,241,0.07); }
.chat-input::placeholder { color: var(--ems-text-faint, rgba(0,0,0,0.3)); }
.chat-input:disabled { opacity: 0.5; }

.chat-send-btn {
  width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border: none; color: white; font-size: 14px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: opacity 0.2s, transform 0.15s;
  align-self: flex-end;
}
.chat-send-btn:hover:not(:disabled) { opacity: 0.9; transform: scale(1.05); }
.chat-send-btn:disabled { opacity: 0.35; cursor: not-allowed; transform: none; }

.chat-footer-note {
  text-align: center; font-size: 10px;
  color: var(--ems-text-faint, rgba(0,0,0,0.25));
  padding: 0 12px 8px; font-family: 'DM Sans', sans-serif;
  flex-shrink: 0;
}

[data-theme="dark"] .chat-panel  { background: #161922; border-color: rgba(255,255,255,0.08); }
[data-theme="dark"] .chat-bubble--ai { background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.08); color: #f1f5f9; }
[data-theme="dark"] .chat-bubble--ai code { background: rgba(99,102,241,0.15); }
[data-theme="dark"] .chat-bubble--ai pre  { background: rgba(255,255,255,0.05); }
[data-theme="dark"] .chat-bubble--ai strong { color: #f1f5f9; }
[data-theme="dark"] .chat-suggestion { background: rgba(255,255,255,0.04); border-color: rgba(255,255,255,0.08); color: rgba(255,255,255,0.55); }
[data-theme="dark"] .chat-suggestion:hover { background: rgba(99,102,241,0.1); border-color: rgba(99,102,241,0.3); color: #a5b4fc; }
[data-theme="dark"] .chat-empty-title { color: #f1f5f9; }
[data-theme="dark"] .chat-empty-sub   { color: rgba(255,255,255,0.4); }
[data-theme="dark"] .chat-input { background: #1e2130; border-color: rgba(255,255,255,0.1); color: #e2e8f0; }
[data-theme="dark"] .chat-input::placeholder { color: rgba(255,255,255,0.28); }
[data-theme="dark"] .chat-input-row { border-top-color: rgba(255,255,255,0.07); }
[data-theme="dark"] .chat-messages::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); }
`