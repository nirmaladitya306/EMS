import { createAsyncThunk } from '@reduxjs/toolkit'
import { apiService } from '../apis/APIService'

export const HandleGetHRAnalytics = createAsyncThunk(
    'HandleGetHRAnalytics',
    async (_, { rejectWithValue }) => {
        try {
            const res = await apiService.get('/v1/analytics/hr', { withCredentials: true })
            return res.data
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: error.message })
        }
    }
)

export const HandleGetEmployeeAnalytics = createAsyncThunk(
    'HandleGetEmployeeAnalytics',
    async (_, { rejectWithValue }) => {
        try {
            const res = await apiService.get('/v1/analytics/employee', { withCredentials: true })
            return res.data
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: error.message })
        }
    }
)