import { createSlice } from '@reduxjs/toolkit'
import { HandleGetAllInterviews, HandleUpdateInterview, HandleDeleteInterview } from '../Thunks/InterviewThunk'

const pending  = (state) => { state.isLoading = true;  state.error = { status: false, message: null } }
const rejected = (state, action) => { state.isLoading = false; state.error = { status: true, message: action.payload?.message } }

const InterviewSlice = createSlice({
    name: 'Interview',
    initialState: {
        data:      [],
        isLoading: false,
        fetchData: true,
        error:     { status: false, message: null }
    },
    extraReducers: (builder) => {
        builder
            .addCase(HandleGetAllInterviews.pending,   pending)
            .addCase(HandleGetAllInterviews.fulfilled, (state, action) => {
                state.isLoading = false
                state.data      = action.payload.data
                state.fetchData = false
            })
            .addCase(HandleGetAllInterviews.rejected, rejected)

        builder
            .addCase(HandleUpdateInterview.pending,   pending)
            .addCase(HandleUpdateInterview.fulfilled, (state) => { state.isLoading = false; state.fetchData = true })
            .addCase(HandleUpdateInterview.rejected,  rejected)

        builder
            .addCase(HandleDeleteInterview.pending,   pending)
            .addCase(HandleDeleteInterview.fulfilled, (state) => { state.isLoading = false; state.fetchData = true })
            .addCase(HandleDeleteInterview.rejected,  rejected)
    }
})

export default InterviewSlice.reducer