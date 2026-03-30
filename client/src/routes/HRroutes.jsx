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
import { LeavePage } from "../pages/HumanResources/Dashboard Childs/leavepage.jsx"
import { AttendancePage } from "../pages/HumanResources/Dashboard Childs/attendancepage.jsx"
import { RecruitmentPage } from "../pages/HumanResources/Dashboard Childs/recruitmentpage.jsx"
import { InterviewPage } from "../pages/HumanResources/Dashboard Childs/interviewpage.jsx"
import { RequestsPage } from "../pages/HumanResources/Dashboard Childs/requestspage.jsx"
import { HRProfilePage } from "../pages/HumanResources/Dashboard Childs/hrprofilepage.jsx"
import { AccessDriftPage } from "../pages/HumanResources/Dashboard Childs/accessdriftpage.jsx"
import { PayrollCompliancePage } from '../pages/HumanResources/Dashboard Childs/payrollcompliancepage.jsx'
import { EmployeeTimelinePage } from '../pages/HumanResources/Dashboard Childs/employeetimeline.jsx'
import { ExitClearancePage } from '../pages/HumanResources/Dashboard Childs/exitclearancepage.jsx'
import { HRAnalyticsPage }   from '../pages/HumanResources/Dashboard Childs/hranalyticspage.jsx'
import { RBACPage }          from '../pages/HumanResources/Dashboard Childs/rbacpage.jsx'

export const HRRoutes = [
    {
        path: "/auth/hr/signup",
        element: <HRSignupPage />
    },
    {
        path: "/auth/hr/login",
        element: <HRLogin />
    },
    {
        path: "/hr/dashboard",
        element: <HRProtectedRoutes><HRDashbaord /></HRProtectedRoutes>,
        children: [
        {
            path: "dashboard-data",
            element: <HRDashboardPage />
        },
        {
            path: "access-drift",
            element: <AccessDriftPage />
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
        {
            path: "leaves",
            element: <LeavePage />
        },
        {
            path: "attendance",
            element: <AttendancePage />
        },
        {
            path: "recruitment",
            element: <RecruitmentPage />
        },
        {
            path: "interview-insights",
            element: <InterviewPage />
        },
        {
            path: "requests",
            element: <RequestsPage />
        },
        {
            path: "hr-profiles",
            element: <HRProfilePage />
        },
        {
            path: 'payroll-compliance',
            element: <PayrollCompliancePage />
        },
        {
            path: 'employee-timeline',
            element: <EmployeeTimelinePage />
        },
        {
            path: 'exit-clearance',
            element: <ExitClearancePage />
        },
        {
            path: 'analytics',
            element: <HRAnalyticsPage />
        },
        {
            path: 'access-control',
            element: <RBACPage />
        },

    ]
    },
    {
        path: "/auth/hr/verify-email",
        element: <VerifyEmailPage />
    },
    {
        path: "/auth/hr/reset-email-validation",
        element: <ResetHRVerifyEmailPage />
    },
    {
        path: "/auth/hr/forgot-password",
        element: <HRForgotPasswordPage />
    },
    {
        path: "/auth/hr/reset-email-confirmation",
        element: <ResetMailConfirmPage />
    },
    {
        path: "/auth/hr/resetpassword/:token",
        element: <ResetHRPasswordPage />
    },
]