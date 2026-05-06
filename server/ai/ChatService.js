/**
 * ChatService — single orchestration layer for all AI chat.
 * Controllers call ONLY this file.
 * Provider, memory, and prompts can all be swapped independently.
 */
import { getProvider }                  from './providers/ProviderFactory.js'
import * as memory                      from './memory/ChatMemory.js'
import {
    buildHRSystemPrompt,
    buildEmployeeSystemPrompt,
    buildGenericSystemPrompt,
} from './prompts/systemPrompts.js'
import { buildHRContext }       from './context/hrContext.js'
import { buildEmployeeContext } from './context/employeeContext.js'

/**
 * @param {{ sessionId, message, role, orgID, actorID }} params
 * @returns {Promise<{ reply: string, sessionId: string }>}
 */
export async function sendMessage({ sessionId, message, role, orgID, actorID }) {
    if (!message?.trim()) throw new Error('Message cannot be empty')

    const provider     = getProvider()
    const systemPrompt = await _buildSystemPrompt(role, orgID, actorID)
    const history      = memory.getHistory(sessionId)

    const messages = [
        { role: 'system', content: systemPrompt },
        ...history,
        { role: 'user',   content: message.trim() },
    ]

    const reply = await provider.chat(messages)
    memory.appendTurn(sessionId, message.trim(), reply)

    return { reply, sessionId }
}

export function clearSession(sessionId) {
    memory.clearSession(sessionId)
}

export async function healthCheck() {
    const provider  = getProvider()
    const available = await provider.isAvailable()
    return { provider: provider.name, available }
}

async function _buildSystemPrompt(role, orgID, actorID) {
    try {
        if (role === 'hr')       return buildHRSystemPrompt(await buildHRContext(orgID, actorID))
        if (role === 'employee') return buildEmployeeSystemPrompt(await buildEmployeeContext(orgID, actorID))
    } catch (err) {
        console.error('[AI] Context build failed, using generic prompt:', err.message)
    }
    return buildGenericSystemPrompt()
}
