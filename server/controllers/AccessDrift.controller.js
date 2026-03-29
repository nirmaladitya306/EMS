import { AccessDrift } from '../models/AccessDrift.model.js'
import { HumanResources } from '../models/HR.model.js'
import { createLog } from '../utils/activityLogger.js'

// ─── HR: Get all drift events for the org ────────────────────────────────────
export const HandleGetAllDriftEvents = async (req, res) => {
    try {
        const { status, severity, driftType, page = 1, limit = 50 } = req.query

        const filter = { organizationID: req.ORGID }
        if (status && status !== 'ALL')    filter.status    = status
        if (severity && severity !== 'ALL') filter.severity = severity
        if (driftType && driftType !== 'ALL') filter.driftType = driftType

        const skip  = (Number(page) - 1) * Number(limit)
        const total = await AccessDrift.countDocuments(filter)

        const drifts = await AccessDrift.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit))

        return res.status(200).json({
            success: true,
            data: drifts,
            pagination: {
                total,
                page:       Number(page),
                limit:      Number(limit),
                totalPages: Math.ceil(total / Number(limit))
            }
        })
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}

// ─── HR: Get drift summary stats ──────────────────────────────────────────────
export const HandleGetDriftSummary = async (req, res) => {
    try {
        const orgFilter = { organizationID: req.ORGID }

        const [total, open, resolved, dismissed, critical, high, bySeverity, byType] = await Promise.all([
            AccessDrift.countDocuments(orgFilter),
            AccessDrift.countDocuments({ ...orgFilter, status: 'OPEN' }),
            AccessDrift.countDocuments({ ...orgFilter, status: 'RESOLVED' }),
            AccessDrift.countDocuments({ ...orgFilter, status: 'DISMISSED' }),
            AccessDrift.countDocuments({ ...orgFilter, status: 'OPEN', severity: 'CRITICAL' }),
            AccessDrift.countDocuments({ ...orgFilter, status: 'OPEN', severity: 'HIGH' }),
            AccessDrift.aggregate([
                { $match: orgFilter },
                { $group: { _id: '$severity', count: { $sum: 1 } } }
            ]),
            AccessDrift.aggregate([
                { $match: { ...orgFilter, status: 'OPEN' } },
                { $group: { _id: '$driftType', count: { $sum: 1 } } },
                { $sort: { count: -1 } }
            ])
        ])

        return res.status(200).json({
            success: true,
            data: { total, open, resolved, dismissed, critical, high, bySeverity, byType }
        })
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}

// ─── HR: Resolve a drift event ────────────────────────────────────────────────
export const HandleResolveDrift = async (req, res) => {
    try {
        const { driftID } = req.params
        const { resolutionNote } = req.body

        const hr = await HumanResources.findById(req.HRid)
        if (!hr) return res.status(404).json({ success: false, message: 'HR not found' })

        const drift = await AccessDrift.findOneAndUpdate(
            { _id: driftID, organizationID: req.ORGID },
            {
                status:         'RESOLVED',
                resolvedBy:     req.HRid,
                resolvedByName: `${hr.firstname} ${hr.lastname}`,
                resolvedAt:     new Date(),
                resolutionNote: resolutionNote || ''
            },
            { new: true }
        )

        if (!drift) return res.status(404).json({ success: false, message: 'Drift event not found' })

        await createLog({
            actorID:    req.HRid,
            actorName:  `${hr.firstname} ${hr.lastname}`,
            action:     'ACCESS_DRIFT_RESOLVED',
            description: `${hr.firstname} ${hr.lastname} resolved drift event for ${drift.employeeName}: ${drift.driftType}`,
            targetID:   drift.employeeID,
            targetModel:'Employee',
            organizationID: req.ORGID,
            req
        })

        return res.status(200).json({ success: true, data: drift })
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}

// ─── HR: Dismiss a drift event ────────────────────────────────────────────────
export const HandleDismissDrift = async (req, res) => {
    try {
        const { driftID } = req.params
        const { resolutionNote } = req.body

        const hr = await HumanResources.findById(req.HRid)
        if (!hr) return res.status(404).json({ success: false, message: 'HR not found' })

        const drift = await AccessDrift.findOneAndUpdate(
            { _id: driftID, organizationID: req.ORGID },
            {
                status:         'DISMISSED',
                resolvedBy:     req.HRid,
                resolvedByName: `${hr.firstname} ${hr.lastname}`,
                resolvedAt:     new Date(),
                resolutionNote: resolutionNote || 'Dismissed as false positive'
            },
            { new: true }
        )

        if (!drift) return res.status(404).json({ success: false, message: 'Drift event not found' })

        return res.status(200).json({ success: true, data: drift })
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}

// ─── HR: Get drift events for a specific employee ─────────────────────────────
export const HandleGetEmployeeDrifts = async (req, res) => {
    try {
        const { employeeID } = req.params
        const drifts = await AccessDrift.find({
            organizationID: req.ORGID,
            employeeID
        }).sort({ createdAt: -1 }).limit(50)

        return res.status(200).json({ success: true, data: drifts })
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}

// ─── Employee: Get own drift events ──────────────────────────────────────────
export const HandleGetMyDriftEvents = async (req, res) => {
    try {
        const drifts = await AccessDrift.find({
            organizationID: req.ORGID,
            employeeID: req.EMid
        }).sort({ createdAt: -1 }).limit(50)

        return res.status(200).json({ success: true, data: drifts })
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}
