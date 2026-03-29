export const ExitClearanceEndPoints = {
    GETALL:    '/v1/exit-clearance/all',
    SUMMARY:   '/v1/exit-clearance/summary',
    GETONE:    (id) => `/v1/exit-clearance/${id}`,
    CREATE:    '/v1/exit-clearance/create',
    CHECKLIST: (id) => `/v1/exit-clearance/${id}/checklist`,
    STATUS:    (id) => `/v1/exit-clearance/${id}/status`,
    DETAILS:   (id) => `/v1/exit-clearance/${id}/details`,
    DELETE:    (id) => `/v1/exit-clearance/${id}`,
}