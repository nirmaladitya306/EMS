import { createAsyncThunk } from '@reduxjs/toolkit'
import { apiService } from '../apis/APIService'
import { OrgStructureEndPoints } from '../apis/OrgStructureEndpoints'

export const HandleGetOrgTree = createAsyncThunk(
    'HandleGetOrgTree',
    async (_, { rejectWithValue }) => {
        try {
            const res = await apiService.get(OrgStructureEndPoints.TREE, { withCredentials: true })
            return res.data
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: error.message })
        }
    }
)

export const HandleGetAllPositions = createAsyncThunk(
    'HandleGetAllPositions',
    async (_, { rejectWithValue }) => {
        try {
            const res = await apiService.get(OrgStructureEndPoints.ALL, { withCredentials: true })
            return res.data
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: error.message })
        }
    }
)

export const HandleCreatePosition = createAsyncThunk(
    'HandleCreatePosition',
    async (data, { rejectWithValue }) => {
        try {
            const res = await apiService.post(OrgStructureEndPoints.CREATE, data, { withCredentials: true })
            return res.data
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: error.message })
        }
    }
)

export const HandleUpdatePosition = createAsyncThunk(
    'HandleUpdatePosition',
    async ({ positionID, ...data }, { rejectWithValue }) => {
        try {
            const res = await apiService.patch(OrgStructureEndPoints.UPDATE(positionID), data, { withCredentials: true })
            return res.data
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: error.message })
        }
    }
)

export const HandleDeletePosition = createAsyncThunk(
    'HandleDeletePosition',
    async (positionID, { rejectWithValue }) => {
        try {
            const res = await apiService.delete(OrgStructureEndPoints.DELETE(positionID), { withCredentials: true })
            return { ...res.data, positionID }
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: error.message })
        }
    }
)

export const HandleAssignEmployee = createAsyncThunk(
    'HandleAssignEmployee',
    async ({ positionID, employeeID, managerID }, { rejectWithValue }) => {
        try {
            const res = await apiService.post(
                OrgStructureEndPoints.ASSIGN(positionID),
                { employeeID, managerID },
                { withCredentials: true }
            )
            return res.data
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: error.message })
        }
    }
)

export const HandleRemoveEmployee = createAsyncThunk(
    'HandleRemoveEmployee',
    async ({ positionID, employeeID }, { rejectWithValue }) => {
        try {
            const res = await apiService.post(
                OrgStructureEndPoints.REMOVE(positionID),
                { employeeID },
                { withCredentials: true }
            )
            return res.data
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: error.message })
        }
    }
)

export const HandleGetReportingChain = createAsyncThunk(
    'HandleGetReportingChain',
    async (employeeId, { rejectWithValue }) => {
        try {
            const res = await apiService.get(OrgStructureEndPoints.REPORTING_CHAIN(employeeId), { withCredentials: true })
            return res.data
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: error.message })
        }
    }
)