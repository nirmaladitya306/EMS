export const ActivityLogEndPoints = {
    GETALL:   '/v1/activity-log/all',
    SUMMARY:  '/v1/activity-log/summary',
    ACTOR:    (actorID) => `/v1/activity-log/actor/${actorID}`,
    CLEAR:    '/v1/activity-log/clear',
}