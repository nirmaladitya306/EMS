import { createAsyncThunk } from '@reduxjs/toolkit'
import { apiService } from '../apis/APIService'
import { DocumentEndPoints } from '../apis/DocumentEndpoints'

export const HandleGetDocuments = createAsyncThunk('HandleGetDocuments', async (data, { rejectWithValue }) => {
    try {
        const response = await apiService.get(DocumentEndPoints.GETALL, { withCredentials: true })
        return response.data
    } catch (error) {
        return rejectWithValue(error.response.data)
    }
})

export const HandleGetDocumentSummary = createAsyncThunk('HandleGetDocumentSummary', async (_, { rejectWithValue }) => {
    try {
        const response = await apiService.get(DocumentEndPoints.SUMMARY, { withCredentials: true })
        return response.data
    } catch (error) {
        return rejectWithValue(error.response.data)
    }
})

export const HandleCreateDocument = createAsyncThunk('HandleCreateDocument', async (data, { rejectWithValue }) => {
    try {
        const response = await apiService.post(DocumentEndPoints.CREATE, data, { withCredentials: true })
        return response.data
    } catch (error) {
        return rejectWithValue(error.response.data)
    }
})

export const HandleUpdateDocument = createAsyncThunk('HandleUpdateDocument', async (data, { rejectWithValue }) => {
    try {
        const response = await apiService.patch(DocumentEndPoints.UPDATE, data, { withCredentials: true })
        return response.data
    } catch (error) {
        return rejectWithValue(error.response.data)
    }
})

export const HandleDeleteDocument = createAsyncThunk('HandleDeleteDocument', async ({ documentID }, { rejectWithValue }) => {
    try {
        const response = await apiService.delete(DocumentEndPoints.DELETE(documentID), { withCredentials: true })
        return response.data
    } catch (error) {
        return rejectWithValue(error.response.data)
    }
})

export const HandleRunAlertEngine = createAsyncThunk('HandleRunAlertEngine', async (_, { rejectWithValue }) => {
    try {
        const response = await apiService.post(DocumentEndPoints.RUN_ALERTS, {}, { withCredentials: true })
        return response.data
    } catch (error) {
        return rejectWithValue(error.response.data)
    }
})