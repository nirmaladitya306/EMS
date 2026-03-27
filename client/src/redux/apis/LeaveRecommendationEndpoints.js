export const LeaveRecommendationEndPoints = {
    GET_FOR_EMPLOYEE:   (empID) => `/v1/leave-recommendation/employee/${empID}`,
    GET_FOR_HR:         (empID) => `/v1/leave-recommendation/hr/${empID}`,
    ORG_SUMMARY:        '/v1/leave-recommendation/org-summary',
}
 