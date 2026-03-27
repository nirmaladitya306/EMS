import { createAsyncThunk } from '@reduxjs/toolkit'
import { apiService } from '../apis/APIService'
import { RequestEndPoints } from '../apis/RequestEndpoints'

export const HandleGetAllRequests = createAsyncThunk('HandleGetAllRequests', async (_, { rejectWithValue }) => {
    try {
        const res = await apiService.get(RequestEndPoints.GETALL, { withCredentials: true })
        return res.data
    } catch (error) {
        return rejectWithValue(error.response?.data || { message: error.message })
    }
})

export const HandleUpdateRequestStatus = createAsyncThunk('HandleUpdateRequestStatus', async (data, { rejectWithValue }) => {
    try {
        const res = await apiService.patch(RequestEndPoints.UPDATE_STATUS, data, { withCredentials: true })
        return res.data
    } catch (error) {
        return rejectWithValue(error.response?.data || { message: error.message })
    }
})

export const HandleDeleteRequest = createAsyncThunk('HandleDeleteRequest', async ({ requestID }, { rejectWithValue }) => {
    try {
        const res = await apiService.delete(RequestEndPoints.DELETE(requestID), { withCredentials: true })
        return res.data
    } catch (error) {
        return rejectWithValue(error.response?.data || { message: error.message })
    }
})