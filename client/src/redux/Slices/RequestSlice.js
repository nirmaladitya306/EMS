import { createSlice } from '@reduxjs/toolkit'
import { HandleGetAllRequests, HandleUpdateRequestStatus, HandleDeleteRequest } from '../Thunks/RequestThunk'

const pending  = (state) => { state.isLoading = true;  state.error = { status: false, message: null } }
const rejected = (state, action) => { state.isLoading = false; state.error = { status: true, message: action.payload?.message } }

const RequestSlice = createSlice({
    name: 'Request',
    initialState: {
        data:      [],
        isLoading: false,
        fetchData: true,
        error:     { status: false, message: null }
    },
    extraReducers: (builder) => {
        builder
            .addCase(HandleGetAllRequests.pending,   pending)
            .addCase(HandleGetAllRequests.fulfilled, (state, action) => {
                state.isLoading = false
                state.data      = action.payload.data
                state.fetchData = false
            })
            .addCase(HandleGetAllRequests.rejected, rejected)

        builder
            .addCase(HandleUpdateRequestStatus.pending,   pending)
            .addCase(HandleUpdateRequestStatus.fulfilled, (state) => { state.isLoading = false; state.fetchData = true })
            .addCase(HandleUpdateRequestStatus.rejected,  rejected)

        builder
            .addCase(HandleDeleteRequest.pending,   pending)
            .addCase(HandleDeleteRequest.fulfilled, (state) => { state.isLoading = false; state.fetchData = true })
            .addCase(HandleDeleteRequest.rejected,  rejected)
    }
})

export default RequestSlice.reducer