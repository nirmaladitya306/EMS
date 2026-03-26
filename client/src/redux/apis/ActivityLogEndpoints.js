export const ActivityLogEndPoints = {
    GETALL:   '/api/v1/activity-log/all',
    SUMMARY:  '/api/v1/activity-log/summary',
    ACTOR:    (actorID) => `/api/v1/activity-log/actor/${actorID}`,
    CLEAR:    '/api/v1/activity-log/clear',
}