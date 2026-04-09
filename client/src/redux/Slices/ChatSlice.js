import { createSlice } from '@reduxjs/toolkit'

const ChatSlice = createSlice({
    name: 'chat',
    initialState: {
        messages:   [],   // [{ id, role: 'user'|'assistant', text, ts }]
        sessionId:  null,
        isOpen:     false,
        isLoading:  false,
        error:      null,
    },
    reducers: {
        openChat:  (state) => { state.isOpen = true  },
        closeChat: (state) => { state.isOpen = false },
        toggleChat:(state) => { state.isOpen = !state.isOpen },

        addUserMessage: (state, action) => {
            state.messages.push({
                id:   Date.now(),
                role: 'user',
                text: action.payload,
                ts:   new Date().toISOString(),
            })
            state.error   = null
            state.isLoading = true
        },

        addAssistantMessage: (state, action) => {
            state.isLoading = false
            state.messages.push({
                id:   Date.now() + 1,
                role: 'assistant',
                text: action.payload.reply,
                ts:   new Date().toISOString(),
            })
            if (action.payload.sessionId) state.sessionId = action.payload.sessionId
        },

        setError: (state, action) => {
            state.isLoading = false
            state.error     = action.payload
        },

        clearMessages: (state) => {
            state.messages  = []
            state.sessionId = null
            state.error     = null
        },
    },
})

export const {
    openChat, closeChat, toggleChat,
    addUserMessage, addAssistantMessage,
    setError, clearMessages,
} = ChatSlice.actions

export default ChatSlice.reducer
