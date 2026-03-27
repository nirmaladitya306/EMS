import { createSlice } from '@reduxjs/toolkit'
import { HandleGetAllAttendances, HandleDeleteAttendance } from '../Thunks/AttendanceThunk'

const pending  = (state) => { state.isLoading = true;  state.error = { status: false, message: null } }
const rejected = (state, action) => { state.isLoading = false; state.error = { status: true, message: action.payload?.message } }

const AttendanceSlice = createSlice({
    name: 'Attendance',
    initialState: {
        data:      [],
        isLoading: false,
        fetchData: true,
        error:     { status: false, message: null }
    },
    extraReducers: (builder) => {
        builder
            .addCase(HandleGetAllAttendances.pending,   pending)
            .addCase(HandleGetAllAttendances.fulfilled, (state, action) => {
                state.isLoading = false
                state.data      = action.payload.data
                state.fetchData = false
            })
            .addCase(HandleGetAllAttendances.rejected, rejected)

        builder
            .addCase(HandleDeleteAttendance.pending,   pending)
            .addCase(HandleDeleteAttendance.fulfilled, (state) => { state.isLoading = false; state.fetchData = true })
            .addCase(HandleDeleteAttendance.rejected,  rejected)
    }
})

export default AttendanceSlice.reducer