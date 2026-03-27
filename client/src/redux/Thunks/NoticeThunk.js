import { createAsyncThunk } from "@reduxjs/toolkit";
import { apiService } from "../apis/APIService";
import { NoticeEndPoints } from "../apis/APIsEndpoints";

export const HandleGetNotices = createAsyncThunk("HandleGetNotices", async (_, { rejectWithValue }) => {
    try {
        const response = await apiService.get(NoticeEndPoints.GETALL, { withCredentials: true });
        return response.data;
    } catch (error) {
        if (error.response?.data) return rejectWithValue(error.response.data);
        return rejectWithValue({ success: false, message: error.message || "Network error" });
    }
})

export const HandleCreateNotice = createAsyncThunk("HandleCreateNotice", async (data, { rejectWithValue }) => {
    try {
        const response = await apiService.post(NoticeEndPoints.CREATE, data, { withCredentials: true });
        return { ...response.data, refetch: true };
    } catch (error) {
        if (error.response?.data) return rejectWithValue(error.response.data);
        return rejectWithValue({ success: false, message: error.message || "Network error" });
    }
})

export const HandleUpdateNotice = createAsyncThunk("HandleUpdateNotice", async (data, { rejectWithValue }) => {
    try {
        const response = await apiService.patch(NoticeEndPoints.UPDATE, data, { withCredentials: true });
        return { ...response.data, refetch: true };
    } catch (error) {
        if (error.response?.data) return rejectWithValue(error.response.data);
        return rejectWithValue({ success: false, message: error.message || "Network error" });
    }
})

export const HandleDeleteNotice = createAsyncThunk("HandleDeleteNotice", async (id, { rejectWithValue }) => {
    try {
        const response = await apiService.delete(NoticeEndPoints.DELETE(id), { withCredentials: true });
        return { ...response.data, refetch: true };
    } catch (error) {
        if (error.response?.data) return rejectWithValue(error.response.data);
        return rejectWithValue({ success: false, message: error.message || "Network error" });
    }
})