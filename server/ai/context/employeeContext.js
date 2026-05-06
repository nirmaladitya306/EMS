/**
 * employeeContext.js — scoped employee data for the self-service prompt.
 */
import { Employee } from '../../models/Employee.model.js'
import { Leave }    from '../../models/Leave.model.js'

const ANNUAL = parseInt(process.env.ANNUAL_LEAVE_DAYS || '20', 10)

export async function buildEmployeeContext(orgID, empID) {
    const [employee, allLeaves] = await Promise.all([
        Employee.findOne({ _id: empID, organizationID: orgID })
            .populate('department', 'name')
            .select('firstname lastname department')
            .lean(),
        Leave.find({ employee: empID, organizationID: orgID })
            .select('status startdate enddate')
            .lean(),
    ])

    const approvedDays = allLeaves
        .filter(l => l.status === 'Approved')
        .reduce((sum, l) => {
            const days = Math.ceil((new Date(l.enddate) - new Date(l.startdate)) / 86400000) + 1
            return sum + days
        }, 0)

    return {
        employeeName: employee ? `${employee.firstname} ${employee.lastname}` : 'Employee',
        orgName:      process.env.ORG_NAME || 'your organisation',
        department:   employee?.department?.name || 'Unassigned',
        leaveBalance: Math.max(0, ANNUAL - approvedDays),
        pendingLeaves: allLeaves.filter(l => l.status === 'Pending').length,
        today:        new Date().toISOString().split('T')[0],
        extra:        '',
    }
}
