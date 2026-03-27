import { createSlice } from '@reduxjs/toolkit'
import { HandleGetAllRecruitments, HandleCreateRecruitment, HandleDeleteRecruitment } from '../Thunks/RecruitmentThunk'

const pending  = (state) => { state.isLoading = true;  state.error = { status: false, message: null } }
const rejected = (state, action) => { state.isLoading = false; state.error = { status: true, message: action.payload?.message } }

const RecruitmentSlice = createSlice({
    name: 'Recruitment',
    initialState: {
        data:      [],
        isLoading: false,
        fetchData: true,
        error:     { status: false, message: null }
    },
    extraReducers: (builder) => {
        builder
            .addCase(HandleGetAllRecruitments.pending,   pending)
            .addCase(HandleGetAllRecruitments.fulfilled, (state, action) => {
                state.isLoading = false
                state.data      = action.payload.data
                state.fetchData = false
            })
            .addCase(HandleGetAllRecruitments.rejected, rejected)

        builder
            .addCase(HandleCreateRecruitment.pending,   pending)
            .addCase(HandleCreateRecruitment.fulfilled, (state) => { state.isLoading = false; state.fetchData = true })
            .addCase(HandleCreateRecruitment.rejected,  rejected)

        builder
            .addCase(HandleDeleteRecruitment.pending,   pending)
            .addCase(HandleDeleteRecruitment.fulfilled, (state) => { state.isLoading = false; state.fetchData = true })
            .addCase(HandleDeleteRecruitment.rejected,  rejected)
    }
})

export default RecruitmentSlice.reducer