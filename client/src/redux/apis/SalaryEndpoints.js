export const SalaryEndPoints = {
    GETALL:       '/v1/salary/all',
    GETONE:       (salaryID) => `/v1/salary/${salaryID}`,
    CREATE:       '/v1/salary/create-salary',
    UPDATE:       '/v1/salary/update-salary',
    DELETE:       (salaryID) => `/v1/salary/delete-salary/${salaryID}`,
    MY_SALARIES:  '/v1/salary/my-salaries',
}