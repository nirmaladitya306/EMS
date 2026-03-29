import { createAsyncThunk } from '@reduxjs/toolkit'
import { apiService } from '../apis/APIService'
import { ExitClearanceEndPoints } from '../apis/ExitClearanceEndpoints'

export const HandleGetAllClearances = createAsyncThunk(
    'HandleGetAllClearances',
    async ({ status } = {}, { rejectWithValue }) => {
        try {
            const params = {}
            if (status && status !== 'All') params.status = status
            const response = await apiService.get(ExitClearanceEndPoints.GETALL, { params, withCredentials: true })
            return response.data
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: error.message })
        }
    }
)

export const HandleGetClearanceSummary = createAsyncThunk(
    'HandleGetClearanceSummary',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiService.get(ExitClearanceEndPoints.SUMMARY, { withCredentials: true })
            return response.data
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: error.message })
        }
    }
)

export const HandleGetClearance = createAsyncThunk(
    'HandleGetClearance',
    async (clearanceID, { rejectWithValue }) => {
        try {
            const response = await apiService.get(ExitClearanceEndPoints.GETONE(clearanceID), { withCredentials: true })
            return response.data
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: error.message })
        }
    }
)

export const HandleCreateExitClearance = createAsyncThunk(
    'HandleCreateExitClearance',
    async (data, { rejectWithValue }) => {
        try {
            const response = await apiService.post(ExitClearanceEndPoints.CREATE, data, { withCredentials: true })
            return response.data
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: error.message })
        }
    }
)

export const HandleToggleChecklistItem = createAsyncThunk(
    'HandleToggleChecklistItem',
    async ({ clearanceID, itemID, notes }, { rejectWithValue }) => {
        try {
            const response = await apiService.patch(
                ExitClearanceEndPoints.CHECKLIST(clearanceID),
                { itemID, notes },
                { withCredentials: true }
            )
            return response.data
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: error.message })
        }
    }
)

export const HandleUpdateClearanceStatus = createAsyncThunk(
    'HandleUpdateClearanceStatus',
    async ({ clearanceID, status, notes }, { rejectWithValue }) => {
        try {
            const response = await apiService.patch(
                ExitClearanceEndPoints.STATUS(clearanceID),
                { status, notes },
                { withCredentials: true }
            )
            return response.data
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: error.message })
        }
    }
)

export const HandleUpdateClearanceDetails = createAsyncThunk(
    'HandleUpdateClearanceDetails',
    async ({ clearanceID, ...data }, { rejectWithValue }) => {
        try {
            const response = await apiService.patch(
                ExitClearanceEndPoints.DETAILS(clearanceID),
                data,
                { withCredentials: true }
            )
            return response.data
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: error.message })
        }
    }
)

export const HandleDeleteClearance = createAsyncThunk(
    'HandleDeleteClearance',
    async (clearanceID, { rejectWithValue }) => {
        try {
            const response = await apiService.delete(ExitClearanceEndPoints.DELETE(clearanceID), { withCredentials: true })
            return { ...response.data, clearanceID }
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: error.message })
        }
    }
)