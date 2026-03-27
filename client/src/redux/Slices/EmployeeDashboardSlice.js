import { createSlice } from '@reduxjs/toolkit'
import {
    HandleGetEmployeeProfile, HandleGetMyLeaves, HandleGetMySalaries,
    HandleGetMyNotices, HandleGetMyAttendance, HandleGetMyRequests,
    HandleApplyLeave, HandleUpdateMyLeave, HandleDeleteMyLeave,
    HandleSubmitRequest, HandleUpdateMyRequest,
    HandleInitializeMyAttendance, HandleMarkAttendance, HandleUpdateMyProfile
} from '../Thunks/EmployeeDashboardThunk'

const pending  = (state) => { state.isLoading = true;  state.error = { status: false, message: null } }
const rejected = (state, action) => { state.isLoading = false; state.error = { status: true, message: action.payload?.message } }

const EmployeeDashboardSlice = createSlice({
    name: 'EmployeeDashboard',
    initialState: {
        profile:    null,
        leaves:     [],
        salaries:   [],
        notices:    [],
        attendance: null,
        requests:   [],
        isLoading:  false,
        fetchLeaves:    true,
        fetchSalaries:  true,
        fetchNotices:   true,
        fetchAttendance:true,
        fetchRequests:  true,
        error: { status: false, message: null }
    },
    extraReducers: (builder) => {
        // Profile
        builder
            .addCase(HandleGetEmployeeProfile.pending,   pending)
            .addCase(HandleGetEmployeeProfile.fulfilled, (state, action) => {
                state.isLoading = false
                state.profile   = action.payload.data
            })
            .addCase(HandleGetEmployeeProfile.rejected, rejected)

        builder
            .addCase(HandleUpdateMyProfile.pending,   pending)
            .addCase(HandleUpdateMyProfile.fulfilled, (state) => { state.isLoading = false })
            .addCase(HandleUpdateMyProfile.rejected,  rejected)

        // Leaves
        builder
            .addCase(HandleGetMyLeaves.pending,   pending)
            .addCase(HandleGetMyLeaves.fulfilled, (state, action) => {
                state.isLoading  = false
                state.leaves     = action.payload.data || []
                state.fetchLeaves = false
            })
            .addCase(HandleGetMyLeaves.rejected, rejected)

        builder
            .addCase(HandleApplyLeave.pending,   pending)
            .addCase(HandleApplyLeave.fulfilled, (state) => { state.isLoading = false; state.fetchLeaves = true })
            .addCase(HandleApplyLeave.rejected,  rejected)

        builder
            .addCase(HandleUpdateMyLeave.pending,   pending)
            .addCase(HandleUpdateMyLeave.fulfilled, (state) => { state.isLoading = false; state.fetchLeaves = true })
            .addCase(HandleUpdateMyLeave.rejected,  rejected)

        builder
            .addCase(HandleDeleteMyLeave.pending,   pending)
            .addCase(HandleDeleteMyLeave.fulfilled, (state) => { state.isLoading = false; state.fetchLeaves = true })
            .addCase(HandleDeleteMyLeave.rejected,  rejected)

        // Salaries
        builder
            .addCase(HandleGetMySalaries.pending,   pending)
            .addCase(HandleGetMySalaries.fulfilled, (state, action) => {
                state.isLoading   = false
                state.salaries    = action.payload.data || []
                state.fetchSalaries = false
            })
            .addCase(HandleGetMySalaries.rejected, rejected)

        // Notices
        builder
            .addCase(HandleGetMyNotices.pending,   pending)
            .addCase(HandleGetMyNotices.fulfilled, (state, action) => {
                state.isLoading   = false
                state.notices     = action.payload.data || []
                state.fetchNotices = false
            })
            .addCase(HandleGetMyNotices.rejected, rejected)

        // Attendance
        builder
            .addCase(HandleGetMyAttendance.pending,   pending)
            .addCase(HandleGetMyAttendance.fulfilled, (state, action) => {
                state.isLoading      = false
                state.attendance     = action.payload.data
                state.fetchAttendance = false
            })
            .addCase(HandleGetMyAttendance.rejected, rejected)

        builder
            .addCase(HandleInitializeMyAttendance.pending,   pending)
            .addCase(HandleInitializeMyAttendance.fulfilled, (state) => { state.isLoading = false; state.fetchAttendance = true })
            .addCase(HandleInitializeMyAttendance.rejected,  rejected)

        builder
            .addCase(HandleMarkAttendance.pending,   pending)
            .addCase(HandleMarkAttendance.fulfilled, (state) => { state.isLoading = false; state.fetchAttendance = true })
            .addCase(HandleMarkAttendance.rejected,  rejected)

        // Requests
        builder
            .addCase(HandleGetMyRequests.pending,   pending)
            .addCase(HandleGetMyRequests.fulfilled, (state, action) => {
                state.isLoading   = false
                state.requests    = action.payload.data || []
                state.fetchRequests = false
            })
            .addCase(HandleGetMyRequests.rejected, rejected)

        builder
            .addCase(HandleSubmitRequest.pending,   pending)
            .addCase(HandleSubmitRequest.fulfilled, (state) => { state.isLoading = false; state.fetchRequests = true })
            .addCase(HandleSubmitRequest.rejected,  rejected)

        builder
            .addCase(HandleUpdateMyRequest.pending,   pending)
            .addCase(HandleUpdateMyRequest.fulfilled, (state) => { state.isLoading = false; state.fetchRequests = true })
            .addCase(HandleUpdateMyRequest.rejected,  rejected)
    }
})

export default EmployeeDashboardSlice.reducer