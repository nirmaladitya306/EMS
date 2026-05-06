/**
 * hrContext.js — live DB aggregates for the HR admin prompt.
 * Pulls only counts + summary fields — fast and non-blocking.
 */
import { Employee }        from '../../models/Employee.model.js'
import { Department }      from '../../models/Department.model.js'
import { Leave }           from '../../models/Leave.model.js'
import { HumanResources }  from '../../models/HR.model.js'

export async function buildHRContext(orgID, hrID) {
    const [hr, employeeCount, deptCount, pendingLeaves] = await Promise.all([
        HumanResources.findById(hrID).select('firstname lastname').lean(),
        Employee.countDocuments({ organizationID: orgID }),
        Department.countDocuments({ organizationID: orgID }),
        Leave.countDocuments({ organizationID: orgID, status: 'Pending' }),
    ])

    return {
        hrName:        hr ? `${hr.firstname} ${hr.lastname}` : 'HR Admin',
        orgName:       process.env.ORG_NAME || 'your organisation',
        employeeCount,
        deptCount,
        pendingLeaves,
        today:         new Date().toISOString().split('T')[0],
        extra:         '',
    }
}
