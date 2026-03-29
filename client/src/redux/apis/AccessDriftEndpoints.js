export const AccessDriftEndPoints = {
    GETALL:           '/v1/access-drift/all',
    SUMMARY:          '/v1/access-drift/summary',
    EMPLOYEE_DRIFTS:  (employeeID) => `/v1/access-drift/employee/${employeeID}`,
    RESOLVE:          (driftID)    => `/v1/access-drift/resolve/${driftID}`,
    DISMISS:          (driftID)    => `/v1/access-drift/dismiss/${driftID}`,
    MY_DRIFTS:        '/v1/access-drift/my-drifts',
}
