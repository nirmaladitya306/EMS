export const DocumentEndPoints = {
    GETALL:            '/api/v1/document/all',
    SUMMARY:           '/api/v1/document/summary',
    GETBYEMPLOYEE:     (empID) => `/api/v1/document/employee/${empID}`,
    CREATE:            '/api/v1/document/create',
    UPDATE:            '/api/v1/document/update',
    DELETE:            (docID) => `/api/v1/document/delete/${docID}`,
    RUN_ALERTS:        '/api/v1/document/run-alerts',
}