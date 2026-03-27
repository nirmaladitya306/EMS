export const SalaryEndPoints = {
    GETALL:   '/api/v1/salary/all',
    GETONE:   (salaryID) => `/api/v1/salary/${salaryID}`,
    CREATE:   '/api/v1/salary/create-salary',
    UPDATE:   '/api/v1/salary/update-salary',
    DELETE:   (salaryID) => `/api/v1/salary/delete-salary/${salaryID}`,
}