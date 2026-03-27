export const NoticeEndPoints = {
    GETALL:  '/v1/notice/all/',
    CREATE:  '/v1/notice/create-notice',
    UPDATE:  '/v1/notice/update-notice',
    DELETE:  (noticeID) => `/v1/notice/delete-notice/${noticeID}`,
}
