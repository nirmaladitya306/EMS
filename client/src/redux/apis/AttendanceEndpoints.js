export const AttendanceEndPoints = {
    GETALL:         '/v1/attendance/all',
    DELETE:         (attendanceID) => `/v1/attendance/delete-attendance/${attendanceID}`,
    MY_ATTENDANCE:  '/v1/attendance/my-attendance',
    INITIALIZE:     '/v1/attendance/initialize',
    UPDATE:         '/v1/attendance/update-attendance',
}