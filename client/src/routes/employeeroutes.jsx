import { EmployeeLogin }     from "../pages/Employees/emplyoeelogin.jsx"
import { EmployeeDashboard } from "../pages/Employees/employeedashboard.jsx"
import { ProtectedRoutes }   from "./protectedroutes.jsx"
import { ForgotPassword }    from "../pages/Employees/forgotpassword.jsx"
import { ResetEmailConfirm } from "../pages/Employees/resetemailconfirm.jsx"
import { ResetPassword }     from "../pages/Employees/resetpassword.jsx"
import { EntryPage }         from "../pages/Employees/EntryPage.jsx"

import { EmployeeOverviewPage } from "../pages/HumanResources/Dashboard Childs/overviewpage.jsx"
import { MyLeavesPage }         from "../pages/HumanResources/Dashboard Childs/myleavespage.jsx"
import { MySalaryPage }         from "../pages/HumanResources/Dashboard Childs/mysalarypage.jsx"
import { MyNoticesPage }        from "../pages/HumanResources/Dashboard Childs/mynoticespage.jsx"
import { MyAttendancePage }     from "../pages/HumanResources/Dashboard Childs/myattendancepage.jsx"
import { MyRequestsPage }       from "../pages/HumanResources/Dashboard Childs/myrequestpage.jsx"
import { MyDocumentsPage }      from "../pages/HumanResources/Dashboard Childs/mydocumentpage.jsx"
import { MyActivityPage }       from "../pages/HumanResources/Dashboard Childs/myactivitypage.jsx"
import { MyLeaveRecommendationPage } from "../pages/HumanResources/Dashboard Childs/myleaverecpage.jsx"
import { MyTimelinePage }       from "../pages/HumanResources/Dashboard Childs/mytimelinepage.jsx"

export const EmployeeRoutes = [
    {
        path: "/",
        element: <EntryPage />
    },
    {
        path: "/auth/employee/login",
        element: <EmployeeLogin />
    },
    {
        path: "/auth/employee/employee-dashboard",
        element: <ProtectedRoutes><EmployeeDashboard /></ProtectedRoutes>,
        children: [
            {
                path: "overview",
                element: <EmployeeOverviewPage />
            },
            {
                path: "my-leaves",
                element: <MyLeavesPage />
            },
            {
                path: "my-salary",
                element: <MySalaryPage />
            },
            {
                path: "my-notices",
                element: <MyNoticesPage />
            },
            {
                path: "my-attendance",
                element: <MyAttendancePage />
            },
            {
                path: "my-requests",
                element: <MyRequestsPage />
            },
            {
                path: "my-documents",
                element: <MyDocumentsPage />
            },
            {
                path: "my-activity",
                element: <MyActivityPage />
            },
            {
                path: "leave-recommendation",
                element: <MyLeaveRecommendationPage />
            },
            {
                path: "my-timeline",
                element: <MyTimelinePage />
            },
        ]
    },
    {
        path: "/auth/employee/forgot-password",
        element: <ForgotPassword />
    },
    {
        path: "/auth/employee/reset-email-confirmation",
        element: <ResetEmailConfirm />
    },
    {
        path: "/auth/employee/resetpassword/:token",
        element: <ResetPassword />
    },
]