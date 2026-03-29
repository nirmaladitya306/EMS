import { createSlice } from '@reduxjs/toolkit'
import {
    HandleGetAllClearances,
    HandleGetClearanceSummary,
    HandleGetClearance,
    HandleCreateExitClearance,
    HandleToggleChecklistItem,
    HandleUpdateClearanceStatus,
    HandleUpdateClearanceDetails,
    HandleDeleteClearance,
} from '../Thunks/ExitClearanceThunk'

const pending  = (state) => { state.isLoading = true;  state.error = { status: false, message: null } }
const rejected = (state, action) => { state.isLoading = false; state.error = { status: true, message: action.payload?.message } }

// Replace the active clearance in the list with the updated version
const replaceInList = (state, updated) => {
    state.clearances = state.clearances.map(c => c._id === updated._id ? updated : c)
    if (state.activeClearance?._id === updated._id) state.activeClearance = updated
}

const ExitClearanceSlice = createSlice({
    name: 'ExitClearance',
    initialState: {
        clearances:      [],
        activeClearance: null,
        summary: {
            total: 0, pending: 0, inProgress: 0, cleared: 0, rejected: 0
        },
        isLoading:  false,
        fetchData:  true,
        error: { status: false, message: null }
    },
    extraReducers: (builder) => {

        // GET ALL
        builder
            .addCase(HandleGetAllClearances.pending,   pending)
            .addCase(HandleGetAllClearances.fulfilled, (state, action) => {
                state.isLoading  = false
                state.clearances = action.payload.data
                state.fetchData  = false
                state.error      = { status: false, message: null }
            })
            .addCase(HandleGetAllClearances.rejected,  rejected)

        // SUMMARY
        builder
            .addCase(HandleGetClearanceSummary.fulfilled, (state, action) => {
                state.summary = action.payload.data
            })

        // GET ONE
        builder
            .addCase(HandleGetClearance.pending,   pending)
            .addCase(HandleGetClearance.fulfilled, (state, action) => {
                state.isLoading      = false
                state.activeClearance = action.payload.data
            })
            .addCase(HandleGetClearance.rejected,  rejected)

        // CREATE
        builder
            .addCase(HandleCreateExitClearance.pending,   pending)
            .addCase(HandleCreateExitClearance.fulfilled, (state, action) => {
                state.isLoading = false
                state.clearances.unshift(action.payload.data)
                state.fetchData = true
            })
            .addCase(HandleCreateExitClearance.rejected,  rejected)

        // TOGGLE CHECKLIST
        builder
            .addCase(HandleToggleChecklistItem.pending,   pending)
            .addCase(HandleToggleChecklistItem.fulfilled, (state, action) => {
                state.isLoading = false
                replaceInList(state, action.payload.data)
            })
            .addCase(HandleToggleChecklistItem.rejected,  rejected)

        // UPDATE STATUS
        builder
            .addCase(HandleUpdateClearanceStatus.pending,   pending)
            .addCase(HandleUpdateClearanceStatus.fulfilled, (state, action) => {
                state.isLoading = false
                replaceInList(state, action.payload.data)
                state.fetchData = true
            })
            .addCase(HandleUpdateClearanceStatus.rejected,  rejected)

        // UPDATE DETAILS
        builder
            .addCase(HandleUpdateClearanceDetails.pending,   pending)
            .addCase(HandleUpdateClearanceDetails.fulfilled, (state, action) => {
                state.isLoading = false
                replaceInList(state, action.payload.data)
            })
            .addCase(HandleUpdateClearanceDetails.rejected,  rejected)

        // DELETE
        builder
            .addCase(HandleDeleteClearance.pending,   pending)
            .addCase(HandleDeleteClearance.fulfilled, (state, action) => {
                state.isLoading  = false
                state.clearances = state.clearances.filter(c => c._id !== action.payload.clearanceID)
                if (state.activeClearance?._id === action.payload.clearanceID) state.activeClearance = null
                state.fetchData  = true
            })
            .addCase(HandleDeleteClearance.rejected,  rejected)
    }
})

export default ExitClearanceSlice.reducer