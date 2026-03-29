import { ExitClearance } from '../models/ExitClearance.model.js'
import { Employee } from '../models/Employee.model.js'
import { HumanResources } from '../models/HR.model.js'
import { createLog } from '../utils/activityLogger.js'

// ─── Default checklist tasks applied to every new clearance ──────────────────
const DEFAULT_CHECKLIST = [
    'IT Equipment Return',
    'Access Revocation',
    'Salary Settlement',
    'Leave Encashment',
    'Department Handover',
    'ID / Access Card Return',
    'Exit Interview',
    'HR Documentation'
]

// ─── Create a new exit clearance ─────────────────────────────────────────────
export const HandleCreateExitClearance = async (req, res) => {
    try {
        const { employeeID, reason, resignationDate, lastWorkingDate, exitDate, notes } = req.body

        if (!employeeID || !reason) {
            return res.status(400).json({ success: false, message: 'Employee ID and reason are required' })
        }

        const employee = await Employee.findOne({ _id: employeeID, organizationID: req.ORGID })
        if (!employee) {
            return res.status(404).json({ success: false, message: 'Employee not found' })
        }

        // Prevent duplicate active clearances for same employee
        const existing = await ExitClearance.findOne({
            employee: employeeID,
            organizationID: req.ORGID,
            status: { $in: ['Pending', 'In Progress'] }
        })
        if (existing) {
            return res.status(409).json({ success: false, message: 'An active exit clearance already exists for this employee' })
        }

        const checklist = DEFAULT_CHECKLIST.map(task => ({ task, completed: false }))

        const clearance = await ExitClearance.create({
            employee:       employeeID,
            initiatedBy:    req.HRid,
            reason,
            resignationDate: resignationDate ? new Date(resignationDate) : undefined,
            lastWorkingDate: lastWorkingDate ? new Date(lastWorkingDate) : undefined,
            exitDate:        exitDate        ? new Date(exitDate)        : undefined,
            notes:          notes || '',
            checklist,
            organizationID: req.ORGID
        })

        const hr = await HumanResources.findById(req.HRid).select('firstname lastname')
        const hrName = hr ? `${hr.firstname} ${hr.lastname}` : 'HR Admin'

        await createLog({
            actorID: req.HRid, actorName: hrName,
            action: 'OTHER',
            description: `${hrName} initiated exit clearance for ${employee.firstname} ${employee.lastname}`,
            targetID: clearance._id, targetModel: 'ExitClearance',
            organizationID: req.ORGID, req
        })

        const populated = await ExitClearance.findById(clearance._id)
            .populate('employee', 'firstname lastname email department')
            .populate('initiatedBy', 'firstname lastname')

        return res.status(201).json({ success: true, message: 'Exit clearance initiated', data: populated })
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}

// ─── Get all clearances for the org ──────────────────────────────────────────
export const HandleGetAllClearances = async (req, res) => {
    try {
        const { status } = req.query
        const filter = { organizationID: req.ORGID }
        if (status && status !== 'All') filter.status = status

        const clearances = await ExitClearance.find(filter)
            .populate('employee',    'firstname lastname email department')
            .populate('initiatedBy', 'firstname lastname')
            .sort({ createdAt: -1 })

        return res.status(200).json({ success: true, data: clearances, type: 'AllClearances' })
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}

// ─── Get a single clearance ───────────────────────────────────────────────────
export const HandleGetClearance = async (req, res) => {
    try {
        const { clearanceID } = req.params
        const clearance = await ExitClearance.findOne({ _id: clearanceID, organizationID: req.ORGID })
            .populate('employee',    'firstname lastname email department')
            .populate('initiatedBy', 'firstname lastname')
            .populate('checklist.completedBy', 'firstname lastname')

        if (!clearance) {
            return res.status(404).json({ success: false, message: 'Clearance not found' })
        }

        return res.status(200).json({ success: true, data: clearance })
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}

// ─── Toggle a checklist task ──────────────────────────────────────────────────
export const HandleToggleChecklistItem = async (req, res) => {
    try {
        const { clearanceID } = req.params
        const { itemID, notes } = req.body

        const clearance = await ExitClearance.findOne({ _id: clearanceID, organizationID: req.ORGID })
        if (!clearance) {
            return res.status(404).json({ success: false, message: 'Clearance not found' })
        }

        if (clearance.status === 'Cleared' || clearance.status === 'Rejected') {
            return res.status(400).json({ success: false, message: 'Cannot update a completed clearance' })
        }

        const item = clearance.checklist.id(itemID)
        if (!item) {
            return res.status(404).json({ success: false, message: 'Checklist item not found' })
        }

        item.completed   = !item.completed
        item.completedBy = item.completed ? req.HRid : undefined
        item.completedAt = item.completed ? new Date()  : undefined
        item.notes       = notes || item.notes

        // Auto-update status based on checklist progress
        const total     = clearance.checklist.length
        const done      = clearance.checklist.filter(i => i.completed).length
        if (done === 0)       clearance.status = 'Pending'
        else if (done < total) clearance.status = 'In Progress'

        await clearance.save()

        const populated = await ExitClearance.findById(clearanceID)
            .populate('employee',    'firstname lastname email department')
            .populate('initiatedBy', 'firstname lastname')
            .populate('checklist.completedBy', 'firstname lastname')

        return res.status(200).json({ success: true, data: populated })
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}

// ─── Mark clearance as Cleared or Rejected ───────────────────────────────────
export const HandleUpdateClearanceStatus = async (req, res) => {
    try {
        const { clearanceID } = req.params
        const { status, notes } = req.body

        if (!['Cleared', 'Rejected', 'In Progress', 'Pending'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' })
        }

        const clearance = await ExitClearance.findOne({ _id: clearanceID, organizationID: req.ORGID })
            .populate('employee', 'firstname lastname')
        if (!clearance) {
            return res.status(404).json({ success: false, message: 'Clearance not found' })
        }

        clearance.status = status
        if (notes) clearance.notes = notes
        if (status === 'Cleared') clearance.exitDate = new Date()

        await clearance.save()

        const hr = await HumanResources.findById(req.HRid).select('firstname lastname')
        const hrName = hr ? `${hr.firstname} ${hr.lastname}` : 'HR Admin'

        await createLog({
            actorID: req.HRid, actorName: hrName,
            action: 'OTHER',
            description: `${hrName} marked exit clearance for ${clearance.employee.firstname} ${clearance.employee.lastname} as ${status}`,
            targetID: clearanceID, targetModel: 'ExitClearance',
            organizationID: req.ORGID, req
        })

        const populated = await ExitClearance.findById(clearanceID)
            .populate('employee',    'firstname lastname email department')
            .populate('initiatedBy', 'firstname lastname')
            .populate('checklist.completedBy', 'firstname lastname')

        return res.status(200).json({ success: true, data: populated })
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}

// ─── Update clearance details (dates, notes) ─────────────────────────────────
export const HandleUpdateClearanceDetails = async (req, res) => {
    try {
        const { clearanceID } = req.params
        const { resignationDate, lastWorkingDate, exitDate, notes, reason } = req.body

        const clearance = await ExitClearance.findOne({ _id: clearanceID, organizationID: req.ORGID })
        if (!clearance) {
            return res.status(404).json({ success: false, message: 'Clearance not found' })
        }

        if (resignationDate) clearance.resignationDate = new Date(resignationDate)
        if (lastWorkingDate) clearance.lastWorkingDate = new Date(lastWorkingDate)
        if (exitDate)        clearance.exitDate        = new Date(exitDate)
        if (notes !== undefined) clearance.notes  = notes
        if (reason)          clearance.reason     = reason

        await clearance.save()

        const populated = await ExitClearance.findById(clearanceID)
            .populate('employee',    'firstname lastname email department')
            .populate('initiatedBy', 'firstname lastname')

        return res.status(200).json({ success: true, data: populated })
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}

// ─── Delete a clearance (HR admin only) ──────────────────────────────────────
export const HandleDeleteClearance = async (req, res) => {
    try {
        const { clearanceID } = req.params
        const clearance = await ExitClearance.findOne({ _id: clearanceID, organizationID: req.ORGID })
        if (!clearance) {
            return res.status(404).json({ success: false, message: 'Clearance not found' })
        }
        await clearance.deleteOne()
        return res.status(200).json({ success: true, message: 'Clearance deleted' })
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}

// ─── Summary counts for dashboard ────────────────────────────────────────────
export const HandleGetClearanceSummary = async (req, res) => {
    try {
        const base = { organizationID: req.ORGID }
        const [total, pending, inProgress, cleared, rejected] = await Promise.all([
            ExitClearance.countDocuments(base),
            ExitClearance.countDocuments({ ...base, status: 'Pending' }),
            ExitClearance.countDocuments({ ...base, status: 'In Progress' }),
            ExitClearance.countDocuments({ ...base, status: 'Cleared' }),
            ExitClearance.countDocuments({ ...base, status: 'Rejected' }),
        ])
        return res.status(200).json({ success: true, data: { total, pending, inProgress, cleared, rejected } })
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}