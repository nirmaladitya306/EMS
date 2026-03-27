export const InterviewEndPoints = {
    GETALL:  '/v1/interview-insights/all',
    CREATE:  '/v1/interview-insights/create-interview',
    UPDATE:  '/v1/interview-insights/update-interview',
    DELETE:  (interviewID) => `/v1/interview-insights/delete-interview/${interviewID}`,
}