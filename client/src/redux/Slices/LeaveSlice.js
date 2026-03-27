import { createSlice } from '@reduxjs/toolkit'
import { HandleGetAllLeaves, HandleHRUpdateLeave } from '../Thunks/LeaveThunk'

const pending  = (state) => { state.isLoading = true;  state.error = { status: false, message: null } }
const rejected = (state, action) => { state.isLoading = false; state.error = { status: true, message: action.payload?.message } }

const LeaveSlice = createSlice({
    name: 'Leave',
    initialState: {
        data:      [],
        isLoading: false,
        fetchData: true,
        error:     { status: false, message: null }
    },
    extraReducers: (builder) => {
        builder
            .addCase(HandleGetAllLeaves.pending,   pending)
            .addCase(HandleGetAllLeaves.fulfilled, (state, action) => {
                state.isLoading = false
                state.data      = action.payload.data
                state.fetchData = false
            })
            .addCase(HandleGetAllLeaves.rejected, rejected)

        builder
            .addCase(HandleHRUpdateLeave.pending,   pending)
            .addCase(HandleHRUpdateLeave.fulfilled, (state) => { state.isLoading = false; state.fetchData = true })
            .addCase(HandleHRUpdateLeave.rejected,  rejected)
    }
})

export default LeaveSlice.reducer