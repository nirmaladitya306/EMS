import { createAsyncThunk } from '@reduxjs/toolkit'
import { apiService } from '../apis/APIService'
import { AttendanceEndPoints } from '../apis/AttendanceEndpoints'

export const HandleGetAllAttendances = createAsyncThunk('HandleGetAllAttendances', async (_, { rejectWithValue }) => {
    try {
        const res = await apiService.get(AttendanceEndPoints.GETALL, { withCredentials: true })
        return res.data
    } catch (error) {
        return rejectWithValue(error.response?.data || { message: error.message })
    }
})

export const HandleDeleteAttendance = createAsyncThunk('HandleDeleteAttendance', async ({ attendanceID }, { rejectWithValue }) => {
    try {
        const res = await apiService.delete(AttendanceEndPoints.DELETE(attendanceID), { withCredentials: true })
        return res.data
    } catch (error) {
        return rejectWithValue(error.response?.data || { message: error.message })
    }
})

export const HandleGetMyAttendance = createAsyncThunk('HandleGetMyAttendance', async (_, { rejectWithValue }) => {
    try {
        const res = await apiService.get(AttendanceEndPoints.MY_ATTENDANCE, { withCredentials: true })
        return res.data
    } catch (error) {
        return rejectWithValue(error.response?.data || { message: error.message })
    }
})

export const HandleInitializeAttendance = createAsyncThunk('HandleInitializeAttendance', async (data, { rejectWithValue }) => {
    try {
        const res = await apiService.post(AttendanceEndPoints.INITIALIZE, data, { withCredentials: true })
        return res.data
    } catch (error) {
        return rejectWithValue(error.response?.data || { message: error.message })
    }
})

export const HandleUpdateAttendance = createAsyncThunk('HandleUpdateAttendance', async (data, { rejectWithValue }) => {
    try {
        const res = await apiService.patch(AttendanceEndPoints.UPDATE, data, { withCredentials: true })
        return res.data
    } catch (error) {
        return rejectWithValue(error.response?.data || { message: error.message })
    }
})