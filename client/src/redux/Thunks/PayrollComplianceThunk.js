import { createAsyncThunk } from '@reduxjs/toolkit'
import { apiService } from '../apis/APIService'

const BASE = '/v1/payroll-compliance'

export const HandleRunComplianceCheck = createAsyncThunk(
    'HandleRunComplianceCheck',
    async (_, { rejectWithValue }) => {
        try {
            const res = await apiService.get(`${BASE}/check`, { withCredentials: true })
            return res.data
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: error.message })
        }
    }
)

export const HandleRunSingleComplianceCheck = createAsyncThunk(
    'HandleRunSingleComplianceCheck',
    async (employeeID, { rejectWithValue }) => {
        try {
            const res = await apiService.get(`${BASE}/check/${employeeID}`, { withCredentials: true })
            return res.data
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: error.message })
        }
    }
)
