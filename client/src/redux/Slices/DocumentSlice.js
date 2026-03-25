import { createSlice } from '@reduxjs/toolkit'
import {
    HandleGetDocuments,
    HandleGetDocumentSummary,
    HandleCreateDocument,
    HandleUpdateDocument,
    HandleDeleteDocument,
    HandleRunAlertEngine
} from '../Thunks/DocumentThunk'

const DocumentSlice = createSlice({
    name: 'Documents',
    initialState: {
        data: [],
        summary: { total: 0, valid: 0, expiringSoon: 0, expired: 0 },
        isLoading: false,
        fetchData: true,
        alertResult: null,
        error: { status: false, message: null, content: null }
    },
    extraReducers: (builder) => {
        // GET ALL
        builder
            .addCase(HandleGetDocuments.pending, (state) => { state.isLoading = true })
            .addCase(HandleGetDocuments.fulfilled, (state, action) => {
                state.isLoading = false
                state.data      = action.payload.data
                state.fetchData = false
                state.error     = { status: false, message: null, content: null }
            })
            .addCase(HandleGetDocuments.rejected, (state, action) => {
                state.isLoading = false
                state.error     = { status: true, message: action.payload?.message, content: action.payload }
            })

        // SUMMARY
        builder
            .addCase(HandleGetDocumentSummary.fulfilled, (state, action) => {
                state.summary = action.payload.data
            })

        // CREATE
        builder
            .addCase(HandleCreateDocument.pending,   (state) => { state.isLoading = true })
            .addCase(HandleCreateDocument.fulfilled, (state) => { state.isLoading = false; state.fetchData = true })
            .addCase(HandleCreateDocument.rejected,  (state, action) => {
                state.isLoading = false
                state.error = { status: true, message: action.payload?.message, content: action.payload }
            })

        // UPDATE
        builder
            .addCase(HandleUpdateDocument.pending,   (state) => { state.isLoading = true })
            .addCase(HandleUpdateDocument.fulfilled, (state) => { state.isLoading = false; state.fetchData = true })
            .addCase(HandleUpdateDocument.rejected,  (state, action) => {
                state.isLoading = false
                state.error = { status: true, message: action.payload?.message, content: action.payload }
            })

        // DELETE
        builder
            .addCase(HandleDeleteDocument.pending,   (state) => { state.isLoading = true })
            .addCase(HandleDeleteDocument.fulfilled, (state) => { state.isLoading = false; state.fetchData = true })
            .addCase(HandleDeleteDocument.rejected,  (state, action) => {
                state.isLoading = false
                state.error = { status: true, message: action.payload?.message, content: action.payload }
            })

        // ALERT ENGINE
        builder
            .addCase(HandleRunAlertEngine.pending,   (state) => { state.isLoading = true })
            .addCase(HandleRunAlertEngine.fulfilled, (state, action) => {
                state.isLoading  = false
                state.alertResult = action.payload
            })
            .addCase(HandleRunAlertEngine.rejected,  (state, action) => {
                state.isLoading = false
                state.error = { status: true, message: action.payload?.message, content: action.payload }
            })
    }
})

export default DocumentSlice.reducer