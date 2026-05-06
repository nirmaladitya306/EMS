/**
 * ChatMemory — per-session conversation history (in-process).
 * Replace backing store with Redis for multi-instance deployments:
 * just swap the Map + setTimeout with ioredis calls — interface stays identical.
 *
 * Env:  CHAT_MEMORY_TTL_MS  inactivity TTL  (default 30 min)
 *       CHAT_MAX_TURNS      rolling window   (default 20 turn-pairs)
 */
const TTL     = parseInt(process.env.CHAT_MEMORY_TTL_MS || '1800000', 10)
const MAX     = parseInt(process.env.CHAT_MAX_TURNS     || '20',      10) * 2

const store   = new Map()   // sessionId → { messages[], timer }

export function appendTurn(sessionId, userContent, assistantContent) {
    const s = _getOrCreate(sessionId)
    s.messages.push(
        { role: 'user',      content: userContent      },
        { role: 'assistant', content: assistantContent },
    )
    if (s.messages.length > MAX) s.messages = s.messages.slice(-MAX)
    _bump(sessionId)
}

export function getHistory(sessionId) {
    return _getOrCreate(sessionId).messages
}

export function clearSession(sessionId) {
    const s = store.get(sessionId)
    if (s?.timer) clearTimeout(s.timer)
    store.delete(sessionId)
}

export function activeSessionCount() { return store.size }

function _getOrCreate(id) {
    if (!store.has(id)) store.set(id, { messages: [], timer: null })
    return store.get(id)
}

function _bump(id) {
    const s = store.get(id)
    if (!s) return
    if (s.timer) clearTimeout(s.timer)
    s.timer = setTimeout(() => store.delete(id), TTL)
}
