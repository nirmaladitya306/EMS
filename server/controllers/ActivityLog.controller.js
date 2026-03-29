import { ActivityLog } from '../models/ActivityLog.model.js'
import dayjs from 'dayjs'

export const HandleGetActivityLogs = async (req, res) => {
    try {
        const { page = 1, limit = 50, actorRole } = req.query

        const filter = { organizationID: req.ORGID }

        if (actorRole && actorRole !== "All roles") {
            if (actorRole === "HR Admin") filter.actorRole = "HR"
            else filter.actorRole = actorRole
        }

        const logs = await ActivityLog.find(filter)
            .sort({ createdAt: -1 })
            .limit(Number(limit))

        return res.status(200).json({ success: true, data: logs })

    } catch (error) {
        return res.status(500).json({ success: false })
    }
}

// ─── Clear logs older than N days (HR-only maintenance) ─────────────────────
export const HandleClearOldLogs = async (req, res) => {
    try {
        const { days = 90 } = req.body
        const cutoff = dayjs().subtract(Number(days), 'day').toDate()
 
        const result = await ActivityLog.deleteMany({
            organizationID: req.ORGID,
            createdAt: { $lt: cutoff }
        })
 
        return res.status(200).json({
            success: true,
            message: `Deleted ${result.deletedCount} log(s) older than ${days} days`
        })
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}

// ─── Get logs for a single actor (HR or Employee) ───────────────────────────
export const HandleGetActorLogs = async (req, res) => {
    try {
        const { actorID } = req.params
        const logs = await ActivityLog.find({
            organizationID: req.ORGID,
            actorID
        }).sort({ createdAt: -1 }).limit(100)
 
        return res.status(200).json({ success: true, data: logs, type: 'ActorLogs' })
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}

// ─── Get logs for the currently logged-in employee ───────────────────────────
export const HandleGetMyActivityLogs = async (req, res) => {
    try {
        const logs = await ActivityLog.find({
            organizationID: req.ORGID,
            actorID: req.EMid
        }).sort({ createdAt: -1 }).limit(100)

        return res.status(200).json({ success: true, data: logs, type: 'MyActivityLogs' })
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}

export const HandleGetLogSummary = async (req, res) => {
    try {
        const since = dayjs().subtract(30, 'day').toDate()
 
        const summary = await ActivityLog.aggregate([
            {
                $match: {
                    organizationID: req.ORGID,
                    createdAt: { $gte: since }
                }
            },
            {
                $group: {
                    _id:   '$action',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } }
        ])
 
        // Count by actor role
        const hrCount  = await ActivityLog.countDocuments({ organizationID: req.ORGID, actorRole: 'HR-Admin',  createdAt: { $gte: since } })
        const empCount = await ActivityLog.countDocuments({ organizationID: req.ORGID, actorRole: 'Employee',  createdAt: { $gte: since } })
        const total    = await ActivityLog.countDocuments({ organizationID: req.ORGID, createdAt: { $gte: since } })
 
        return res.status(200).json({
            success: true,
            type: 'LogSummary',
            data: {
                total,
                byRole: { hr: hrCount, employee: empCount },
                byAction: summary
            }
        })
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}