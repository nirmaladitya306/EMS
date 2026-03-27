import { createAsyncThunk } from '@reduxjs/toolkit'
import { apiService } from '../apis/APIService'
import { LeaveEndPoints } from '../apis/LeaveEndpoints'

export const HandleGetAllLeaves = createAsyncThunk('HandleGetAllLeaves', async (_, { rejectWithValue }) => {
    try {
        const res = await apiService.get(LeaveEndPoints.GETALL, { withCredentials: true })
        return res.data
    } catch (error) {
        return rejectWithValue(error.response?.data || { message: error.message })
    }
})

export const HandleHRUpdateLeave = createAsyncThunk('HandleHRUpdateLeave', async (data, { rejectWithValue }) => {
    try {
        const res = await apiService.patch(LeaveEndPoints.HR_UPDATE, data, { withCredentials: true })
        return res.data
    } catch (error) {
        return rejectWithValue(error.response?.data || { message: error.message })
    }
})

export const HandleGetMyLeaves = createAsyncThunk('HandleGetMyLeaves', async (_, { rejectWithValue }) => {
    try {
        const res = await apiService.get(LeaveEndPoints.MY_LEAVES, { withCredentials: true })
        return res.data
    } catch (error) {
        return rejectWithValue(error.response?.data || { message: error.message })
    }
})

export const HandleCreateLeave = createAsyncThunk('HandleCreateLeave', async (data, { rejectWithValue }) => {
    try {
        const res = await apiService.post(LeaveEndPoints.CREATE, data, { withCredentials: true })
        return res.data
    } catch (error) {
        return rejectWithValue(error.response?.data || { message: error.message })
    }
})

export const HandleUpdateLeaveByEmployee = createAsyncThunk('HandleUpdateLeaveByEmployee', async (data, { rejectWithValue }) => {
    try {
        const res = await apiService.patch(LeaveEndPoints.EM_UPDATE, data, { withCredentials: true })
        return res.data
    } catch (error) {
        return rejectWithValue(error.response?.data || { message: error.message })
    }
})

export const HandleDeleteLeave = createAsyncThunk('HandleDeleteLeave', async ({ leaveID }, { rejectWithValue }) => {
    try {
        const res = await apiService.delete(LeaveEndPoints.DELETE(leaveID), { withCredentials: true })
        return res.data
    } catch (error) {
        return rejectWithValue(error.response?.data || { message: error.message })
    }
})