export const DocumentEndPoints = {
    GETALL:            '/v1/document/all',
    SUMMARY:           '/v1/document/summary',
    GETBYEMPLOYEE:     (empID) => `/v1/document/employee/${empID}`,
    CREATE:            '/v1/document/create',
    UPDATE:            '/v1/document/update',
    DELETE:            (docID) => `/v1/document/delete/${docID}`,
    RUN_ALERTS:        '/v1/document/run-alerts',
}