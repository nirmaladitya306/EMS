import { Attendance } from "../models/Attendance.model.js"
import { Employee } from "../models/Employee.model.js"
import { createLog } from "../utils/activityLogger.js"

// Employee: get their own attendance record
export const HandleEmployeeAttendance = async (req, res) => {
    try {
        const employee = await Employee.findOne({ _id: req.EMid, organizationID: req.ORGID })
        if (!employee) return res.status(404).json({ success: false, message: "Employee not found" })
        if (!employee.attendance) return res.status(200).json({ success: true, data: null, message: "No attendance record yet" })

        const attendance = await Attendance.findOne({ _id: employee.attendance, organizationID: req.ORGID })
        return res.status(200).json({ success: true, data: attendance })
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error })
    }
}

export const HandleInitializeAttendance = async (req, res) => {
    try {
        const { employeeID } = req.body

        if (!employeeID) {
            return res.status(400).json({ success: false, message: "All fields are required" })
        }

        const employee = await Employee.findOne({ _id: employeeID, organizationID: req.ORGID })

        if (!employee) {
            return res.status(404).json({ success: false, message: "Employee not found" })
        }

        if (employee.attendance) {
            return res.status(400).json({ success: false, message: "Attendance Log already initialized for this employee" })
        }

        const currentdate = new Date().toISOString().split("T")[0]
        const attendancelog = {
            logdate: currentdate,
            logstatus: "Not Specified"
        }

        const newAttendance = await Attendance.create({
            employee: employeeID,
            status: "Not Specified",
            organizationID: req.ORGID
        })

        newAttendance.attendancelog.push(attendancelog)
        employee.attendance = newAttendance._id

        await employee.save()
        await newAttendance.save()

        await createLog({
            actorID:      employee._id,
            actorName:    `${employee.firstname} ${employee.lastname}`,
            action:       'ATTENDANCE_UPDATED',
            description:  `${employee.firstname} ${employee.lastname} initialized their attendance record`,
            targetID:     newAttendance._id,
            targetModel:  'Attendance',
            organizationID: req.ORGID,
            req
        })

        return res.status(200).json({ success: true, message: "Attendance Log Initialized Successfully", data: newAttendance })

    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error })
    }
}

export const HandleAllAttendance = async (req, res) => {
    try {
        const attendance = await Attendance.find({ organizationID: req.ORGID }).populate("employee", "firstname lastname department")
        return res.status(200).json({ success: true, message: "All attendance records retrieved successfully", data: attendance })
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error })
    }
}

export const HandleAttendance = async (req, res) => {
    try {
        const { attendanceID } = req.params

        if (!attendanceID) {
            return res.status(400).json({ success: false, message: "All fields are required" })
        }

        const attendance = await Attendance.findOne({ _id: attendanceID, organizationID: req.ORGID }).populate("employee", "firstname lastname department")

        if (!attendance) {
            return res.status(404).json({ success: false, message: "Attendance not found" })
        }

        return res.status(200).json({ success: true, message: "Attendance record retrieved successfully", data: attendance })

    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error })
    }
}

export const HandleUpdateAttendance = async (req, res) => {
    try {
        const { attendanceID, status, currentdate } = req.body

        const attendance = await Attendance.findOne({ _id: attendanceID, organizationID: req.ORGID })

        if (!attendance) {
            return res.status(404).json({ success: false, message: "Attendance not found" })
        }

        const FindDate = attendance.attendancelog.find((item) => item.logdate.toISOString().split("T")[0] === currentdate)

        if (!FindDate) {
            const newLog = {
                logdate: currentdate,
                logstatus: status
            }
            attendance.attendancelog.push(newLog)
        }
        else {
            FindDate.logstatus = status
        }

        await attendance.save()

        // Log the attendance mark so drift detection sees daily activity
        const empDoc = await Employee.findById(attendance.employee).select('firstname lastname')
        if (empDoc) {
            await createLog({
                actorID:      empDoc._id,
                actorName:    `${empDoc.firstname} ${empDoc.lastname}`,
                action:       'ATTENDANCE_UPDATED',
                description:  `${empDoc.firstname} ${empDoc.lastname} marked attendance as ${status} for ${currentdate}`,
                targetID:     attendance._id,
                targetModel:  'Attendance',
                organizationID: req.ORGID,
                req
            })
        }

        return res.status(200).json({ success: true, message: "Attendance status updated successfully", data: attendance })
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error })
    }
}

export const HandleDeleteAttendance = async (req, res) => {
    try {
        const { attendanceID } = req.params
        const attendance = await Attendance.findOne({ _id: attendanceID, organizationID: req.ORGID })

        if (!attendance) {
            return res.status(404).json({ success: false, message: "Attendance not found" })
        }

        const employee = await Employee.findById(attendance.employee)
        employee.attendance = null

        await employee.save()
        await attendance.deleteOne()

        return res.status(200).json({ success: true, message: "Attendance record deleted successfully" })
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error })
    }
}