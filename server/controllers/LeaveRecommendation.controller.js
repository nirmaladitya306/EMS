import dayjs from 'dayjs'
import isoWeek from 'dayjs/plugin/isoWeek.js'
import dayOfYear from 'dayjs/plugin/dayOfYear.js'
import { Leave } from '../models/Leave.model.js'
import { Attendance } from '../models/Attendance.model.js'
import { Employee } from '../models/Employee.model.js'
import { CorporateCalendar } from '../models/CorporateCalendar.model.js'

dayjs.extend(isoWeek)
dayjs.extend(dayOfYear)

// ─── Constants ────────────────────────────────────────────────────────────────
const ANNUAL_LEAVE_QUOTA   = 20   // Total leave days allowed per year
const MAX_TEAM_ON_LEAVE    = 2    // Max team members allowed on leave same day
const MIN_GAP_BETWEEN      = 14   // Min days between two leave periods
const PEAK_MONTHS          = [3, 11, 12]  // March (Q-end), Nov, Dec (busy months)
const WEEKEND_DAYS         = [0, 6]  // Sunday=0, Saturday=6

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Count working days between two dates (excluding weekends)
const countWorkingDays = (start, end) => {
    let count = 0
    let cur = dayjs(start)
    const last = dayjs(end)
    while (cur.isBefore(last) || cur.isSame(last, 'day')) {
        if (!WEEKEND_DAYS.includes(cur.day())) count++
        cur = cur.add(1, 'day')
    }
    return count
}

// Get leave days used in current year
const getLeaveDaysUsed = (leaves, year) => {
    return leaves
        .filter(l => l.status === 'Approved' && dayjs(l.startdate).year() === year)
        .reduce((sum, l) => sum + countWorkingDays(l.startdate, l.enddate), 0)
}

// Find the employee's most frequent leave month in history
const getMostFrequentLeaveMonth = (leaves) => {
    const monthCount = Array(12).fill(0)
    leaves.forEach(l => { monthCount[dayjs(l.startdate).month()]++ })
    const max = Math.max(...monthCount)
    return max === 0 ? null : monthCount.indexOf(max)
}

// Count how many employees in same department are on leave on a given date
const countTeamOnLeave = (date, departmentLeaves, excludeEmployeeID) => {
    const d = dayjs(date)
    return departmentLeaves.filter(l =>
        l.status === 'Approved' &&
        l.employee?.toString() !== excludeEmployeeID?.toString() &&
        (d.isAfter(dayjs(l.startdate).subtract(1, 'day')) && d.isBefore(dayjs(l.enddate).add(1, 'day')))
    ).length
}

// Check if a date range overlaps a corporate holiday
const overlapsHoliday = (startdate, enddate, holidays) => {
    const start = dayjs(startdate)
    const end   = dayjs(enddate)
    return holidays.some(h => {
        const hd = dayjs(h.eventdate)
        return hd.isAfter(start.subtract(1, 'day')) && hd.isBefore(end.add(1, 'day'))
    })
}

// Attendance score: % of days present in last 60 days
const getAttendanceScore = (attendancelog) => {
    const since = dayjs().subtract(60, 'day')
    const recent = (attendancelog || []).filter(log => dayjs(log.logdate).isAfter(since))
    if (!recent.length) return null
    const present = recent.filter(l => l.logstatus === 'Present').length
    return Math.round((present / recent.length) * 100)
}

// ─── Rule Engine ─────────────────────────────────────────────────────────────
// Returns a recommendation object with score, reasons, and suggested windows
const runRules = ({ employee, leaves, attendance, departmentLeaves, holidays, requestedStart, requestedEnd }) => {
    const today      = dayjs()
    const year       = today.year()
    const reasons    = []
    const warnings   = []
    let   score      = 100  // Start at 100, deduct per violated rule

    const daysUsed     = getLeaveDaysUsed(leaves, year)
    const daysLeft     = ANNUAL_LEAVE_QUOTA - daysUsed
    const requestDays  = requestedStart && requestedEnd
        ? countWorkingDays(requestedStart, requestedEnd)
        : null

    // ── Rule 1: Leave balance ─────────────────────────────────────────────────
    if (daysLeft <= 0) {
        score -= 40
        warnings.push(`No leave balance remaining (${daysUsed}/${ANNUAL_LEAVE_QUOTA} days used this year)`)
    } else if (requestDays && requestDays > daysLeft) {
        score -= 30
        warnings.push(`Requested ${requestDays} days but only ${daysLeft} days remain`)
    } else {
        reasons.push(`You have ${daysLeft} days of leave balance remaining`)
    }

    // ── Rule 2: Minimum gap between leaves ────────────────────────────────────
    if (requestedStart) {
        const lastLeave = leaves
            .filter(l => l.status === 'Approved' && dayjs(l.enddate).isBefore(today))
            .sort((a, b) => dayjs(b.enddate) - dayjs(a.enddate))[0]

        if (lastLeave) {
            const gap = dayjs(requestedStart).diff(dayjs(lastLeave.enddate), 'day')
            if (gap < MIN_GAP_BETWEEN) {
                score -= 20
                warnings.push(`Only ${gap} days since last leave — minimum gap is ${MIN_GAP_BETWEEN} days`)
            } else {
                reasons.push(`Good gap of ${gap} days since your last approved leave`)
            }
        }
    }

    // ── Rule 3: Team capacity ─────────────────────────────────────────────────
    if (requestedStart) {
        let maxTeamCount = 0
        let cur = dayjs(requestedStart)
        const end = dayjs(requestedEnd || requestedStart)
        while (cur.isBefore(end) || cur.isSame(end, 'day')) {
            const count = countTeamOnLeave(cur, departmentLeaves, employee._id)
            if (count > maxTeamCount) maxTeamCount = count
            cur = cur.add(1, 'day')
        }
        if (maxTeamCount >= MAX_TEAM_ON_LEAVE) {
            score -= 25
            warnings.push(`${maxTeamCount} team member(s) already on leave during this period`)
        } else if (maxTeamCount === 0) {
            reasons.push('No other team members on leave during this period')
        } else {
            reasons.push(`Only ${maxTeamCount} other team member(s) on leave — within team limit`)
        }
    }

    // ── Rule 4: Peak period avoidance ────────────────────────────────────────
    if (requestedStart) {
        const month = dayjs(requestedStart).month() + 1  // 1-based
        if (PEAK_MONTHS.includes(month)) {
            score -= 15
            warnings.push('This falls in a high-workload period (Q-end or festive season)')
        } else {
            reasons.push('Good timing — not in a peak workload period')
        }
    }

    // ── Rule 5: Holiday adjacency bonus ──────────────────────────────────────
    if (requestedStart && requestedEnd) {
        if (overlapsHoliday(requestedStart, requestedEnd, holidays)) {
            score += 10
            reasons.push('Leave overlaps a corporate holiday — efficient use of leave balance')
        }
        // Check if adjacent to weekend (long weekend pattern)
        const startDay = dayjs(requestedStart).day()
        const endDay   = dayjs(requestedEnd).day()
        if (startDay === 1 || endDay === 5) {
            score += 5
            reasons.push('Leave creates a long weekend — good for rest')
        }
    }

    // ── Rule 6: Attendance pattern ────────────────────────────────────────────
    const attendanceScore = getAttendanceScore(attendance?.attendancelog)
    if (attendanceScore !== null) {
        if (attendanceScore >= 90) {
            score += 10
            reasons.push(`Excellent attendance record (${attendanceScore}% in last 60 days)`)
        } else if (attendanceScore < 70) {
            score -= 10
            warnings.push(`Attendance is ${attendanceScore}% in last 60 days — consider improving before taking leave`)
        } else {
            reasons.push(`Attendance is ${attendanceScore}% in last 60 days`)
        }
    }

    // ── Rule 7: Frequency check (not too many leaves in short span) ──────────
    const last90Days = leaves.filter(l =>
        l.status !== 'Rejected' &&
        dayjs(l.startdate).isAfter(today.subtract(90, 'day'))
    )
    if (last90Days.length >= 3) {
        score -= 15
        warnings.push(`${last90Days.length} leave requests in the last 90 days — high frequency`)
    }

    score = Math.max(0, Math.min(100, score))

    // ── Recommendation label ──────────────────────────────────────────────────
    let recommendation, color
    if (score >= 80)      { recommendation = 'Highly Recommended';  color = 'green'  }
    else if (score >= 60) { recommendation = 'Recommended';          color = 'blue'   }
    else if (score >= 40) { recommendation = 'Proceed with Caution'; color = 'yellow' }
    else                  { recommendation = 'Not Recommended';       color = 'red'    }

    return { score, recommendation, color, reasons, warnings, daysUsed, daysLeft, requestDays }
}

// ─── Suggest optimal leave windows ───────────────────────────────────────────
const suggestWindows = (leaves, departmentLeaves, holidays, employeeID) => {
    const today     = dayjs()
    const windows   = []
    const durations = [3, 5]  // Suggest 3-day and 5-day windows

    for (let weekOffset = 1; weekOffset <= 12; weekOffset++) {
        for (const duration of durations) {
            const start = today.add(weekOffset, 'week').startOf('isoWeek')  // Monday
            const end   = start.add(duration - 1, 'day')

            // Skip if in the past
            if (start.isBefore(today)) continue

            // Skip weekends
            if (WEEKEND_DAYS.includes(start.day())) continue

            // Skip peak months
            if (PEAK_MONTHS.includes(start.month() + 1)) continue

            // Check team capacity each day in window
            let teamOk = true
            let cur = start
            while (cur.isBefore(end) || cur.isSame(end, 'day')) {
                if (countTeamOnLeave(cur, departmentLeaves, employeeID) >= MAX_TEAM_ON_LEAVE) {
                    teamOk = false
                    break
                }
                cur = cur.add(1, 'day')
            }
            if (!teamOk) continue

            // Bonus: adjacent to holiday
            const hasHoliday = overlapsHoliday(start, end, holidays)
            // Bonus: long weekend
            const isLongWeekend = start.day() === 1 || end.day() === 5

            windows.push({
                startdate:     start.format('YYYY-MM-DD'),
                enddate:       end.format('YYYY-MM-DD'),
                workingDays:   countWorkingDays(start, end),
                hasHoliday,
                isLongWeekend,
                label:         `${start.format('DD MMM')} – ${end.format('DD MMM YYYY')}`
            })

            if (windows.length >= 6) break
        }
        if (windows.length >= 6) break
    }

    return windows
}

// ─── Main controller: get recommendation for an employee ─────────────────────
export const HandleGetRecommendation = async (req, res) => {
    try {
        const { employeeID }   = req.params
        const { startdate, enddate } = req.query

        const employee = await Employee.findOne({ _id: employeeID, organizationID: req.ORGID })
            .populate('department', 'name')
            .populate('attendance')

        if (!employee) {
            return res.status(404).json({ success: false, message: 'Employee not found' })
        }

        // All leaves for this employee
        const leaves = await Leave.find({ employee: employeeID })

        // All approved leaves in same department for team capacity check
        const departmentLeaves = await Leave.find({
            organizationID: req.ORGID,
            status: 'Approved'
        }).populate('employee', 'department')
          .then(all => all.filter(l => l.employee?.department?.toString() === employee.department?._id?.toString()))

        // Corporate holidays in next 3 months
        const holidays = await CorporateCalendar.find({
            organizationID: req.ORGID,
            eventdate: {
                $gte: new Date(),
                $lte: dayjs().add(3, 'month').toDate()
            }
        })

        // Run rule engine
        const result = runRules({
            employee,
            leaves,
            attendance:       employee.attendance,
            departmentLeaves,
            holidays,
            requestedStart:   startdate || null,
            requestedEnd:     enddate   || null,
        })

        // Suggested windows (always included)
        const suggestedWindows = suggestWindows(leaves, departmentLeaves, holidays, employeeID)

        // Leave history summary
        const year         = dayjs().year()
        const history      = leaves.map(l => ({
            startdate:   l.startdate,
            enddate:     l.enddate,
            title:       l.title,
            status:      l.status,
            days:        countWorkingDays(l.startdate, l.enddate)
        })).sort((a, b) => dayjs(b.startdate) - dayjs(a.startdate))

        const frequentMonth = getMostFrequentLeaveMonth(leaves.filter(l => l.status === 'Approved'))
        const monthNames    = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

        return res.status(200).json({
            success: true,
            type: 'LeaveRecommendation',
            data: {
                employee: {
                    id:         employee._id,
                    name:       `${employee.firstname} ${employee.lastname}`,
                    department: employee.department?.name || 'N/A'
                },
                recommendation: result,
                suggestedWindows,
                history,
                insight: frequentMonth !== null
                    ? `This employee typically takes leave in ${monthNames[frequentMonth]}`
                    : 'No leave history pattern detected yet'
            }
        })
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}

// ─── Org-wide leave summary for HR view ──────────────────────────────────────
export const HandleGetOrgLeaveSummary = async (req, res) => {
    try {
        const employees = await Employee.find({ organizationID: req.ORGID })
            .populate('department', 'name')
            .select('firstname lastname department')

        const year = dayjs().year()
        const summary = []

        for (const emp of employees) {
            const leaves   = await Leave.find({ employee: emp._id })
            const daysUsed = getLeaveDaysUsed(leaves, year)
            const daysLeft = ANNUAL_LEAVE_QUOTA - daysUsed
            const pending  = leaves.filter(l => l.status === 'Pending').length

            summary.push({
                employeeID:  emp._id,
                name:        `${emp.firstname} ${emp.lastname}`,
                department:  emp.department?.name || 'N/A',
                daysUsed,
                daysLeft,
                pending,
                quota:       ANNUAL_LEAVE_QUOTA
            })
        }

        return res.status(200).json({
            success: true,
            type: 'OrgLeaveSummary',
            data: summary
        })
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}