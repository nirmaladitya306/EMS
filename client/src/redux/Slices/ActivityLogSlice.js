import { createSlice } from '@reduxjs/toolkit'
import { HandleGetActivityLogs, HandleGetLogSummary, HandleClearOldLogs } from '../Thunks/ActivityLogThunk'

const ActivityLogSlice = createSlice({
    name: 'ActivityLog',
    initialState: {
        logs:       [],
        pagination: { total: 0, page: 1, limit: 50, totalPages: 1 },
        summary:    { total: 0, byRole: { hr: 0, employee: 0 }, byAction: [] },
        isLoading:  false,
        clearResult: null,
        error:      { status: false, message: null }
    },
    extraReducers: (builder) => {
        // GET ALL
        builder
            .addCase(HandleGetActivityLogs.pending,   (state) => { state.isLoading = true })
            .addCase(HandleGetActivityLogs.fulfilled, (state, action) => {
                state.isLoading  = false
                state.logs       = action.payload.data
                state.pagination = action.payload.pagination
                state.error      = { status: false, message: null }
            })
            .addCase(HandleGetActivityLogs.rejected,  (state, action) => {
                state.isLoading = false
                state.error     = { status: true, message: action.payload?.message }
            })

        // SUMMARY
        builder
            .addCase(HandleGetLogSummary.fulfilled, (state, action) => {
                state.summary = action.payload.data
            })

        // CLEAR
        builder
            .addCase(HandleClearOldLogs.pending,   (state) => { state.isLoading = true })
            .addCase(HandleClearOldLogs.fulfilled, (state, action) => {
                state.isLoading  = false
                state.clearResult = action.payload
            })
            .addCase(HandleClearOldLogs.rejected,  (state, action) => {
                state.isLoading = false
                state.error = { status: true, message: action.payload?.message }
            })
    }
})

export default ActivityLogSlice.reducer