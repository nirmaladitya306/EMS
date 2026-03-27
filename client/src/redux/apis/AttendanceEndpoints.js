export const AttendanceEndPoints = {
    GETALL:  '/v1/attendance/all',
    DELETE:  (attendanceID) => `/v1/attendance/delete-attendance/${attendanceID}`,
}