import { Position } from '../models/Position.model.js'
import { Employee } from '../models/Employee.model.js'
import { Department } from '../models/Department.model.js'

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Recursively build a nested tree from a flat list of positions.
// Each position already has its reportsTo ID — we nest them in memory.
const buildTree = (positions, parentId = null) => {
    return positions
        .filter(p => {
            const rId = p.reportsTo?._id?.toString() || p.reportsTo?.toString() || null
            const pId = parentId?.toString() || null
            return rId === pId
        })
        .map(p => ({
            ...p.toObject(),
            children: buildTree(positions, p._id)
        }))
}

// ─── CREATE position ──────────────────────────────────────────────────────────
export const HandleCreatePosition = async (req, res) => {
    try {
        const { title, description, level, departmentID, reportsToID } = req.body

        if (!title || !level) {
            return res.status(400).json({ success: false, message: 'Title and level are required' })
        }

        const existing = await Position.findOne({ title, organizationID: req.ORGID })
        if (existing) {
            return res.status(409).json({ success: false, message: 'A position with this title already exists' })
        }

        // Validate reportsTo exists in same org
        if (reportsToID) {
            const parent = await Position.findOne({ _id: reportsToID, organizationID: req.ORGID })
            if (!parent) return res.status(404).json({ success: false, message: 'Parent position not found' })
        }

        const position = await Position.create({
            title,
            description: description || '',
            level: Number(level),
            department:  departmentID  || null,
            reportsTo:   reportsToID   || null,
            organizationID: req.ORGID
        })

        const populated = await Position.findById(position._id)
            .populate('department', 'name')
            .populate('reportsTo', 'title level')
            .populate('employees', 'firstname lastname')

        return res.status(201).json({ success: true, message: 'Position created', data: populated })
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}

// ─── GET all positions (flat list) ────────────────────────────────────────────
export const HandleGetAllPositions = async (req, res) => {
    try {
        const positions = await Position.find({ organizationID: req.ORGID })
            .populate('department', 'name')
            .populate('reportsTo', 'title level')
            .populate('employees', 'firstname lastname email')
            .sort({ level: 1, title: 1 })

        return res.status(200).json({ success: true, data: positions })
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}

// ─── GET org tree (nested) ────────────────────────────────────────────────────
export const HandleGetOrgTree = async (req, res) => {
    try {
        const positions = await Position.find({ organizationID: req.ORGID })
            .populate('department', 'name')
            .populate('reportsTo', 'title level')
            .populate('employees', 'firstname lastname email department')
            .sort({ level: 1 })

        const tree = buildTree(positions)

        // Summary counts
        const totalPositions = positions.length
        const filledPositions = positions.filter(p => p.employees.length > 0).length
        const totalEmployeesPlaced = positions.reduce((sum, p) => sum + p.employees.length, 0)

        return res.status(200).json({
            success: true,
            data: {
                tree,
                flat: positions,
                summary: { totalPositions, filledPositions, totalEmployeesPlaced }
            }
        })
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}

// ─── UPDATE position ──────────────────────────────────────────────────────────
export const HandleUpdatePosition = async (req, res) => {
    try {
        const { positionID } = req.params
        const { title, description, level, departmentID, reportsToID } = req.body

        const position = await Position.findOne({ _id: positionID, organizationID: req.ORGID })
        if (!position) return res.status(404).json({ success: false, message: 'Position not found' })

        // Prevent circular reporting
        if (reportsToID && reportsToID === positionID) {
            return res.status(400).json({ success: false, message: 'A position cannot report to itself' })
        }

        if (title)              position.title       = title
        if (description !== undefined) position.description = description
        if (level)              position.level       = Number(level)
        if (departmentID !== undefined) position.department  = departmentID || null
        if (reportsToID !== undefined)  position.reportsTo   = reportsToID  || null

        await position.save()

        const populated = await Position.findById(positionID)
            .populate('department', 'name')
            .populate('reportsTo', 'title level')
            .populate('employees', 'firstname lastname')

        return res.status(200).json({ success: true, message: 'Position updated', data: populated })
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}

// ─── DELETE position ──────────────────────────────────────────────────────────
export const HandleDeletePosition = async (req, res) => {
    try {
        const { positionID } = req.params

        const position = await Position.findOne({ _id: positionID, organizationID: req.ORGID })
        if (!position) return res.status(404).json({ success: false, message: 'Position not found' })

        // Unassign all employees who held this position
        if (position.employees.length > 0) {
            await Employee.updateMany(
                { _id: { $in: position.employees } },
                { $set: { position: null } }
            )
        }

        // Any positions that reported to this one now become root-level
        await Position.updateMany(
            { reportsTo: positionID, organizationID: req.ORGID },
            { $set: { reportsTo: null } }
        )

        await position.deleteOne()

        return res.status(200).json({ success: true, message: 'Position deleted', deletedID: positionID })
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}

// ─── ASSIGN employee to position ──────────────────────────────────────────────
export const HandleAssignEmployee = async (req, res) => {
    try {
        const { positionID } = req.params
        const { employeeID, managerID } = req.body

        if (!employeeID) {
            return res.status(400).json({ success: false, message: 'employeeID is required' })
        }

        const [position, employee] = await Promise.all([
            Position.findOne({ _id: positionID, organizationID: req.ORGID }),
            Employee.findOne({ _id: employeeID, organizationID: req.ORGID })
        ])

        if (!position) return res.status(404).json({ success: false, message: 'Position not found' })
        if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' })

        // Remove employee from their previous position if they had one
        if (employee.position && employee.position.toString() !== positionID) {
            await Position.findByIdAndUpdate(
                employee.position,
                { $pull: { employees: employeeID } }
            )
        }

        // Add to new position if not already there
        if (!position.employees.map(e => e.toString()).includes(employeeID)) {
            position.employees.push(employeeID)
            await position.save()
        }

        // Update employee's position and optionally their manager
        const update = { position: positionID }
        if (managerID !== undefined) update.manager = managerID || null
        await Employee.findByIdAndUpdate(employeeID, { $set: update })

        const populated = await Position.findById(positionID)
            .populate('department', 'name')
            .populate('reportsTo', 'title level')
            .populate('employees', 'firstname lastname email')

        return res.status(200).json({ success: true, message: 'Employee assigned to position', data: populated })
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}

// ─── REMOVE employee from position ────────────────────────────────────────────
export const HandleRemoveEmployee = async (req, res) => {
    try {
        const { positionID } = req.params
        const { employeeID } = req.body

        if (!employeeID) {
            return res.status(400).json({ success: false, message: 'employeeID is required' })
        }

        const [position, employee] = await Promise.all([
            Position.findOne({ _id: positionID, organizationID: req.ORGID }),
            Employee.findOne({ _id: employeeID, organizationID: req.ORGID })
        ])

        if (!position) return res.status(404).json({ success: false, message: 'Position not found' })
        if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' })

        position.employees = position.employees.filter(e => e.toString() !== employeeID)
        await position.save()

        await Employee.findByIdAndUpdate(employeeID, { $set: { position: null, manager: null } })

        const populated = await Position.findById(positionID)
            .populate('department', 'name')
            .populate('reportsTo', 'title level')
            .populate('employees', 'firstname lastname email')

        return res.status(200).json({ success: true, message: 'Employee removed from position', data: populated })
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}

// ─── GET reporting chain for a specific employee ───────────────────────────────
export const HandleGetReportingChain = async (req, res) => {
    try {
        const { employeeId } = req.params

        const employee = await Employee.findOne({ _id: employeeId, organizationID: req.ORGID })
            .populate('position', 'title level reportsTo')
            .populate('manager', 'firstname lastname email position')
            .populate({ path: 'manager', populate: { path: 'position', select: 'title' } })

        if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' })

        // Direct reports — employees who list this employee as their manager
        const directReports = await Employee.find({ manager: employeeId, organizationID: req.ORGID })
            .select('firstname lastname email')
            .populate('position', 'title')

        return res.status(200).json({
            success: true,
            data: {
                employee: {
                    id:       employee._id,
                    name:     `${employee.firstname} ${employee.lastname}`,
                    position: employee.position,
                    manager:  employee.manager
                },
                directReports
            }
        })
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}