import { createAsyncThunk } from '@reduxjs/toolkit'
import { apiService } from '../apis/APIService'
import { InterviewEndPoints } from '../apis/InterviewEndpoints'

export const HandleGetAllInterviews = createAsyncThunk('HandleGetAllInterviews', async (_, { rejectWithValue }) => {
    try {
        const res = await apiService.get(InterviewEndPoints.GETALL, { withCredentials: true })
        return res.data
    } catch (error) {
        return rejectWithValue(error.response?.data || { message: error.message })
    }
})

export const HandleUpdateInterview = createAsyncThunk('HandleUpdateInterview', async (data, { rejectWithValue }) => {
    try {
        const res = await apiService.patch(InterviewEndPoints.UPDATE, data, { withCredentials: true })
        return res.data
    } catch (error) {
        return rejectWithValue(error.response?.data || { message: error.message })
    }
})

export const HandleDeleteInterview = createAsyncThunk('HandleDeleteInterview', async ({ interviewID }, { rejectWithValue }) => {
    try {
        const res = await apiService.delete(InterviewEndPoints.DELETE(interviewID), { withCredentials: true })
        return res.data
    } catch (error) {
        return rejectWithValue(error.response?.data || { message: error.message })
    }
})