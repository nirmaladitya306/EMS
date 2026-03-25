export const LeaveRecommendationEndPoints = {
    GET_FOR_EMPLOYEE:   (empID) => `/api/v1/leave-recommendation/employee/${empID}`,
    GET_FOR_HR:         (empID) => `/api/v1/leave-recommendation/hr/${empID}`,
    ORG_SUMMARY:        '/api/v1/leave-recommendation/org-summary',
}
 