import { HRSignupPage } from "../pages/HumanResources/HRSignup"
import { HRLogin } from "../pages/HumanResources/HRlogin"
import { HRDashbaord } from "../pages/HumanResources/HRdashbaord"
import { VerifyEmailPage } from "../pages/HumanResources/verifyemailpage.jsx"
// import { ResetEmailConfirm } from "../pages/Employees/resetemailconfirm.jsx"
// import { ResetEmailVerification } from "../pages/HumanResources/resendemailverificaiton.jsx"
import { HRForgotPasswordPage } from "../pages/HumanResources/forgotpassword.jsx"
import { ResetMailConfirmPage } from "../pages/HumanResources/resetmailconfirm.jsx"
import { ResetHRPasswordPage } from "../pages/HumanResources/resetpassword.jsx"
import { ResetHRVerifyEmailPage } from "../pages/HumanResources/resetemail.jsx"
import { HRDashboardPage } from "../pages/HumanResources/Dashboard Childs/dashboardpage.jsx"
import { HRProtectedRoutes } from "./HRprotectedroutes.jsx"
import { HREmployeesPage } from "../pages/HumanResources/Dashboard Childs/employeespage.jsx"
import { HRDepartmentPage } from "../pages/HumanResources/Dashboard Childs/departmentpage.jsx"
import { DocumentExpiryPage } from "../pages/HumanResources/Dashboard Childs/documentexpirypage.jsx"
import { LeaveRecommendationPage } from "../pages/HumanResources/Dashboard Childs/leaverecommendationpage.jsx"
import { ActivityLogPage } from "../pages/HumanResources/Dashboard Childs/activitylogpage.jsx"
import { SalaryPage } from "../pages/HumanResources/Dashboard Childs/salarypage.jsx"
import { NoticePage } from "../pages/HumanResources/Dashboard Childs/noticepage.jsx"


export const HRRoutes = [
    {
        path: "/auth/HR/signup",
        element: <HRSignupPage />
    },
    {
        path: "/auth/HR/login",
        element: <HRLogin />
    },
    {
        path: "/HR/dashboard",
        element: <HRProtectedRoutes><HRDashbaord /></HRProtectedRoutes>,
        children: [
        {
            path: "dashboard-data",
            element: <HRDashboardPage />
        },
        {
            path: "employees",
            element: <HREmployeesPage />
        },
        {
            path: "departments",
            element: <HRDepartmentPage />
        },
        {
            path: "documents",
            element: <DocumentExpiryPage />
        },
        {
            path: "leave-recommendation",
            element: <LeaveRecommendationPage />
        },
        {
            path: "activity-log",
            element: <ActivityLogPage />
        },
        {
            path: "salary",
            element: <SalaryPage />
        },
        {
            path: "notices",
            element: <NoticePage />
        },

    ]
    },
    {
        path: "/auth/HR/verify-email",
        element: <VerifyEmailPage />
    },
    {
        path: "/auth/HR/reset-email-validation",
        element: <ResetHRVerifyEmailPage />
    },
    {
        path: "/auth/HR/forgot-password",
        element: <HRForgotPasswordPage />
    },
    {
        path: "/auth/HR/reset-email-confirmation",
        element: <ResetMailConfirmPage />
    },
    {
        path: "/auth/HR/resetpassword/:token",
        element: <ResetHRPasswordPage />
    },
]