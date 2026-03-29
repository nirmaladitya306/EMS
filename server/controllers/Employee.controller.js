import { Department } from "../models/Department.model.js"
import { Employee } from "../models/Employee.model.js"
import { Organization } from "../models/Organization.model.js"
import { createLog } from "../utils/activityLogger.js"

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