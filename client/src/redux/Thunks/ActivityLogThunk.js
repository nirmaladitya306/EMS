import { createAsyncThunk } from '@reduxjs/toolkit'
import { apiService } from '../apis/APIService'
import { ActivityLogEndPoints } from '../apis/ActivityLogEndpoints'

export const HandleGetActivityLogs = createAsyncThunk(
    'HandleGetActivityLogs',
    async ({ page = 1, limit = 50, action, actorRole, from, to } = {}, { rejectWithValue }) => {
        try {
            const params = { page, limit }
            if (action)    params.action    = action
            if (actorRole) params.actorRole = actorRole
            if (from)      params.from      = from
            if (to)        params.to        = to
            const response = await apiService.get(ActivityLogEndPoints.GETALL, { params, withCredentials: true })
            return response.data
        } catch (error) {
            return rejectWithValue(error.response.data)
        }
    }
)

export const HandleGetLogSummary = createAsyncThunk(
    'HandleGetLogSummary',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiService.get(ActivityLogEndPoints.SUMMARY, { withCredentials: true })
            return response.data
        } catch (error) {
            return rejectWithValue(error.response.data)
        }
    }
)

export const HandleClearOldLogs = createAsyncThunk(
    'HandleClearOldLogs',
    async ({ days = 90 }, { rejectWithValue }) => {
        try {
            const response = await apiService.delete(ActivityLogEndPoints.CLEAR, {
                data: { days },
                withCredentials: true
            })
            return response.data
        } catch (error) {
            return rejectWithValue(error.response.data)
        }
    }
)