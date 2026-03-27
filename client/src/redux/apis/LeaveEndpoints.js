export const LeaveEndPoints = {
    GETALL:         '/v1/leave/all',
    GETONE:         (leaveID) => `/v1/leave/${leaveID}`,
    HR_UPDATE:      '/v1/leave/HR-update-leave',
    MY_LEAVES:      '/v1/leave/my-leaves',
    CREATE:         '/v1/leave/create-leave',
    EM_UPDATE:      '/v1/leave/employee-update-leave',
    DELETE:         (leaveID) => `/v1/leave/delete-leave/${leaveID}`,
}