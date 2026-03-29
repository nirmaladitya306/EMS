import { createSlice } from "@reduxjs/toolkit";
import { HREmployeesPageAsyncReducer } from "../AsyncReducers/asyncreducer.js";
import { HandleDeleteHREmployees, HandlePostHREmployees, HandleGetHREmployees, HandleSearchEmployeesBySkills, HandleGetEmployeeTimelineByHR } from "../Thunks/HREmployeesThunk.js";

const HREmployeesSlice = createSlice({
    name: "HREmployees",
    initialState: {
        data: null, 
        isLoading: false,
        success: false,
        fetchData : false, 
        employeeData : null,
        skillSearchResults: null,
        skillSearchLoading: false,
        employeeTimeline: null,
        timelineLoading: false,
        error: {
            status: false,
            message: null,
            content: null
        }
    },
    extraReducers: (builder) => {
        HREmployeesPageAsyncReducer(builder, HandleGetHREmployees) 
        HREmployeesPageAsyncReducer(builder, HandlePostHREmployees)
        HREmployeesPageAsyncReducer(builder, HandleDeleteHREmployees)

        builder
            .addCase(HandleSearchEmployeesBySkills.pending, (state) => {
                state.skillSearchLoading = true
                state.skillSearchResults = null
            })
            .addCase(HandleSearchEmployeesBySkills.fulfilled, (state, action) => {
                state.skillSearchLoading = false
                state.skillSearchResults = action.payload.data
            })
            .addCase(HandleSearchEmployeesBySkills.rejected, (state) => {
                state.skillSearchLoading = false
                state.skillSearchResults = []
            })

        builder
            .addCase(HandleGetEmployeeTimelineByHR.pending, (state) => {
                state.timelineLoading = true
                state.employeeTimeline = null
            })
            .addCase(HandleGetEmployeeTimelineByHR.fulfilled, (state, action) => {
                state.timelineLoading = false
                state.employeeTimeline = action.payload.data
            })
            .addCase(HandleGetEmployeeTimelineByHR.rejected, (state) => {
                state.timelineLoading = false
                state.employeeTimeline = null
            })
    }
})

export default HREmployeesSlice.reducer