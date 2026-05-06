import { createSlice } from '@reduxjs/toolkit'
import { HandleGetAllHRProfiles, HandleDeleteHRProfile, HandleCreateHRProfile } from '../Thunks/HRProfileThunk'

const pending  = (state) => { state.isLoading = true;  state.error = { status: false, message: null } }
const rejected = (state, action) => { state.isLoading = false; state.error = { status: true, message: action.payload?.message } }

const HRProfileSlice = createSlice({
    name: 'HRProfile',
    initialState: {
        data:      [],
        isLoading: false,
        fetchData: true,
        error:     { status: false, message: null }
    },
    extraReducers: (builder) => {
        builder
            .addCase(HandleGetAllHRProfiles.pending,   pending)
            .addCase(HandleGetAllHRProfiles.fulfilled, (state, action) => {
                state.isLoading = false
                state.data      = action.payload.data
                state.fetchData = false
            })
            .addCase(HandleGetAllHRProfiles.rejected, rejected)

        builder
            .addCase(HandleDeleteHRProfile.pending,   pending)
            .addCase(HandleDeleteHRProfile.fulfilled, (state) => { state.isLoading = false; state.fetchData = true })
            .addCase(HandleDeleteHRProfile.rejected,  rejected)

        // ✅ Added Create HR Reducer
        builder
            .addCase(HandleCreateHRProfile.pending,   pending)
            .addCase(HandleCreateHRProfile.fulfilled, (state) => { state.isLoading = false; state.fetchData = true })
            .addCase(HandleCreateHRProfile.rejected,  rejected)
    }
})

export default HRProfileSlice.reducer