import { createAsyncThunk } from '@reduxjs/toolkit'
import { apiService } from '../apis/APIService'
import { AccessDriftEndPoints } from '../apis/AccessDriftEndpoints'

export const HandleGetAllDriftEvents = createAsyncThunk(
    'HandleGetAllDriftEvents',
    async ({ page = 1, limit = 50, status, severity, driftType } = {}, { rejectWithValue }) => {
        try {
            const params = { page, limit }
            if (status && status !== 'ALL')       params.status    = status
            if (severity && severity !== 'ALL')   params.severity  = severity
            if (driftType && driftType !== 'ALL') params.driftType = driftType
            const response = await apiService.get(AccessDriftEndPoints.GETALL, { params, withCredentials: true })
            return response.data
        } catch (error) {
            return rejectWithValue(error.response?.data)
        }
    }
)

export const HandleGetDriftSummary = createAsyncThunk(
    'HandleGetDriftSummary',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiService.get(AccessDriftEndPoints.SUMMARY, { withCredentials: true })
            return response.data
        } catch (error) {
            return rejectWithValue(error.response?.data)
        }
    }
)

export const HandleResolveDrift = createAsyncThunk(
    'HandleResolveDrift',
    async ({ driftID, resolutionNote }, { rejectWithValue }) => {
        try {
            const response = await apiService.patch(
                AccessDriftEndPoints.RESOLVE(driftID),
                { resolutionNote },
                { withCredentials: true }
            )
            return response.data
        } catch (error) {
            return rejectWithValue(error.response?.data)
        }
    }
)

export const HandleDismissDrift = createAsyncThunk(
    'HandleDismissDrift',
    async ({ driftID, resolutionNote }, { rejectWithValue }) => {
        try {
            const response = await apiService.patch(
                AccessDriftEndPoints.DISMISS(driftID),
                { resolutionNote },
                { withCredentials: true }
            )
            return response.data
        } catch (error) {
            return rejectWithValue(error.response?.data)
        }
    }
)

export const HandleGetMyDriftEvents = createAsyncThunk(
    'HandleGetMyDriftEvents',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiService.get(AccessDriftEndPoints.MY_DRIFTS, { withCredentials: true })
            return response.data
        } catch (error) {
            return rejectWithValue(error.response?.data)
        }
    }
)
