import { createAsyncThunk } from '@reduxjs/toolkit'
import { apiService } from '../apis/APIService'
import { RecruitmentEndPoints } from '../apis/RecruitmentEndpoints'

export const HandleGetAllRecruitments = createAsyncThunk('HandleGetAllRecruitments', async (_, { rejectWithValue }) => {
    try {
        const res = await apiService.get(RecruitmentEndPoints.GETALL, { withCredentials: true })
        return res.data
    } catch (error) {
        return rejectWithValue(error.response?.data || { message: error.message })
    }
})

export const HandleCreateRecruitment = createAsyncThunk('HandleCreateRecruitment', async (data, { rejectWithValue }) => {
    try {
        const res = await apiService.post(RecruitmentEndPoints.CREATE, data, { withCredentials: true })
        return res.data
    } catch (error) {
        return rejectWithValue(error.response?.data || { message: error.message })
    }
})

export const HandleDeleteRecruitment = createAsyncThunk('HandleDeleteRecruitment', async ({ recruitmentID }, { rejectWithValue }) => {
    try {
        const res = await apiService.delete(RecruitmentEndPoints.DELETE(recruitmentID), { withCredentials: true })
        return res.data
    } catch (error) {
        return rejectWithValue(error.response?.data || { message: error.message })
    }
})