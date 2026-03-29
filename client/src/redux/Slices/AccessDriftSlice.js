import { createSlice } from '@reduxjs/toolkit'
import {
    HandleGetAllDriftEvents,
    HandleGetDriftSummary,
    HandleResolveDrift,
    HandleDismissDrift,
    HandleGetMyDriftEvents
} from '../Thunks/AccessDriftThunk'

const AccessDriftSlice = createSlice({
    name: 'AccessDrift',
    initialState: {
        drifts:     [],
        myDrifts:   [],
        pagination: { total: 0, page: 1, limit: 50, totalPages: 1 },
        summary: {
            total: 0, open: 0, resolved: 0, dismissed: 0,
            critical: 0, high: 0, bySeverity: [], byType: []
        },
        isLoading:  false,
        error:      { status: false, message: null }
    },
    extraReducers: (builder) => {
        // GET ALL
        builder
            .addCase(HandleGetAllDriftEvents.pending,   (state) => { state.isLoading = true })
            .addCase(HandleGetAllDriftEvents.fulfilled, (state, action) => {
                state.isLoading  = false
                state.drifts     = action.payload.data
                state.pagination = action.payload.pagination
                state.error      = { status: false, message: null }
            })
            .addCase(HandleGetAllDriftEvents.rejected,  (state, action) => {
                state.isLoading = false
                state.error     = { status: true, message: action.payload?.message }
            })

        // SUMMARY
        builder
            .addCase(HandleGetDriftSummary.fulfilled, (state, action) => {
                state.summary = action.payload.data
            })

        // RESOLVE
        builder
            .addCase(HandleResolveDrift.fulfilled, (state, action) => {
                const updated = action.payload.data
                state.drifts = state.drifts.map(d => d._id === updated._id ? updated : d)
            })

        // DISMISS
        builder
            .addCase(HandleDismissDrift.fulfilled, (state, action) => {
                const updated = action.payload.data
                state.drifts = state.drifts.map(d => d._id === updated._id ? updated : d)
            })

        // MY DRIFTS (Employee)
        builder
            .addCase(HandleGetMyDriftEvents.pending,   (state) => { state.isLoading = true })
            .addCase(HandleGetMyDriftEvents.fulfilled, (state, action) => {
                state.isLoading = false
                state.myDrifts  = action.payload.data
            })
            .addCase(HandleGetMyDriftEvents.rejected,  (state, action) => {
                state.isLoading = false
                state.error     = { status: true, message: action.payload?.message }
            })
    }
})

export default AccessDriftSlice.reducer