export const APIsEndPoints = {
    LOGIN: "/auth/employee/login",
    CHECKELOGIN: "/auth/employee/check-login",
    FORGOT_PASSWORD: "/auth/employee/forgot-password",
    RESET_PASSWORD: (token) => `/auth/employee/reset-password/${token}`
}

export const HREndPoints = {
    SIGNUP: "/auth/HR/signup",
    CHECKLOGIN: "/auth/HR/check-login",
    LOGIN: "/auth/HR/login",
    VERIFY_EMAIL: "/auth/HR/verify-email",
    CHECK_VERIFY_EMAIL: "/auth/HR/check-verify-email",
    RESEND_VERIFY_EMAIL: "/auth/HR/resend-verify-email",
    FORGOT_PASSWORD: "/auth/HR/forgot-password",
    RESET_PASSWORD: (token) => `/auth/HR/reset-password/${token}` 
}

export const DashboardEndPoints = {
    GETDATA: "/v1/dashboard/HR-dashboard"
}

export const HREmployeesPageEndPoints = {
    GETALL: "v1/employee/all",
    ADDEMPLOYEE: "/auth/employee/signup",
    GETONE: (EMID) => `/v1/employee/by-HR/${EMID}`,
    DELETE: (EMID) => `/v1/employee/delete-employee/${EMID}`
}

export const HRDepartmentPageEndPoints = {
    GETALL: "/v1/department/all",
    CREATE: "/v1/department/create-department",
    UPDATE: "/v1/department/update-department",
    DELETE: "/v1/department/delete-department"
}

export const EmployeesIDsEndPoints = {
    GETALL: "/v1/employee/all-employees-ids",
}
export const SalaryEndPoints = {
    GETALL:  "/v1/salary/all",
    CREATE:  "/v1/salary/create-salary",
    UPDATE:  "/v1/salary/update-salary",
    DELETE:  (id) => `/v1/salary/delete-salary/${id}`,
}
 
export const NoticeEndPoints = {
    GETALL:      '/v1/notice/all',
    CREATE:      'v1/notice/create-notice',
    UPDATE:      '/v1/notice/update-notice',
    DELETE:      (id) => `/v1/notice/delete-notice/${id}`,
    MY_NOTICES:  '/v1/notice/my-notices',
}
 
export const LeaveEndPoints = {
    GETALL:      "/v1/leave/all",
    HR_UPDATE:   "/v1/leave/HR-update-leave",
}
 
export const AttendanceEndPoints = {
    GETALL:  "/v1/attendance/all",
    DELETE:  (id) => `/v1/attendance/delete-attendance/${id}`,
}
 
export const RecruitmentEndPoints = {
    GETALL:  "/v1/recruitment/all",
    CREATE:  "/v1/recruitment/create-recruitment",
    UPDATE:  "/v1/recruitment/update-recruitment",
    DELETE:  (id) => `/v1/recruitment/delete-recruitment/${id}`,
}
 
export const InterviewEndPoints = {
    GETALL:  "/v1/interview-insights/all",
    CREATE:  "/v1/interview-insights/create-interview",
    UPDATE:  "/v1/interview-insights/update-interview",
    DELETE:  (id) => `/v1/interview-insights/delete-interview/${id}`,
}
 
export const RequestEndPoints = {
    GETALL:        "/v1/generate-request/all",
    UPDATE_STATUS: "/v1/generate-request/update-request-status",
    DELETE:        (id) => `/v1/generate-request/delete-request/${id}`,
}
 
export const HRProfileEndPoints = {
    GETALL:  "/v1/HR/all",
    UPDATE:  "/v1/HR/update-HR",
    DELETE:  (id) => `/v1/HR/delete-HR/${id}`,
}