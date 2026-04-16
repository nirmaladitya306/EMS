export const HRProfileEndPoints = {
    GETALL:  '/v1/HR/all',
    DELETE:  (HRID) => `/v1/HR/delete-HR/${HRID}`,
    CREATE:  '/auth/hr/create-hr', // ✅ Added the Create endpoint
}