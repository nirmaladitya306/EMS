import { createAsyncThunk } from '@reduxjs/toolkit'
import { apiService } from '../apis/APIService'
import { LeaveRecommendationEndPoints } from '../apis/LeaveRecommendationEndpoints'

export const HandleGetLeaveRecommendation = createAsyncThunk(
    'HandleGetLeaveRecommendation',
    async ({ employeeID, startdate, enddate, role = 'HR' }, { rejectWithValue }) => {
        try {
            const url    = role === 'HR'
                ? LeaveRecommendationEndPoints.GET_FOR_HR(employeeID)
                : LeaveRecommendationEndPoints.GET_FOR_EMPLOYEE(employeeID)
            const params = {}
            if (startdate) params.startdate = startdate
            if (enddate)   params.enddate   = enddate
            const response = await apiService.get(url, { params, withCredentials: true })
            return response.data
        } catch (error) {
            return rejectWithValue(error.response.data)
        }
    }
)

export const HandleGetOrgLeaveSummary = createAsyncThunk(
    'HandleGetOrgLeaveSummary',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiService.get(
                LeaveRecommendationEndPoints.ORG_SUMMARY,
                { withCredentials: true }
            )
            return response.data
        } catch (error) {
            return rejectWithValue(error.response.data)
        }
    }
)