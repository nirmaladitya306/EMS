export const ChatEndpoints = {
    HR_CHAT:      '/v1/chat/hr',
    EMPLOYEE_CHAT:'/v1/chat/employee',
    CLEAR_SESSION: (sessionId) => `/v1/chat/session/${sessionId}`,
    HEALTH:       '/v1/chat/health',
}
