import { apiService }    from '../apis/APIService'
import { ChatEndpoints } from '../apis/ChatEndpoints'
import {
    addUserMessage,
    addAssistantMessage,
    setError,
    clearMessages,
} from '../Slices/ChatSlice'

/**
 * Send a message for a specific role. The role determines:
 *  - which API endpoint to call
 *  - which Redux namespace (hr / employee) to read/write
 *
 * @param {{ text: string, role: 'hr'|'employee' }} payload
 */
export const sendChatMessage = ({ text, role }) => async (dispatch, getState) => {
    if (!text?.trim()) return

    dispatch(addUserMessage({ role, text }))

    // Read sessionId from the role-specific namespace
    const { sessionId } = getState().chat[role] ?? {}
    const endpoint = role === 'hr' ? ChatEndpoints.HR_CHAT : ChatEndpoints.EMPLOYEE_CHAT

    try {
        const res = await apiService.post(endpoint, {
            message: text.trim(),
            ...(sessionId ? { sessionId } : {}),
        }, { withCredentials: true })

        dispatch(addAssistantMessage({
            role,
            reply:     res.data.reply,
            sessionId: res.data.sessionId,
        }))
    } catch (err) {
        const message = err.response?.data?.message || 'AI service unavailable. Please try again.'
        dispatch(setError({ role, message }))
    }
}

/**
 * Clear conversation for a specific role (local state + server session).
 * @param {{ role: 'hr'|'employee' }} payload
 */
export const clearChat = ({ role }) => async (dispatch, getState) => {
    const { sessionId } = getState().chat[role] ?? {}
    if (sessionId) {
        try {
            await apiService.delete(ChatEndpoints.CLEAR_SESSION(sessionId), { withCredentials: true })
        } catch { /* silent fail — local clear still happens */ }
    }
    dispatch(clearMessages(role))
}