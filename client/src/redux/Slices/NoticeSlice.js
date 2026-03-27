import { createSlice } from '@reduxjs/toolkit'
import { HandleGetAllNotices, HandleCreateNotice, HandleUpdateNotice, HandleDeleteNotice } from '../Thunks/NoticeThunk'

const NoticeSlice = createSlice({
    name: 'Notice',
    initialState: {
        departmentNotices: [],
        employeeNotices:   [],
        isLoading:  false,
        fetchData:  true,
        error:      { status: false, message: null }
    },
    extraReducers: (builder) => {
        const pending  = (state) => { state.isLoading = true; state.error = { status: false, message: null } }
        const rejected = (state, action) => { state.isLoading = false; state.error = { status: true, message: action.payload?.message } }
        const refetch  = (state) => { state.isLoading = false; state.fetchData = true }

        builder
            .addCase(HandleGetAllNotices.pending, pending)
            .addCase(HandleGetAllNotices.fulfilled, (state, action) => {
                state.isLoading        = false
                state.departmentNotices = action.payload.data?.department_notices || []
                state.employeeNotices   = action.payload.data?.employee_notices   || []
                state.fetchData        = false
            })
            .addCase(HandleGetAllNotices.rejected, rejected)

        builder
            .addCase(HandleCreateNotice.pending,   pending)
            .addCase(HandleCreateNotice.fulfilled, refetch)
            .addCase(HandleCreateNotice.rejected,  rejected)

        builder
            .addCase(HandleUpdateNotice.pending,   pending)
            .addCase(HandleUpdateNotice.fulfilled, refetch)
            .addCase(HandleUpdateNotice.rejected,  rejected)

        builder
            .addCase(HandleDeleteNotice.pending,   pending)
            .addCase(HandleDeleteNotice.fulfilled, refetch)
            .addCase(HandleDeleteNotice.rejected,  rejected)
    }
})

export default NoticeSlice.reducer
