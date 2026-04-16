import { createAsyncThunk } from '@reduxjs/toolkit'
import { apiService } from '../apis/APIService'
import { HRProfileEndPoints } from '../apis/HRProfileEndpoints' // Ensure this path matches your project!

export const HandleGetAllHRProfiles = createAsyncThunk('HandleGetAllHRProfiles', async (_, { rejectWithValue }) => {
    try {
        const res = await apiService.get(HRProfileEndPoints.GETALL, { withCredentials: true })
        return res.data
    } catch (error) {
        return rejectWithValue(error.response?.data || { message: error.message })
    }
})

export const HandleDeleteHRProfile = createAsyncThunk('HandleDeleteHRProfile', async ({ HRID }, { rejectWithValue }) => {
    try {
        const res = await apiService.delete(HRProfileEndPoints.DELETE(HRID), { withCredentials: true })
        return res.data
    } catch (error) {
        return rejectWithValue(error.response?.data || { message: error.message })
    }
})

// ✅ Added Create HR Thunk
export const HandleCreateHRProfile = createAsyncThunk('HandleCreateHRProfile', async (hrData, { rejectWithValue }) => {
    try {
        const res = await apiService.post(HRProfileEndPoints.CREATE, hrData, { withCredentials: true })
        return res.data
    } catch (error) {
        return rejectWithValue(error.response?.data || { message: error.message })
    }
})