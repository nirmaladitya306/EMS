import { Employee }      from '../models/Employee.model.js'
import { Department }    from '../models/Department.model.js'
import { Leave }         from '../models/Leave.model.js'
import { Salary }        from '../models/Salary.model.js'
import { Attendance }    from '../models/Attendance.model.js'
import { ActivityLog }   from '../models/ActivityLog.model.js'
import { Recruitment }   from '../models/Recruitment.model.js'
import { Applicant }     from '../models/Applicant.model.js'
import { Document }      from '../models/Document.model.js'
import { ExitClearance } from '../models/ExitClearance.model.js'
import { Notice }        from '../models/Notice.model.js'
import { GenerateRequest } from '../models/GenerateRequest.model.js'

// ─── Helper: last-N-months labels + date range ────────────────────────────────
const lastNMonths = (n) => {
    const months = []
    const now    = new Date()
    for (let i = n - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
        months.push({
            label: d.toLocaleString('en-GB', { month: 'short', year: '2-digit' }),
            start: new Date(d.getFullYear(), d.getMonth(), 1),
            end:   new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59)
        })
    }
    return months
}

// ─── HR: full org analytics ───────────────────────────────────────────────────
export const HandleGetHRAnalytics = async (req, res) => {
    try {
        const orgID  = req.ORGID
        const months = lastNMonths(6)

        // ── 1. Headcount ──────────────────────────────────────────────────
        const totalEmployees = await Employee.countDocuments({ organizationID: orgID })
        const totalDepts     = await Department.countDocuments({ organizationID: orgID })

        // New hires per month
        const hiresPerMonth = await Promise.all(
            months.map(async m => ({
                month: m.label,
                hires: await Employee.countDocuments({
                    organizationID: orgID,
                    createdAt: { $gte: m.start, $lte: m.end }
                })
            }))
        )

        // ── 2. Headcount by department ────────────────────────────────────
        const depts = await Department.find({ organizationID: orgID }).select('name employees')
        const headcountByDept = depts.map(d => ({
            department: d.name,
            count: d.employees?.length || 0
        })).filter(d => d.count > 0)

        // ── 3. Leave analytics ────────────────────────────────────────────
        const [leavePending, leaveApproved, leaveRejected] = await Promise.all([
            Leave.countDocuments({ organizationID: orgID, status: 'Pending'  }),
            Leave.countDocuments({ organizationID: orgID, status: 'Approved' }),
            Leave.countDocuments({ organizationID: orgID, status: 'Rejected' }),
        ])

        const leavesPerMonth = await Promise.all(
            months.map(async m => ({
                month:    m.label,
                approved: await Leave.countDocuments({ organizationID: orgID, status: 'Approved', createdAt: { $gte: m.start, $lte: m.end } }),
                pending:  await Leave.countDocuments({ organizationID: orgID, status: 'Pending',  createdAt: { $gte: m.start, $lte: m.end } }),
                rejected: await Leave.countDocuments({ organizationID: orgID, status: 'Rejected', createdAt: { $gte: m.start, $lte: m.end } }),
            }))
        )

        // ── 4. Salary analytics ───────────────────────────────────────────
        const salaries  = await Salary.find({ organizationID: orgID })
        const totalPayroll     = salaries.reduce((s, r) => s + (r.netpay || 0), 0)
        const avgSalary        = totalEmployees ? Math.round(totalPayroll / totalEmployees) : 0
        const salariesPaid     = salaries.filter(s => s.status === 'Paid').length
        const salariesPending  = salaries.filter(s => s.status === 'Pending').length
        const salariesDelayed  = salaries.filter(s => s.status === 'Delayed').length

        const payrollPerMonth = await Promise.all(
            months.map(async m => {
                const recs = await Salary.find({
                    organizationID: orgID,
                    createdAt: { $gte: m.start, $lte: m.end }
                })
                return {
                    month:    m.label,
                    total:    recs.reduce((s, r) => s + (r.netpay || 0), 0),
                    bonuses:  recs.reduce((s, r) => s + (r.bonuses || 0), 0),
                    deductions: recs.reduce((s, r) => s + (r.deductions || 0), 0),
                }
            })
        )

        // ── 5. Attendance analytics ───────────────────────────────────────
        const allAttendance = await Attendance.find({ organizationID: orgID })
        let totalLogs = 0, presentLogs = 0
        for (const att of allAttendance) {
            for (const log of att.attendancelog) {
                totalLogs++
                if (log.logstatus === 'Present') presentLogs++
            }
        }
        const orgAttendanceRate = totalLogs ? Math.round((presentLogs / totalLogs) * 100) : 0

        // ── 6. Recruitment analytics ──────────────────────────────────────
        const openRoles  = await Recruitment.countDocuments({ organizationID: orgID })
        const applicants = await Applicant.find({ organizationID: orgID })
        const appByStatus = applicants.reduce((acc, a) => {
            acc[a.recruitmentstatus] = (acc[a.recruitmentstatus] || 0) + 1
            return acc
        }, {})

        // ── 7. Document analytics ─────────────────────────────────────────
        const [docsValid, docsExpiringSoon, docsExpired] = await Promise.all([
            Document.countDocuments({ organizationID: orgID, status: 'Valid' }),
            Document.countDocuments({ organizationID: orgID, status: 'Expiring Soon' }),
            Document.countDocuments({ organizationID: orgID, status: 'Expired' }),
        ])

        // ── 8. Exit clearance analytics ───────────────────────────────────
        const [exitTotal, exitPending, exitInProgress, exitCleared, exitRejected] = await Promise.all([
            ExitClearance.countDocuments({ organizationID: orgID }),
            ExitClearance.countDocuments({ organizationID: orgID, status: 'Pending'     }),
            ExitClearance.countDocuments({ organizationID: orgID, status: 'In Progress' }),
            ExitClearance.countDocuments({ organizationID: orgID, status: 'Cleared'     }),
            ExitClearance.countDocuments({ organizationID: orgID, status: 'Rejected'    }),
        ])

        // ── 9. Activity log: action frequency (last 30 days) ─────────────
        const since30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        const recentLogs = await ActivityLog.find({
            organizationID: orgID,
            createdAt: { $gte: since30 }
        }).select('action')

        const actionFrequency = recentLogs.reduce((acc, l) => {
            acc[l.action] = (acc[l.action] || 0) + 1
            return acc
        }, {})

        const topActions = Object.entries(actionFrequency)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 8)
            .map(([action, count]) => ({ action: action.replace(/_/g, ' '), count }))

        // ── 10. Request analytics ─────────────────────────────────────────
        const [reqPending, reqApproved, reqDenied] = await Promise.all([
            GenerateRequest.countDocuments({ organizationID: orgID, status: 'Pending'  }),
            GenerateRequest.countDocuments({ organizationID: orgID, status: 'Approved' }),
            GenerateRequest.countDocuments({ organizationID: orgID, status: 'Denied'   }),
        ])

        // ── 11. Notice analytics ──────────────────────────────────────────
        const noticesPerMonth = await Promise.all(
            months.map(async m => ({
                month: m.label,
                count: await Notice.countDocuments({
                    organizationID: orgID,
                    createdAt: { $gte: m.start, $lte: m.end }
                })
            }))
        )

        return res.status(200).json({
            success: true,
            data: {
                // Overview
                overview: { totalEmployees, totalDepts, orgAttendanceRate, totalPayroll, avgSalary },

                // Headcount
                hiresPerMonth,
                headcountByDept,

                // Leaves
                leaveStats: { pending: leavePending, approved: leaveApproved, rejected: leaveRejected },
                leavesPerMonth,

                // Salary / payroll
                salaryStats: { paid: salariesPaid, pending: salariesPending, delayed: salariesDelayed },
                payrollPerMonth,

                // Attendance
                attendanceRate: orgAttendanceRate,

                // Recruitment
                recruitmentStats: { openRoles, applicantsByStatus: appByStatus },

                // Documents
                documentStats: { valid: docsValid, expiringSoon: docsExpiringSoon, expired: docsExpired },

                // Exit clearance
                exitStats: { total: exitTotal, pending: exitPending, inProgress: exitInProgress, cleared: exitCleared, rejected: exitRejected },

                // Activity
                topActions,

                // Requests
                requestStats: { pending: reqPending, approved: reqApproved, denied: reqDenied },

                // Notices
                noticesPerMonth,
            }
        })
    } catch (error) {
        console.error('[Analytics]', error)
        return res.status(500).json({ success: false, message: 'Internal server error' })
    }
}

// ─── Employee: personal analytics ────────────────────────────────────────────
export const HandleGetEmployeeAnalytics = async (req, res) => {
    try {
        const empID  = req.EMid
        const orgID  = req.ORGID
        const months = lastNMonths(6)

        // ── Leaves ────────────────────────────────────────────────────────
        const myLeaves = await Leave.find({ employee: empID, organizationID: orgID })
        const leaveApproved = myLeaves.filter(l => l.status === 'Approved').length
        const leavePending  = myLeaves.filter(l => l.status === 'Pending').length
        const leaveRejected = myLeaves.filter(l => l.status === 'Rejected').length

        const leavesPerMonth = months.map(m => ({
            month: m.label,
            total: myLeaves.filter(l => {
                const d = new Date(l.createdAt)
                return d >= m.start && d <= m.end
            }).length
        }))

        // ── Salary trend ──────────────────────────────────────────────────
        const mySalaries = await Salary.find({ employee: empID, organizationID: orgID }).sort({ createdAt: 1 })
        const salaryTrend = mySalaries.map(s => ({
            date:       new Date(s.createdAt).toLocaleString('en-GB', { month: 'short', year: '2-digit' }),
            netpay:     s.netpay,
            basicpay:   s.basicpay,
            bonuses:    s.bonuses,
            deductions: s.deductions,
            currency:   s.currency,
            status:     s.status,
        }))

        const latestSalary = mySalaries.at(-1) || null

        // ── Attendance ────────────────────────────────────────────────────
        const myAtt = await Attendance.findOne({ employee: empID, organizationID: orgID })
        const attLogs   = myAtt?.attendancelog || []
        const present   = attLogs.filter(l => l.logstatus === 'Present').length
        const absent    = attLogs.filter(l => l.logstatus === 'Absent').length
        const notSpec   = attLogs.filter(l => l.logstatus === 'Not Specified').length
        const attRate   = attLogs.length ? Math.round((present / attLogs.length) * 100) : 0

        // Attendance by month
        const attPerMonth = months.map(m => {
            const inRange = attLogs.filter(l => {
                const d = new Date(l.logdate)
                return d >= m.start && d <= m.end
            })
            return {
                month:   m.label,
                present: inRange.filter(l => l.logstatus === 'Present').length,
                absent:  inRange.filter(l => l.logstatus === 'Absent').length,
            }
        })

        // ── Requests ──────────────────────────────────────────────────────
        const myRequests = await GenerateRequest.find({ employee: empID, organizationID: orgID })
        const reqApproved = myRequests.filter(r => r.status === 'Approved').length
        const reqPending  = myRequests.filter(r => r.status === 'Pending').length
        const reqDenied   = myRequests.filter(r => r.status === 'Denied').length

        // ── Documents ─────────────────────────────────────────────────────
        const myDocs = await Document.find({ employee: empID, organizationID: orgID })
        const docsValid       = myDocs.filter(d => d.status === 'Valid').length
        const docsExpiringSoon = myDocs.filter(d => d.status === 'Expiring Soon').length
        const docsExpired     = myDocs.filter(d => d.status === 'Expired').length

        // ── Notices ───────────────────────────────────────────────────────
        const myNotices = await Notice.find({ employee: empID, organizationID: orgID })

        // ── Activity (last 30 days) ───────────────────────────────────────
        const since30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        const recentActivity = await ActivityLog.find({
            actorID:      empID,
            organizationID: orgID,
            createdAt:    { $gte: since30 }
        }).select('action createdAt').sort({ createdAt: -1 }).limit(50)

        const actionFrequency = recentActivity.reduce((acc, l) => {
            acc[l.action] = (acc[l.action] || 0) + 1
            return acc
        }, {})

        const topActions = Object.entries(actionFrequency)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 6)
            .map(([action, count]) => ({ action: action.replace(/_/g, ' '), count }))

        return res.status(200).json({
            success: true,
            data: {
                // Overview KPIs
                overview: {
                    attendanceRate: attRate,
                    totalLeaves:    myLeaves.length,
                    totalSalaries:  mySalaries.length,
                    totalRequests:  myRequests.length,
                    totalNotices:   myNotices.length,
                    totalDocs:      myDocs.length,
                },

                // Leaves
                leaveStats:   { approved: leaveApproved, pending: leavePending, rejected: leaveRejected },
                leavesPerMonth,

                // Salary
                salaryTrend,
                latestSalary,

                // Attendance
                attendanceStats: { present, absent, notSpecified: notSpec, rate: attRate },
                attPerMonth,

                // Requests
                requestStats: { approved: reqApproved, pending: reqPending, denied: reqDenied },

                // Documents
                documentStats: { valid: docsValid, expiringSoon: docsExpiringSoon, expired: docsExpired },

                // Activity
                topActions,
            }
        })
    } catch (error) {
        console.error('[Employee Analytics]', error)
        return res.status(500).json({ success: false, message: 'Internal server error' })
    }
}