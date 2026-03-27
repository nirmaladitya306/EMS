import { createAsyncThunk } from '@reduxjs/toolkit'
import { apiService } from '../apis/APIService'
import { SalaryEndPoints } from '../apis/SalaryEndpoints'

export const HandleGetAllSalaries = createAsyncThunk('HandleGetAllSalaries', async (_, { rejectWithValue }) => {
    try {
        const res = await apiService.get(SalaryEndPoints.GETALL, { withCredentials: true })
        return res.data
    } catch (error) {
        return rejectWithValue(error.response?.data || { message: error.message })
    }
})

export const HandleCreateSalary = createAsyncThunk('HandleCreateSalary', async (data, { rejectWithValue }) => {
    try {
        const res = await apiService.post(SalaryEndPoints.CREATE, data, { withCredentials: true })
        return res.data
    } catch (error) {
        return rejectWithValue(error.response?.data || { message: error.message })
    }
})

export const HandleUpdateSalary = createAsyncThunk('HandleUpdateSalary', async (data, { rejectWithValue }) => {
    try {
        const res = await apiService.patch(SalaryEndPoints.UPDATE, data, { withCredentials: true })
        return res.data
    } catch (error) {
        return rejectWithValue(error.response?.data || { message: error.message })
    }
})

export const HandleDeleteSalary = createAsyncThunk('HandleDeleteSalary', async ({ salaryID }, { rejectWithValue }) => {
    try {
        const res = await apiService.delete(SalaryEndPoints.DELETE(salaryID), { withCredentials: true })
        return res.data
    } catch (error) {
        return rejectWithValue(error.response?.data || { message: error.message })
    }
})

export const HandleGetMySalaries = createAsyncThunk('HandleGetMySalaries', async (_, { rejectWithValue }) => {
    try {
        const res = await apiService.get(SalaryEndPoints.MY_SALARIES, { withCredentials: true })
        return res.data
    } catch (error) {
        return rejectWithValue(error.response?.data || { message: error.message })
    }
})