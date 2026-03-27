import { createSlice } from '@reduxjs/toolkit'
import { HandleGetAllSalaries, HandleCreateSalary, HandleUpdateSalary, HandleDeleteSalary } from '../Thunks/SalaryThunk'

const SalarySlice = createSlice({
    name: 'Salary',
    initialState: {
        data:      [],
        isLoading: false,
        fetchData: true,
        error:     { status: false, message: null }
    },
    extraReducers: (builder) => {
        const pending   = (state) => { state.isLoading = true; state.error = { status: false, message: null } }
        const rejected  = (state, action) => { state.isLoading = false; state.error = { status: true, message: action.payload?.message } }

        builder
            .addCase(HandleGetAllSalaries.pending,   pending)
            .addCase(HandleGetAllSalaries.fulfilled, (state, action) => {
                state.isLoading = false
                state.data      = action.payload.data
                state.fetchData = false
            })
            .addCase(HandleGetAllSalaries.rejected, rejected)

        builder
            .addCase(HandleCreateSalary.pending,   pending)
            .addCase(HandleCreateSalary.fulfilled, (state) => { state.isLoading = false; state.fetchData = true })
            .addCase(HandleCreateSalary.rejected,  rejected)

        builder
            .addCase(HandleUpdateSalary.pending,   pending)
            .addCase(HandleUpdateSalary.fulfilled, (state) => { state.isLoading = false; state.fetchData = true })
            .addCase(HandleUpdateSalary.rejected,  rejected)

        builder
            .addCase(HandleDeleteSalary.pending,   pending)
            .addCase(HandleDeleteSalary.fulfilled, (state) => { state.isLoading = false; state.fetchData = true })
            .addCase(HandleDeleteSalary.rejected,  rejected)
    }
})

export default SalarySlice.reducer