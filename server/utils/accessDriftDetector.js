import { ActivityLog } from '../models/ActivityLog.model.js'
import { AccessDrift } from '../models/AccessDrift.model.js'
import { Employee } from '../models/Employee.model.js'
import { Department } from '../models/Department.model.js'
import { createLog } from './activityLogger.js'

// ─── HR-only or sensitive endpoints an employee should never hit ──────────────
const SENSITIVE_PATTERNS = [
    '/v1/employee/delete',
    '/v1/salary/create',
    '/v1/salary/update',
    '/v1/salary/delete',
    '/v1/department/create',
    '/v1/department/update',
    '/v1/department/delete',
    '/v1/HR/',
    '/v1/recruitment/delete',
    '/v1/attendance/delete',
    '/v1/activity-log/clear',
    '/v1/notice/create',
    '/v1/notice/delete',
]

// ─── Actions that are high-risk for bulk ops ──────────────────────────────────
const BULK_ACTIONS = [
    'EMPLOYEE_DELETED', 'DEPARTMENT_DELETED', 'LEAVE_DELETED',
    'SALARY_UPDATED', 'DOCUMENT_DELETED', 'NOTICE_DELETED'
]

// ─── Map drift type → severity ────────────────────────────────────────────────
const SEVERITY_MAP = {
    SENSITIVE_ENDPOINT_ACCESS: 'CRITICAL',
    BULK_OPERATION:            'HIGH',
    HIGH_FREQUENCY_ACTIONS:    'HIGH',
    REPEATED_FAILED_ACCESS:    'MEDIUM',
    UNUSUAL_LOGIN_TIME:        'LOW',
    OFF_HOURS_ACTIVITY:        'LOW',
    UNUSUAL_ACTION_PATTERN:    'MEDIUM',
}

// ─── Helper: avoid duplicate open drift events of the same type ───────────────
const driftExists = async (employeeID, driftType, organizationID, windowHours = 24) => {
    const since = new Date(Date.now() - windowHours * 60 * 60 * 1000)
    return AccessDrift.exists({
        employeeID,
        driftType,
        organizationID,
        status: 'OPEN',
        createdAt: { $gte: since }
    })
}

// ─── Main detection function — call after every employee action ───────────────
export const runDriftDetection = async ({ employeeID, organizationID, req = null }) => {
    try {
        const employee = await Employee.findById(employeeID).populate('department')
        if (!employee) return

        const empName = `${employee.firstname} ${employee.lastname}`
        const deptName = employee.department?.name || 'Unknown'

        const since1h  = new Date(Date.now() - 1 * 60 * 60 * 1000)
        const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000)

        const recentLogs = await ActivityLog.find({
            actorID: employeeID,
            organizationID,
            createdAt: { $gte: since24h }
        }).sort({ createdAt: -1 }).limit(200)

        const lastHourLogs = recentLogs.filter(l => new Date(l.createdAt) >= since1h)

        // ── 1. SENSITIVE_ENDPOINT_ACCESS ──────────────────────────────────────
        if (req?.path) {
            const isSensitive = SENSITIVE_PATTERNS.some(p => req.path.includes(p))
            if (isSensitive) {
                const exists = await driftExists(employeeID, 'SENSITIVE_ENDPOINT_ACCESS', organizationID, 6)
                if (!exists) {
                    await AccessDrift.create({
                        employeeID,
                        employeeName: empName,
                        employeeDepartment: deptName,
                        driftType: 'SENSITIVE_ENDPOINT_ACCESS',
                        severity: 'CRITICAL',
                        description: `${empName} attempted to access a restricted endpoint: ${req.path}`,
                        evidence: [{ action: 'ENDPOINT_ACCESS', endpoint: req.path, timestamp: new Date(), description: `Attempted access to ${req.path}` }],
                        organizationID
                    })
                    await createLog({ actorID: employeeID, actorName: empName, action: 'ACCESS_DRIFT_DETECTED', description: `Access drift: ${empName} hit sensitive endpoint ${req.path}`, organizationID, req })
                }
            }
        }

        // ── 2. HIGH_FREQUENCY_ACTIONS (> 30 in last hour) ────────────────────
        if (lastHourLogs.length > 30) {
            const exists = await driftExists(employeeID, 'HIGH_FREQUENCY_ACTIONS', organizationID, 2)
            if (!exists) {
                await AccessDrift.create({
                    employeeID,
                    employeeName: empName,
                    employeeDepartment: deptName,
                    driftType: 'HIGH_FREQUENCY_ACTIONS',
                    severity: 'HIGH',
                    description: `${empName} performed ${lastHourLogs.length} actions in the last hour — unusually high activity.`,
                    evidence: lastHourLogs.slice(0, 10).map(l => ({
                        action: l.action,
                        endpoint: l.endpoint,
                        timestamp: l.createdAt,
                        description: l.description
                    })),
                    organizationID
                })
                await createLog({ actorID: employeeID, actorName: empName, action: 'ACCESS_DRIFT_DETECTED', description: `Access drift: ${empName} made ${lastHourLogs.length} actions in 1 hour`, organizationID })
            }
        }

        // ── 3. BULK_OPERATION (3+ bulk actions in 1 hour) ────────────────────
        const bulkInLastHour = lastHourLogs.filter(l => BULK_ACTIONS.includes(l.action))
        if (bulkInLastHour.length >= 3) {
            const exists = await driftExists(employeeID, 'BULK_OPERATION', organizationID, 4)
            if (!exists) {
                await AccessDrift.create({
                    employeeID,
                    employeeName: empName,
                    employeeDepartment: deptName,
                    driftType: 'BULK_OPERATION',
                    severity: 'HIGH',
                    description: `${empName} performed ${bulkInLastHour.length} bulk/destructive operations in the last hour.`,
                    evidence: bulkInLastHour.map(l => ({
                        action: l.action,
                        endpoint: l.endpoint,
                        timestamp: l.createdAt,
                        description: l.description
                    })),
                    organizationID
                })
                await createLog({ actorID: employeeID, actorName: empName, action: 'ACCESS_DRIFT_DETECTED', description: `Access drift: ${empName} performed bulk operations`, organizationID })
            }
        }

        // ── 4. OFF_HOURS_ACTIVITY (weekend check) ────────────────────────────
        const now = new Date()
        const day = now.getDay() // 0=Sun, 6=Sat
        if (day === 0 || day === 6) {
            const exists = await driftExists(employeeID, 'OFF_HOURS_ACTIVITY', organizationID, 12)
            if (!exists) {
                await AccessDrift.create({
                    employeeID,
                    employeeName: empName,
                    employeeDepartment: deptName,
                    driftType: 'OFF_HOURS_ACTIVITY',
                    severity: 'LOW',
                    description: `${empName} is active on a ${day === 0 ? 'Sunday' : 'Saturday'}.`,
                    evidence: [],
                    organizationID
                })
            }
        }

        // ── 5. UNUSUAL_LOGIN_TIME ─────────────────────────────────────────────
        const loginLog = recentLogs.find(l => l.action === 'LOGIN')
        if (loginLog) {
            const loginHour = new Date(loginLog.createdAt).getHours()
            if (loginHour < 5 || loginHour >= 23) {
                const exists = await driftExists(employeeID, 'UNUSUAL_LOGIN_TIME', organizationID, 12)
                if (!exists) {
                    await AccessDrift.create({
                        employeeID,
                        employeeName: empName,
                        employeeDepartment: deptName,
                        driftType: 'UNUSUAL_LOGIN_TIME',
                        severity: 'LOW',
                        description: `${empName} logged in at an unusual hour: ${loginHour}:00.`,
                        evidence: [{ action: 'LOGIN', endpoint: '/auth/employee/login', timestamp: loginLog.createdAt, description: `Login at ${loginHour}:00` }],
                        organizationID
                    })
                }
            }
        }

    } catch (err) {
        console.error('[AccessDriftDetector] Error:', err.message)
    }
}