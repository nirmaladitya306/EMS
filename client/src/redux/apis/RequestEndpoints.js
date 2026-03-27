export const RequestEndPoints = {
    GETALL:         '/v1/generate-request/all',
    UPDATE_STATUS:  '/v1/generate-request/update-request-status',
    DELETE:         (requestID) => `/v1/generate-request/delete-request/${requestID}`,
}