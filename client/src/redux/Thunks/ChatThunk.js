import { apiService }    from '../apis/APIService'
import { ChatEndpoints } from '../apis/ChatEndpoints'
import {
    addUserMessage,
    addAssistantMessage,
    setError,
    clearMessages,
} from '../Slices/ChatSlice'

/**
 * Send a message. role is injected by the calling sidebar ('hr' | 'employee').
 * @param {{ text: string, role: 'hr'|'employee' }} payload
 */
export const sendChatMessage = ({ text, role }) => async (dispatch, getState) => {
    if (!text?.trim()) return
    dispatch(addUserMessage(text))

    const { sessionId } = getState().chat
    const endpoint = role === 'hr' ? ChatEndpoints.HR_CHAT : ChatEndpoints.EMPLOYEE_CHAT

    try {
        const res = await apiService.post(endpoint, {
            message: text.trim(),
            ...(sessionId ? { sessionId } : {}),
        }, { withCredentials: true })

        dispatch(addAssistantMessage({
            reply:     res.data.reply,
            sessionId: res.data.sessionId,
        }))
    } catch (err) {
        const msg = err.response?.data?.message || 'AI service unavailable. Please try again.'
        dispatch(setError(msg))
    }
}

/**
 * Clear conversation history (both local state + server session).
 */
export const clearChat = () => async (dispatch, getState) => {
    const { sessionId } = getState().chat
    if (sessionId) {
        try {
            await apiService.delete(ChatEndpoints.CLEAR_SESSION(sessionId), { withCredentials: true })
        } catch { /* silent fail — local clear still happens */ }
    }
    dispatch(clearMessages())
}
