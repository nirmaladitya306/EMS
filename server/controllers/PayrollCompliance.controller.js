import { Employee } from "../models/Employee.model.js";
import { Salary } from "../models/Salary.model.js";
import { Attendance } from "../models/Attendance.model.js";
import { Leave } from "../models/Leave.model.js";

// ─── Constants ────────────────────────────────────────────────────────────────
const COMPLIANCE_RULES = {
    MIN_ATTENDANCE_RATE: 75,          // % – employee must have ≥75% attendance to be payroll-eligible
    MAX_PENDING_LEAVES: 3,            // pending leave requests that block payroll
    MAX_DELAYED_SALARY_MONTHS: 2,     // consecutive delayed payments = compliance flag
    MIN_BASIC_PAY: 5000,              // absolute floor for basic pay (org-wide rule)
    MAX_BONUS_PCT: 50,                // bonus must not exceed 50% of basic pay
    MAX_DEDUCTION_PCT: 40,            // deductions must not exceed 40% of basic pay
    OVERDUE_DAYS_THRESHOLD: 15,       // days overdue before a Pending salary is flagged
};

/**
 * Run compliance checks for every employee salary record in the organisation.
 * Returns a per-employee report with:
 *  - eligibilityStatus  : "Eligible" | "Ineligible" | "Review Required"
 *  - complianceScore    : 0-100
 *  - flags              : array of { rule, severity, message }
 *  - recommendations    : string[]
 */
export const HandlePayrollComplianceCheck = async (req, res) => {
    try {
        const orgID = req.ORGID;

        // ── 1. Fetch all data we need ──────────────────────────────────────
        const [employees, salaries, attendances, leaves] = await Promise.all([
            Employee.find({ organizationID: orgID }).select("firstname lastname email department salary"),
            Salary.find({ organizationID: orgID }).populate("employee", "firstname lastname"),
            Attendance.find({ organizationID: orgID }),
            Leave.find({ organizationID: orgID }),
        ]);

        // ── 2. Build lookup maps ───────────────────────────────────────────
        const attendanceByEmployee = {};
        attendances.forEach(a => {
            attendanceByEmployee[a.employee.toString()] = a;
        });

        const leavesByEmployee = {};
        leaves.forEach(l => {
            const key = l.employee.toString();
            if (!leavesByEmployee[key]) leavesByEmployee[key] = [];
            leavesByEmployee[key].push(l);
        });

        const salariesByEmployee = {};
        salaries.forEach(s => {
            const key = s.employee?._id?.toString() || s.employee?.toString();
            if (!salariesByEmployee[key]) salariesByEmployee[key] = [];
            salariesByEmployee[key].push(s);
        });

        const now = new Date();

        // ── 3. Per-employee report ─────────────────────────────────────────
        const employeeReports = employees.map(emp => {
            const empID = emp._id.toString();
            const flags = [];
            const recommendations = [];

            const empSalaries  = salariesByEmployee[empID]  || [];
            const empAttendance = attendanceByEmployee[empID];
            const empLeaves    = leavesByEmployee[empID]    || [];

            // ── A. Salary record existence ─────────────────────────────────
            if (empSalaries.length === 0) {
                flags.push({
                    rule: "MISSING_SALARY_RECORD",
                    severity: "critical",
                    message: "No salary record found for this employee.",
                });
                recommendations.push("Create a salary record before running payroll.");
            }

            // ── B. Per-salary-record checks ────────────────────────────────
            let pendingOverdueCount  = 0;
            let delayedCount         = 0;

            empSalaries.forEach(sal => {
                // B1. Minimum basic pay
                if (sal.basicpay < COMPLIANCE_RULES.MIN_BASIC_PAY) {
                    flags.push({
                        rule: "BELOW_MIN_BASIC_PAY",
                        severity: "critical",
                        message: `Basic pay ₹${sal.basicpay} is below the minimum threshold of ₹${COMPLIANCE_RULES.MIN_BASIC_PAY}.`,
                        salaryID: sal._id,
                    });
                    recommendations.push(`Update basic pay for salary record to at least ₹${COMPLIANCE_RULES.MIN_BASIC_PAY}.`);
                }

                // B2. Bonus cap
                const bonusPct = sal.basicpay > 0 ? (sal.bonuses / sal.basicpay) * 100 : 0;
                if (bonusPct > COMPLIANCE_RULES.MAX_BONUS_PCT) {
                    flags.push({
                        rule: "BONUS_EXCEEDS_CAP",
                        severity: "warning",
                        message: `Bonus (${bonusPct.toFixed(1)}%) exceeds the allowed cap of ${COMPLIANCE_RULES.MAX_BONUS_PCT}%.`,
                        salaryID: sal._id,
                    });
                    recommendations.push("Review and adjust bonus percentage to comply with policy.");
                }

                // B3. Deduction cap
                const deductPct = sal.basicpay > 0 ? (sal.deductions / sal.basicpay) * 100 : 0;
                if (deductPct > COMPLIANCE_RULES.MAX_DEDUCTION_PCT) {
                    flags.push({
                        rule: "DEDUCTION_EXCEEDS_CAP",
                        severity: "warning",
                        message: `Deduction (${deductPct.toFixed(1)}%) exceeds the allowed cap of ${COMPLIANCE_RULES.MAX_DEDUCTION_PCT}%.`,
                        salaryID: sal._id,
                    });
                    recommendations.push("Review deduction percentage — it must not exceed 40% of basic pay.");
                }

                // B4. Overdue pending payment
                if (sal.status === "Pending") {
                    const overdueDays = Math.floor((now - new Date(sal.duedate)) / (1000 * 60 * 60 * 24));
                    if (overdueDays > COMPLIANCE_RULES.OVERDUE_DAYS_THRESHOLD) {
                        pendingOverdueCount++;
                        flags.push({
                            rule: "OVERDUE_PENDING_SALARY",
                            severity: "critical",
                            message: `Salary due on ${new Date(sal.duedate).toLocaleDateString("en-GB")} is ${overdueDays} days overdue.`,
                            salaryID: sal._id,
                        });
                    }
                }

                // B5. Delayed salary count
                if (sal.status === "Delayed") delayedCount++;
            });

            if (delayedCount >= COMPLIANCE_RULES.MAX_DELAYED_SALARY_MONTHS) {
                flags.push({
                    rule: "CONSECUTIVE_DELAYED_PAYMENTS",
                    severity: "critical",
                    message: `${delayedCount} salary records are marked Delayed — exceeds threshold of ${COMPLIANCE_RULES.MAX_DELAYED_SALARY_MONTHS}.`,
                });
                recommendations.push("Immediately process delayed salary payments and investigate the cause.");
            }

            // ── C. Attendance eligibility ──────────────────────────────────
            let attendanceRate = null;
            if (empAttendance) {
                const logs = empAttendance.attendancelog || [];
                const totalDays   = logs.length;
                const presentDays = logs.filter(l => l.logstatus === "Present").length;
                attendanceRate    = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : null;

                if (attendanceRate !== null && attendanceRate < COMPLIANCE_RULES.MIN_ATTENDANCE_RATE) {
                    flags.push({
                        rule: "LOW_ATTENDANCE_RATE",
                        severity: "warning",
                        message: `Attendance rate is ${attendanceRate}%, below the required ${COMPLIANCE_RULES.MIN_ATTENDANCE_RATE}% for payroll eligibility.`,
                    });
                    recommendations.push("Review employee attendance record before processing salary.");
                }
            } else {
                flags.push({
                    rule: "MISSING_ATTENDANCE_RECORD",
                    severity: "info",
                    message: "No attendance record found for this employee.",
                });
            }

            // ── D. Pending leave requests ──────────────────────────────────
            const pendingLeaves = empLeaves.filter(l => l.status === "Pending").length;
            if (pendingLeaves >= COMPLIANCE_RULES.MAX_PENDING_LEAVES) {
                flags.push({
                    rule: "EXCESSIVE_PENDING_LEAVES",
                    severity: "warning",
                    message: `${pendingLeaves} leave request(s) are still pending — may affect payroll calculation.`,
                });
                recommendations.push("Resolve pending leave requests before finalising payroll.");
            }

            // ── E. Compute compliance score ────────────────────────────────
            const criticalCount = flags.filter(f => f.severity === "critical").length;
            const warningCount  = flags.filter(f => f.severity === "warning").length;
            const infoCount     = flags.filter(f => f.severity === "info").length;

            const score = Math.max(
                0,
                100 - (criticalCount * 25) - (warningCount * 10) - (infoCount * 3)
            );

            // ── F. Determine eligibility status ────────────────────────────
            let eligibilityStatus;
            if (criticalCount > 0)        eligibilityStatus = "Ineligible";
            else if (warningCount > 0)    eligibilityStatus = "Review Required";
            else                          eligibilityStatus = "Eligible";

            // ── G. Latest salary summary ───────────────────────────────────
            const latestSalary = empSalaries.sort(
                (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            )[0] || null;

            return {
                employeeID:   emp._id,
                name:         `${emp.firstname} ${emp.lastname}`,
                email:        emp.email,
                department:   emp.department,
                eligibilityStatus,
                complianceScore: score,
                flags,
                recommendations: [...new Set(recommendations)],   // deduplicate
                summary: {
                    totalSalaryRecords:   empSalaries.length,
                    pendingOverdueCount,
                    delayedCount,
                    attendanceRate,
                    pendingLeaves,
                    latestNetPay:    latestSalary?.netpay    ?? null,
                    latestCurrency:  latestSalary?.currency  ?? null,
                    latestStatus:    latestSalary?.status    ?? null,
                    latestDueDate:   latestSalary?.duedate   ?? null,
                },
            };
        });

        // ── 4. Org-level summary ───────────────────────────────────────────
        const eligible        = employeeReports.filter(r => r.eligibilityStatus === "Eligible").length;
        const ineligible      = employeeReports.filter(r => r.eligibilityStatus === "Ineligible").length;
        const reviewRequired  = employeeReports.filter(r => r.eligibilityStatus === "Review Required").length;
        const avgScore        = employeeReports.length
            ? Math.round(employeeReports.reduce((s, r) => s + r.complianceScore, 0) / employeeReports.length)
            : 0;

        return res.status(200).json({
            success: true,
            message: "Payroll compliance check completed",
            orgSummary: {
                totalEmployees: employeeReports.length,
                eligible,
                ineligible,
                reviewRequired,
                avgComplianceScore: avgScore,
                rulesApplied: COMPLIANCE_RULES,
                checkedAt: now,
            },
            data: employeeReports,
        });

    } catch (error) {
        console.error("Payroll compliance error:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Single-employee compliance check — used for quick per-record validation.
 */
export const HandleSingleEmployeeCompliance = async (req, res) => {
    try {
        const { employeeID } = req.params;
        const orgID = req.ORGID;

        const [emp, empSalaries, empAttendance, empLeaves] = await Promise.all([
            Employee.findOne({ _id: employeeID, organizationID: orgID }),
            Salary.find({ employee: employeeID, organizationID: orgID }),
            Attendance.findOne({ employee: employeeID, organizationID: orgID }),
            Leave.find({ employee: employeeID, organizationID: orgID }),
        ]);

        if (!emp) return res.status(404).json({ success: false, message: "Employee not found" });

        // Reuse the same logic (simplified inline)
        const now   = new Date();
        const flags = [];
        const recommendations = [];

        if (empSalaries.length === 0) {
            flags.push({ rule: "MISSING_SALARY_RECORD", severity: "critical", message: "No salary record found." });
        }

        empSalaries.forEach(sal => {
            if (sal.basicpay < COMPLIANCE_RULES.MIN_BASIC_PAY) {
                flags.push({ rule: "BELOW_MIN_BASIC_PAY", severity: "critical", message: `Basic pay ₹${sal.basicpay} below minimum.`, salaryID: sal._id });
                recommendations.push(`Set basic pay to at least ₹${COMPLIANCE_RULES.MIN_BASIC_PAY}.`);
            }
            const bonusPct  = sal.basicpay > 0 ? (sal.bonuses / sal.basicpay) * 100 : 0;
            const deductPct = sal.basicpay > 0 ? (sal.deductions / sal.basicpay) * 100 : 0;
            if (bonusPct > COMPLIANCE_RULES.MAX_BONUS_PCT)
                flags.push({ rule: "BONUS_EXCEEDS_CAP", severity: "warning", message: `Bonus ${bonusPct.toFixed(1)}% exceeds ${COMPLIANCE_RULES.MAX_BONUS_PCT}% cap.`, salaryID: sal._id });
            if (deductPct > COMPLIANCE_RULES.MAX_DEDUCTION_PCT)
                flags.push({ rule: "DEDUCTION_EXCEEDS_CAP", severity: "warning", message: `Deduction ${deductPct.toFixed(1)}% exceeds ${COMPLIANCE_RULES.MAX_DEDUCTION_PCT}% cap.`, salaryID: sal._id });
            if (sal.status === "Pending") {
                const overdueDays = Math.floor((now - new Date(sal.duedate)) / (1000 * 60 * 60 * 24));
                if (overdueDays > COMPLIANCE_RULES.OVERDUE_DAYS_THRESHOLD)
                    flags.push({ rule: "OVERDUE_PENDING_SALARY", severity: "critical", message: `Salary ${overdueDays} days overdue.`, salaryID: sal._id });
            }
        });

        const delayedCount = empSalaries.filter(s => s.status === "Delayed").length;
        if (delayedCount >= COMPLIANCE_RULES.MAX_DELAYED_SALARY_MONTHS)
            flags.push({ rule: "CONSECUTIVE_DELAYED_PAYMENTS", severity: "critical", message: `${delayedCount} delayed payments.` });

        let attendanceRate = null;
        if (empAttendance) {
            const logs        = empAttendance.attendancelog || [];
            const totalDays   = logs.length;
            const presentDays = logs.filter(l => l.logstatus === "Present").length;
            attendanceRate    = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : null;
            if (attendanceRate !== null && attendanceRate < COMPLIANCE_RULES.MIN_ATTENDANCE_RATE)
                flags.push({ rule: "LOW_ATTENDANCE_RATE", severity: "warning", message: `Attendance ${attendanceRate}% below ${COMPLIANCE_RULES.MIN_ATTENDANCE_RATE}%.` });
        }

        const pendingLeaves = empLeaves.filter(l => l.status === "Pending").length;
        if (pendingLeaves >= COMPLIANCE_RULES.MAX_PENDING_LEAVES)
            flags.push({ rule: "EXCESSIVE_PENDING_LEAVES", severity: "warning", message: `${pendingLeaves} leave(s) pending.` });

        const criticalCount = flags.filter(f => f.severity === "critical").length;
        const warningCount  = flags.filter(f => f.severity === "warning").length;
        const score         = Math.max(0, 100 - (criticalCount * 25) - (warningCount * 10));
        const eligibilityStatus = criticalCount > 0 ? "Ineligible" : warningCount > 0 ? "Review Required" : "Eligible";

        return res.status(200).json({
            success: true,
            data: {
                employeeID: emp._id,
                name: `${emp.firstname} ${emp.lastname}`,
                eligibilityStatus,
                complianceScore: score,
                flags,
                recommendations: [...new Set(recommendations)],
                summary: { totalSalaryRecords: empSalaries.length, attendanceRate, pendingLeaves, delayedCount },
            },
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};