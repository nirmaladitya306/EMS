export const OrgStructureEndPoints = {
    ALL:             '/v1/org-structure/all',
    TREE:            '/v1/org-structure/tree',
    CREATE:          '/v1/org-structure',
    UPDATE:          (id) => `/v1/org-structure/${id}`,
    DELETE:          (id) => `/v1/org-structure/${id}`,
    ASSIGN:          (id) => `/v1/org-structure/${id}/assign`,
    REMOVE:          (id) => `/v1/org-structure/${id}/remove`,
    REPORTING_CHAIN: (empId) => `/v1/org-structure/reporting-chain/${empId}`,
}