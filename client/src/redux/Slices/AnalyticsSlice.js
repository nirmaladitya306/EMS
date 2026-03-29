import { createSlice } from '@reduxjs/toolkit'
import { HandleGetHRAnalytics, HandleGetEmployeeAnalytics } from '../Thunks/AnalyticsThunk'

const pending  = (state) => { state.isLoading = true;  state.error = { status: false, message: null } }
const rejected = (state, action) => { state.isLoading = false; state.error = { status: true, message: action.payload?.message } }

const AnalyticsSlice = createSlice({
    name: 'Analytics',
    initialState: {
        hrData:       null,
        employeeData: null,
        isLoading:    false,
        error: { status: false, message: null }
    },
    extraReducers: (builder) => {
        builder
            .addCase(HandleGetHRAnalytics.pending,   pending)
            .addCase(HandleGetHRAnalytics.fulfilled, (state, action) => {
                state.isLoading = false
                state.hrData    = action.payload.data
                state.error     = { status: false, message: null }
            })
            .addCase(HandleGetHRAnalytics.rejected,  rejected)

        builder
            .addCase(HandleGetEmployeeAnalytics.pending,   pending)
            .addCase(HandleGetEmployeeAnalytics.fulfilled, (state, action) => {
                state.isLoading     = false
                state.employeeData  = action.payload.data
                state.error         = { status: false, message: null }
            })
            .addCase(HandleGetEmployeeAnalytics.rejected,  rejected)
    }
})

export default AnalyticsSlice.reducer