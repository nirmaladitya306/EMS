export const LeaveEndPoints = {
    GETALL:     '/v1/leave/all',
    GETONE:     (leaveID) => `/v1/leave/${leaveID}`,
    HR_UPDATE:  '/v1/leave/HR-update-leave',
}