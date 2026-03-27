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
    ADDEMPLOYEE: "/api/auth/employee/signup",
    GETONE: (EMID) => `/api/v1/employee/by-HR/${EMID}`,
    DELETE: (EMID) => `/api/v1/employee/delete-employee/${EMID}`
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