export const RecruitmentEndPoints = {
    GETALL:  '/v1/recruitment/all',
    CREATE:  '/v1/recruitment/create-recruitment',
    UPDATE:  '/v1/recruitment/update-recruitment',
    DELETE:  (recruitmentID) => `/v1/recruitment/delete-recruitment/${recruitmentID}`,
}