import { createAsyncThunk } from '@reduxjs/toolkit'
import { apiService } from '../apis/APIService'

// ─── My permissions (fetched once after HR login) ─────────────────────────────
export const HandleGetMyPermissions = createAsyncThunk(
    'HandleGetMyPermissions',
    async (_, { rejectWithValue }) => {
        try {
            const res = await apiService.get('/v1/rbac/my-permissions', { withCredentials: true })
            return res.data
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: error.message })
        }
    }
)

// ─── Permission catalogue ─────────────────────────────────────────────────────
export const HandleGetPermissionCatalogue = createAsyncThunk(
    'HandleGetPermissionCatalogue',
    async (_, { rejectWithValue }) => {
        try {
            const res = await apiService.get('/v1/rbac/permissions', { withCredentials: true })
            return res.data
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: error.message })
        }
    }
)

// ─── Roles ────────────────────────────────────────────────────────────────────
export const HandleGetAllRoles = createAsyncThunk(
    'HandleGetAllRoles',
    async (_, { rejectWithValue }) => {
        try {
            const res = await apiService.get('/v1/rbac/roles', { withCredentials: true })
            return res.data
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: error.message })
        }
    }
)

export const HandleCreateRole = createAsyncThunk(
    'HandleCreateRole',
    async (data, { rejectWithValue }) => {
        try {
            const res = await apiService.post('/v1/rbac/roles', data, { withCredentials: true })
            return res.data
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: error.message })
        }
    }
)

export const HandleUpdateRole = createAsyncThunk(
    'HandleUpdateRole',
    async ({ roleID, ...data }, { rejectWithValue }) => {
        try {
            const res = await apiService.patch(`/v1/rbac/roles/${roleID}`, data, { withCredentials: true })
            return res.data
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: error.message })
        }
    }
)

export const HandleDeleteRole = createAsyncThunk(
    'HandleDeleteRole',
    async (roleID, { rejectWithValue }) => {
        try {
            const res = await apiService.delete(`/v1/rbac/roles/${roleID}`, { withCredentials: true })
            return { ...res.data, roleID }
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: error.message })
        }
    }
)

// ─── HR Assignments ───────────────────────────────────────────────────────────
export const HandleGetHRAssignments = createAsyncThunk(
    'HandleGetHRAssignments',
    async (_, { rejectWithValue }) => {
        try {
            const res = await apiService.get('/v1/rbac/hr-assignments', { withCredentials: true })
            return res.data
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: error.message })
        }
    }
)

export const HandleAssignRole = createAsyncThunk(
    'HandleAssignRole',
    async ({ hrID, roleID }, { rejectWithValue }) => {
        try {
            const res = await apiService.patch('/v1/rbac/assign', { hrID, roleID }, { withCredentials: true })
            return res.data
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: error.message })
        }
    }
)