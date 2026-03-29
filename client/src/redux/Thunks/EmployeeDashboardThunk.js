import { createAsyncThunk } from '@reduxjs/toolkit'
import { apiService } from '../apis/APIService'

const EmployeeEndPoints = {
    PROFILE:        '/v1/employee/by-employee',
    MY_LEAVES:      '/v1/leave/my-leaves',
    MY_SALARIES:    '/v1/salary/my-salaries',
    MY_NOTICES:     '/v1/notice/my-notices',
    MY_ATTENDANCE:  '/v1/attendance/my-attendance',
    MY_REQUESTS:    '/v1/generate-request/my-requests',
    MY_DOCUMENTS:   '/v1/document/my-documents',
    MY_ACTIVITY:    '/v1/activity-log/my-activity',
    INITIALIZE_ATT: '/v1/attendance/initialize',
    CREATE_LEAVE:   '/v1/leave/create-leave',
    UPDATE_LEAVE:   '/v1/leave/employee-update-leave',
    DELETE_LEAVE:   (id) => `/v1/leave/delete-leave/${id}`,
    CREATE_REQUEST: '/v1/generate-request/create-request',
    UPDATE_REQUEST: '/v1/generate-request/update-request-content',
    UPDATE_PROFILE: '/v1/employee/update-employee',
    UPDATE_ATT:     '/v1/attendance/update-attendance',
}

export const HandleGetEmployeeProfile = createAsyncThunk('HandleGetEmployeeProfile', async (_, { rejectWithValue }) => {
    try {
        const res = await apiService.get(EmployeeEndPoints.PROFILE, { withCredentials: true })
        return res.data
    } catch (error) {
        return rejectWithValue(error.response?.data || { message: error.message })
    }
})

export const HandleGetMyLeaves = createAsyncThunk('HandleGetMyLeaves', async (_, { rejectWithValue }) => {
    try {
        const res = await apiService.get(EmployeeEndPoints.MY_LEAVES, { withCredentials: true })
        return res.data
    } catch (error) {
        return rejectWithValue(error.response?.data || { message: error.message })
    }
})

export const HandleGetMySalaries = createAsyncThunk('HandleGetMySalaries', async (_, { rejectWithValue }) => {
    try {
        const res = await apiService.get(EmployeeEndPoints.MY_SALARIES, { withCredentials: true })
        return res.data
    } catch (error) {
        return rejectWithValue(error.response?.data || { message: error.message })
    }
})

export const HandleGetMyNotices = createAsyncThunk('HandleGetMyNotices', async (_, { rejectWithValue }) => {
    try {
        const res = await apiService.get(EmployeeEndPoints.MY_NOTICES, { withCredentials: true })
        return res.data
    } catch (error) {
        return rejectWithValue(error.response?.data || { message: error.message })
    }
})

export const HandleGetMyAttendance = createAsyncThunk('HandleGetMyAttendance', async (_, { rejectWithValue }) => {
    try {
        const res = await apiService.get(EmployeeEndPoints.MY_ATTENDANCE, { withCredentials: true })
        return res.data
    } catch (error) {
        return rejectWithValue(error.response?.data || { message: error.message })
    }
})

export const HandleGetMyRequests = createAsyncThunk('HandleGetMyRequests', async (_, { rejectWithValue }) => {
    try {
        const res = await apiService.get(EmployeeEndPoints.MY_REQUESTS, { withCredentials: true })
        return res.data
    } catch (error) {
        return rejectWithValue(error.response?.data || { message: error.message })
    }
})

export const HandleInitializeMyAttendance = createAsyncThunk('HandleInitializeMyAttendance', async (data, { rejectWithValue }) => {
    try {
        const res = await apiService.post(EmployeeEndPoints.INITIALIZE_ATT, data, { withCredentials: true })
        return res.data
    } catch (error) {
        return rejectWithValue(error.response?.data || { message: error.message })
    }
})

export const HandleMarkAttendance = createAsyncThunk('HandleMarkAttendance', async (data, { rejectWithValue }) => {
    try {
        const res = await apiService.patch(EmployeeEndPoints.UPDATE_ATT, data, { withCredentials: true })
        return res.data
    } catch (error) {
        return rejectWithValue(error.response?.data || { message: error.message })
    }
})

export const HandleApplyLeave = createAsyncThunk('HandleApplyLeave', async (data, { rejectWithValue }) => {
    try {
        const res = await apiService.post(EmployeeEndPoints.CREATE_LEAVE, data, { withCredentials: true })
        return res.data
    } catch (error) {
        return rejectWithValue(error.response?.data || { message: error.message })
    }
})

export const HandleUpdateMyLeave = createAsyncThunk('HandleUpdateMyLeave', async (data, { rejectWithValue }) => {
    try {
        const res = await apiService.patch(EmployeeEndPoints.UPDATE_LEAVE, data, { withCredentials: true })
        return res.data
    } catch (error) {
        return rejectWithValue(error.response?.data || { message: error.message })
    }
})

export const HandleDeleteMyLeave = createAsyncThunk('HandleDeleteMyLeave', async ({ leaveID }, { rejectWithValue }) => {
    try {
        const res = await apiService.delete(EmployeeEndPoints.DELETE_LEAVE(leaveID), { withCredentials: true })
        return res.data
    } catch (error) {
        return rejectWithValue(error.response?.data || { message: error.message })
    }
})

export const HandleSubmitRequest = createAsyncThunk('HandleSubmitRequest', async (data, { rejectWithValue }) => {
    try {
        const res = await apiService.post(EmployeeEndPoints.CREATE_REQUEST, data, { withCredentials: true })
        return res.data
    } catch (error) {
        return rejectWithValue(error.response?.data || { message: error.message })
    }
})

export const HandleUpdateMyRequest = createAsyncThunk('HandleUpdateMyRequest', async (data, { rejectWithValue }) => {
    try {
        const res = await apiService.patch(EmployeeEndPoints.UPDATE_REQUEST, data, { withCredentials: true })
        return res.data
    } catch (error) {
        return rejectWithValue(error.response?.data || { message: error.message })
    }
})

export const HandleUpdateMyProfile = createAsyncThunk('HandleUpdateMyProfile', async (data, { rejectWithValue }) => {
    try {
        const res = await apiService.patch(EmployeeEndPoints.UPDATE_PROFILE, data, { withCredentials: true })
        return res.data
    } catch (error) {
        return rejectWithValue(error.response?.data || { message: error.message })
    }
})

export const HandleGetMyDocuments = createAsyncThunk('HandleGetMyDocuments', async (_, { rejectWithValue }) => {
    try {
        const res = await apiService.get(EmployeeEndPoints.MY_DOCUMENTS, { withCredentials: true })
        return res.data
    } catch (error) {
        return rejectWithValue(error.response?.data || { message: error.message })
    }
})

export const HandleGetMyActivity = createAsyncThunk('HandleGetMyActivity', async (_, { rejectWithValue }) => {
    try {
        const res = await apiService.get(EmployeeEndPoints.MY_ACTIVITY, { withCredentials: true })
        return res.data
    } catch (error) {
        return rejectWithValue(error.response?.data || { message: error.message })
    }
})