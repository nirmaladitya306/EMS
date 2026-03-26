import { createAsyncThunk } from '@reduxjs/toolkit'
import { apiService } from '../apis/APIService'
import { APIsEndPoints } from '../apis/APIsEndpoints.js'


export const HandleGetEmployees = createAsyncThunk("handleGetEmployees", async (EmployeeData, { rejectWithValue }) => {
    try {
        const { apiroute } = EmployeeData
        const response = await apiService.get(`${APIsEndPoints[apiroute]}`, { 
            withCredentials: true
        })
        return response.data
    } catch (error) { 
        if (error.response?.data) {
            return rejectWithValue(error.response.data);
        }
        return rejectWithValue({ gologin: true, message: error.message || "Network error" });
    }
})

export const HandlePostEmployees = createAsyncThunk("HandlePostEmployees", async (EmployeeData, { rejectWithValue }) => {
    try {
        const { apiroute, data, type } = EmployeeData
        if (type == "resetpassword") {
            const response = await apiService.post(`${APIsEndPoints.RESET_PASSWORD(apiroute)}`, data, {
                withCredentials: true
            })
            return response.data
        }
        else {
            const response = await apiService.post(`${APIsEndPoints[apiroute]}`, data, {
                withCredentials: true
            })
            return response.data
        }
    } catch (error) {
        if (error.response?.data) {
            return rejectWithValue(error.response.data);
        }
        return rejectWithValue({ success: false, message: error.message || "Network error" });
    }
})

export const HandlePutEmployees = createAsyncThunk("HandlePutEmployees", async () => { })

export const HandlePatchEmployees = createAsyncThunk("HandlePatchEmployees", async () => { })

export const HandleDeleteEmployees = createAsyncThunk("HandleDeleteEmployees", async () => { })
