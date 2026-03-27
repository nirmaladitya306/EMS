export const RequestEndPoints = {
    GETALL:         '/v1/generate-request/all',
    UPDATE_STATUS:  '/v1/generate-request/update-request-status',
    DELETE:         (requestID) => `/v1/generate-request/delete-request/${requestID}`,
    MY_REQUESTS:    '/v1/generate-request/my-requests',
    CREATE:         '/v1/generate-request/create-request',
    EM_UPDATE:      '/v1/generate-request/update-request-content',
}