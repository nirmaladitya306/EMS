import { createSlice } from '@reduxjs/toolkit'

// ─── Per-role initial state factory ──────────────────────────────────────────
const chatState = () => ({
    messages:  [],   // [{ id, role: 'user'|'assistant', text, ts }]
    sessionId: null,
    isOpen:    false,
    isLoading: false,
    error:     null,
})

// ─── Helper: mutate the correct role bucket ───────────────────────────────────
// Every action payload carries { role: 'hr'|'employee', ... }
// This keeps reducers DRY while keeping state fully isolated.
const forRole = (state, role) => state[role] ?? state.hr

const ChatSlice = createSlice({
    name: 'chat',
    initialState: {
        hr:       chatState(),
        employee: chatState(),
    },
    reducers: {
        openChat: (state, { payload: role }) => {
            forRole(state, role).isOpen = true
        },
        closeChat: (state, { payload: role }) => {
            forRole(state, role).isOpen = false
        },
        toggleChat: (state, { payload: role }) => {
            const r = forRole(state, role)
            r.isOpen = !r.isOpen
        },

        addUserMessage: (state, { payload: { role, text } }) => {
            const r = forRole(state, role)
            r.messages.push({ id: Date.now(), role: 'user', text, ts: new Date().toISOString() })
            r.error     = null
            r.isLoading = true
        },

        addAssistantMessage: (state, { payload: { role, reply, sessionId } }) => {
            const r = forRole(state, role)
            r.isLoading = false
            r.messages.push({ id: Date.now() + 1, role: 'assistant', text: reply, ts: new Date().toISOString() })
            if (sessionId) r.sessionId = sessionId
        },

        setError: (state, { payload: { role, message } }) => {
            const r = forRole(state, role)
            r.isLoading = false
            r.error     = message
        },

        clearMessages: (state, { payload: role }) => {
            state[role] = chatState()
        },
    },
})

export const {
    openChat, closeChat, toggleChat,
    addUserMessage, addAssistantMessage,
    setError, clearMessages,
} = ChatSlice.actions

export default ChatSlice.reducer