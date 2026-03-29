import { Department } from "../models/Department.model.js"
import { Employee } from "../models/Employee.model.js"
import { Organization } from "../models/Organization.model.js"
import { createLog } from "../utils/activityLogger.js"
import { Salary } from "../models/Salary.model.js"
import { Leave } from "../models/Leave.model.js"
import { Notice } from "../models/Notice.model.js"
import { Document } from "../models/Document.model.js"

export const HandleEmployeeUpdate = async (req, res) => {
    try {
        const { employeeId, updatedEmployee } = req.body

        const employee = await Employee.findByIdAndUpdate(
            employeeId,
            updatedEmployee,
            { new: true }
        )

        if (!employee) {
            return res.status(404).json({ success: false, message: "employee not found" })
        }

        const isHR = !!req.HRid

        let actorName = "Unknown"

        if (isHR) {
            const { HumanResources } = await import('../models/HR.model.js')
            const hr = await HumanResources.findById(req.HRid)
            actorName = hr ? `${hr.firstname} ${hr.lastname}` : "HR Admin"
        } else {
            actorName = `${employee.firstname} ${employee.lastname}`
        }

        // ✅ NO ROLE PASSED
        await createLog({
            actorID: isHR ? req.HRid : req.EMid,
            actorName,
            action: 'EMPLOYEE_UPDATED',
            description: `${actorName} updated employee ${employee.firstname} ${employee.lastname}`,
            targetID: employeeId,
            targetModel: 'Employee',
            organizationID: req.ORGID,
            req
        })

        return res.status(200).json({ success: true, data: employee })

    } catch (error) {
        return res.status(500).json({ success: false, message: "internal server error" })
    }
}

export const HandleEmployeeDelete = async (req, res) => {
    try {
        const { employeeId } = req.params

        const employee = await Employee.findById(employeeId)

        if (!employee) {
            return res.status(404).json({ success: false, message: "employee not found" })
        }

        await employee.deleteOne()

        const { HumanResources } = await import('../models/HR.model.js')
        const hr = await HumanResources.findById(req.HRid)

        const hrName = hr ? `${hr.firstname} ${hr.lastname}` : "HR Admin"

        // ✅ NO ROLE PASSED
        await createLog({
            actorID: req.HRid,
            actorName: hrName,
            action: 'EMPLOYEE_DELETED',
            description: `${hrName} deleted employee ${employee.firstname} ${employee.lastname}`,
            targetID: employeeId,
            targetModel: 'Employee',
            organizationID: req.ORGID,
            req
        })

        return res.status(200).json({ success: true })

    } catch (error) {
        return res.status(500).json({ success: false, message: "internal server error" })
    }
}

export const HandleAllEmployees = async (req, res) => {
    try {
        const employees = await Employee.find({ organizationID: req.ORGID }).populate("department", "name").select("firstname lastname email contactnumber department attendance notice salary leaverequest generaterequest isverified skills")
        return res.status(200).json({ success: true, data: employees, type: "AllEmployees" })
    } catch (error) {
        return res.status(500).json({ success: false, error: error, message: "internal server error" })
    }
}

export const HandleAllEmployeesIDS = async (req, res) => {
    try {
        const employees = await Employee.find({ organizationID: req.ORGID }).populate("department", "name").select("firstname lastname department")
        return res.status(200).json({ success: true, data: employees, type: "AllEmployeesIDS" })
    } catch (error) {
        return res.status(500).json({ success: false, error: error, message: "internal server error" })
    }
}

export const HandleEmployeeByEmployee = async (req, res) => {
    try {
        const employee = await Employee.findOne({ _id: req.EMid, organizationID: req.ORGID }).select("firstname lastname email contactnumber department attendance notice salary leaverequest generaterequest skills")

        if (!employee) {
            return res.status(404).json({ success: false, message: "employee not found" })
        }

        return res.json({ success: true, message: "Employee Data Fetched Successfully", data: employee })

    } catch (error) {
        return res.json({ success: false, message: "Internal Server Error", error: error })
    }
}

export const HandleSearchBySkills = async (req, res) => {
    try {
        const { skills } = req.query
        // skills is comma-separated: ?skills=React,Node
        if (!skills) {
            return res.status(400).json({ success: false, message: "skills query param is required" })
        }
        const skillArray = skills.split(',').map(s => s.trim()).filter(Boolean)
        const employees = await Employee.find({
            organizationID: req.ORGID,
            skills: { $in: skillArray.map(s => new RegExp(`^${s}$`, 'i')) }
        })
        .populate("department", "name")
        .select("firstname lastname email contactnumber department skills")

        return res.status(200).json({ success: true, data: employees, type: "SkillSearch" })
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}

export const HandleEmployeeByHR = async (req, res) => {
    try {
        const { employeeId } = req.params
        const employee = await Employee.findOne({ _id: employeeId, organizationID: req.ORGID }).select("firstname lastname email contactnumber department attendance notice salary leaverequest generaterequest skills")

        if (!employee) {
            return res.status(404).json({ success: false, message: "employee not found" })
        }
        
        return res.status(200).json({ success: true, data: employee, type: "GetEmployee" })
    }
    catch (error) {
        return res.status(404).json({ success: false, error: error, message: "employee not found" }) 
    }
}

// ─── Shared helper: build a timeline from an employee's related records ────────
const buildTimeline = async (employee) => {
    const events = []

    // 1. Hired (account creation date)
    events.push({
        type: "HIRED",
        date: employee.createdAt,
        description: `${employee.firstname} ${employee.lastname} joined the organisation.`,
        details: { email: employee.email }
    })

    // 2. Department assignments
    if (employee.department) {
        const dept = await Department.findById(employee.department).select("name createdAt")
        if (dept) {
            events.push({
                type: "DEPARTMENT_CHANGE",
                date: dept.createdAt,
                description: `Assigned to the ${dept.name} department.`,
                details: { department: dept.name }
            })
        }
    }

    // 3. Salary records
    const salaries = await Salary.find({ employee: employee._id }).sort({ createdAt: 1 })
    for (const sal of salaries) {
        events.push({
            type: "SALARY_UPDATED",
            date: sal.createdAt,
            description: `Salary record created — net pay ${sal.currency} ${sal.netpay}.`,
            details: {
                basic_pay: `${sal.currency} ${sal.basicpay}`,
                bonuses:   `${sal.currency} ${sal.bonuses}`,
                deductions:`${sal.currency} ${sal.deductions}`,
                net_pay:   `${sal.currency} ${sal.netpay}`,
                status:    sal.status
            }
        })
    }

    // 4. Approved leaves
    const leaves = await Leave.find({ employee: employee._id, status: "Approved" }).sort({ createdAt: 1 })
    for (const leave of leaves) {
        events.push({
            type: "LEAVE_APPROVED",
            date: leave.createdAt,
            description: `Leave approved: "${leave.title}".`,
            details: {
                title:      leave.title,
                start_date: new Date(leave.startdate).toLocaleDateString("en-GB"),
                end_date:   new Date(leave.enddate).toLocaleDateString("en-GB"),
                reason:     leave.reason
            }
        })
    }

    // 5. Notices issued to this employee
    const notices = await Notice.find({ employee: employee._id }).sort({ createdAt: 1 })
    for (const notice of notices) {
        events.push({
            type: "NOTICE_ISSUED",
            date: notice.createdAt,
            description: `Notice issued: "${notice.title}".`,
            details: { title: notice.title }
        })
    }

    // 6. Documents added
    const documents = await Document.find({ employee: employee._id }).sort({ createdAt: 1 })
    for (const doc of documents) {
        events.push({
            type: "DOCUMENT_ADDED",
            date: doc.createdAt,
            description: `Document added: "${doc.documentname}" (${doc.documenttype}).`,
            details: {
                document:   doc.documentname,
                type:       doc.documenttype,
                status:     doc.status,
                expiry:     new Date(doc.expirydate).toLocaleDateString("en-GB")
            }
        })
    }

    // Sort all events chronologically
    events.sort((a, b) => new Date(a.date) - new Date(b.date))

    return events
}

// ─── Employee views their own timeline ────────────────────────────────────────
export const HandleGetEmployeeTimeline = async (req, res) => {
    try {
        const employee = await Employee.findOne({ _id: req.EMid, organizationID: req.ORGID })
            .select("firstname lastname email department createdAt")
            .populate("department", "name")

        if (!employee) {
            return res.status(404).json({ success: false, message: "Employee not found" })
        }

        const events = await buildTimeline(employee)

        return res.status(200).json({
            success: true,
            data: {
                employee: {
                    firstname:  employee.firstname,
                    lastname:   employee.lastname,
                    email:      employee.email,
                    department: employee.department
                },
                events
            }
        })
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal server error" })
    }
}

// ─── HR views any employee's timeline ────────────────────────────────────────
export const HandleGetEmployeeTimelineByHR = async (req, res) => {
    try {
        const { employeeId } = req.params

        const employee = await Employee.findOne({ _id: employeeId, organizationID: req.ORGID })
            .select("firstname lastname email department createdAt")
            .populate("department", "name")

        if (!employee) {
            return res.status(404).json({ success: false, message: "Employee not found" })
        }

        const events = await buildTimeline(employee)

        return res.status(200).json({
            success: true,
            data: {
                employee: {
                    firstname:  employee.firstname,
                    lastname:   employee.lastname,
                    email:      employee.email,
                    department: employee.department
                },
                events
            }
        })
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal server error" })
    }
}