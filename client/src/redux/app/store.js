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
import SalaryReducer from "../Slices/SalarySlice";
import HREmployeesReducer from "../Slices/HREmployeesPageSlice";
import NoticeReducer from "../Slices/NoticeSlice";

export const store = configureStore({
    reducer: {
        employeereducer: EmployeeReducer,
        HRReducer: HRReducer,
        dashboardreducer: DashbaordReducer,
        HREmployeesPageReducer : HREmployeesPageReducer,
        HRDepartmentPageReducer : HRDepartmentPageReducer,
        EMployeesIDReducer : EMployeesIDReducer,
        DocumentReducer: DocumentReducer,
        LeaveRecommendationReducer: LeaveRecommendationReducer,
        ActivityLogReducer: ActivityLogReducer,
        SalaryReducer: SalaryReducer,
        HREmployeesReducer: HREmployeesReducer,
        NoticeReducer: NoticeReducer
    }
})