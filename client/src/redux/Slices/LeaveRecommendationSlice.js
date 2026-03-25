import { createSlice } from '@reduxjs/toolkit'
import { HandleGetLeaveRecommendation, HandleGetOrgLeaveSummary } from '../Thunks/LeaveRecommendationThunk'

const LeaveRecommendationSlice = createSlice({
    name: 'LeaveRecommendation',
    initialState: {
        recommendation: null,
        orgSummary:     [],
        isLoading:      false,
        error:          { status: false, message: null }
    },
    extraReducers: (builder) => {
        builder
            .addCase(HandleGetLeaveRecommendation.pending,   (state) => { state.isLoading = true; state.recommendation = null })
            .addCase(HandleGetLeaveRecommendation.fulfilled, (state, action) => {
                state.isLoading      = false
                state.recommendation = action.payload.data
                state.error          = { status: false, message: null }
            })
            .addCase(HandleGetLeaveRecommendation.rejected,  (state, action) => {
                state.isLoading = false
                state.error     = { status: true, message: action.payload?.message }
            })

        builder
            .addCase(HandleGetOrgLeaveSummary.pending,   (state) => { state.isLoading = true })
            .addCase(HandleGetOrgLeaveSummary.fulfilled, (state, action) => {
                state.isLoading = false
                state.orgSummary = action.payload.data
            })
            .addCase(HandleGetOrgLeaveSummary.rejected,  (state, action) => {
                state.isLoading = false
                state.error = { status: true, message: action.payload?.message }
            })
    }
})

export default LeaveRecommendationSlice.reducer