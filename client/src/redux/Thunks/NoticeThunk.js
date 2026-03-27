import { createAsyncThunk } from '@reduxjs/toolkit'
import { apiService } from '../apis/APIService'
import { NoticeEndPoints } from '../apis/NoticeEndpoints'

export const HandleGetAllNotices = createAsyncThunk(
    'HandleGetAllNotices',
    async (_, { rejectWithValue }) => {
        try {
            const res = await apiService.get(NoticeEndPoints.GETALL, { withCredentials: true })
            return res.data
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: error.message })
        }
    }
)

export const HandleCreateNotice = createAsyncThunk(
    'HandleCreateNotice',
    async (data, { rejectWithValue }) => {
        try {
            const res = await apiService.post(NoticeEndPoints.CREATE, data, { withCredentials: true })
            return res.data
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: error.message })
        }
    }
)

export const HandleUpdateNotice = createAsyncThunk(
    'HandleUpdateNotice',
    async ({ noticeID, UpdatedData }, { rejectWithValue }) => {
        try {
            const res = await apiService.patch(NoticeEndPoints.UPDATE, { noticeID, UpdatedData }, { withCredentials: true })
            return res.data
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: error.message })
        }
    }
)

export const HandleDeleteNotice = createAsyncThunk(
    'HandleDeleteNotice',
    async ({ noticeID }, { rejectWithValue }) => {
        try {
            const res = await apiService.delete(NoticeEndPoints.DELETE(noticeID), { withCredentials: true })
            return res.data
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: error.message })
        }
    }
)