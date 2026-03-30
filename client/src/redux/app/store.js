import { configureStore } from '@reduxjs/toolkit'
import EmployeeReducer from "../Slices/EmployeeSlice.js"
import HRReducer from '../Slices/HRSlice.js'
import DashbaordReducer from "../Slices/DashboardSlice.js"
import HREmployeesPageReducer from '../Slices/HREmployeesPageSlice.js'
import HRDepartmentPageReducer from '../Slices/HRDepartmentPageSlice.js'
import EMployeesIDReducer from '../Slices/EmployeesIDsSlice.js'
import DocumentReducer from '../Slices/DocumentSlice.js'
import LeaveRecommendationReducer from '../Slices/LeaveRecommendationSlice.js'
import ActivityLogReducer from '../Slices/ActivityLogSlice.js'
import SalaryReducer from "../Slices/SalarySlice.js"
import NoticeReducer from "../Slices/NoticeSlice.js"
import LeaveReducer from "../Slices/LeaveSlice.js"
import AttendanceReducer from "../Slices/AttendanceSlice.js"
import RecruitmentReducer from "../Slices/RecruitmentSlice.js"
import InterviewReducer from "../Slices/InterviewSlice.js"
import RequestReducer from "../Slices/RequestSlice.js"
import HRProfileReducer from "../Slices/HRProfileSlice.js"
import EmployeeDashboardReducer from "../Slices/EmployeeDashboardSlice.js"
import AccessDriftReducer from "../Slices/AccessDriftSlice.js"
import PayrollComplianceReducer from '../Slices/PayrollComplianceSlice.js'
import ExitClearanceReducer from '../Slices/ExitClearanceSlice.js'
import RBACReducer from '../Slices/RBACSlice.js'

export const store = configureStore({
    reducer: {
        employeereducer:            EmployeeReducer,
        HRReducer:                  HRReducer,
        dashboardreducer:           DashbaordReducer,
        HREmployeesPageReducer:     HREmployeesPageReducer,
        // salarypage.jsx uses HREmployeesReducer — alias to the same slice
        HREmployeesReducer:         HREmployeesPageReducer,
        HRDepartmentPageReducer:    HRDepartmentPageReducer,
        EMployeesIDReducer:         EMployeesIDReducer,
        DocumentReducer:            DocumentReducer,
        LeaveRecommendationReducer: LeaveRecommendationReducer,
        ActivityLogReducer:         ActivityLogReducer,
        SalaryReducer:              SalaryReducer,
        NoticeReducer:              NoticeReducer,
        LeaveReducer:               LeaveReducer,
        AttendanceReducer:          AttendanceReducer,
        RecruitmentReducer:         RecruitmentReducer,
        InterviewReducer:           InterviewReducer,
        RequestReducer:             RequestReducer,
        HRProfileReducer:           HRProfileReducer,
        EmployeeDashboardReducer:   EmployeeDashboardReducer,
        AccessDriftReducer:         AccessDriftReducer,
        PayrollComplianceReducer:   PayrollComplianceReducer,
        ExitClearanceReducer:       ExitClearanceReducer,
        RBACReducer:                RBACReducer,
    }
})