import { createSlice } from '@reduxjs/toolkit'
import { HandleRunComplianceCheck, HandleRunSingleComplianceCheck } from '../Thunks/PayrollComplianceThunk'

const PayrollComplianceSlice = createSlice({
    name: 'PayrollCompliance',
    initialState: {
        data:        null,   // full org report
        orgSummary:  null,
        singleCheck: null,   // result of per-employee check
        isLoading:   false,
        error:       { status: false, message: null },
    },
    reducers: {
        clearSingleCheck: (state) => { state.singleCheck = null },
    },
    extraReducers: (builder) => {
        const pending  = (state) => { state.isLoading = true;  state.error = { status: false, message: null } }
        const rejected = (state, action) => { state.isLoading = false; state.error = { status: true, message: action.payload?.message } }

        builder
            .addCase(HandleRunComplianceCheck.pending,   pending)
            .addCase(HandleRunComplianceCheck.fulfilled, (state, action) => {
                state.isLoading  = false
                state.data       = action.payload.data
                state.orgSummary = action.payload.orgSummary
            })
            .addCase(HandleRunComplianceCheck.rejected,  rejected)

        builder
            .addCase(HandleRunSingleComplianceCheck.pending,   pending)
            .addCase(HandleRunSingleComplianceCheck.fulfilled, (state, action) => {
                state.isLoading  = false
                state.singleCheck = action.payload.data
            })
            .addCase(HandleRunSingleComplianceCheck.rejected,  rejected)
    },
})

export const { clearSingleCheck } = PayrollComplianceSlice.actions
export default PayrollComplianceSlice.reducer
