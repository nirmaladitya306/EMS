import { ActivityLog } from '../models/ActivityLog.model.js'
import { runDriftDetection } from './accessDriftDetector.js'

export const createLog = async ({
    actorID,
    actorName,
    action,
    description,
    targetID = null,
    targetModel = null,
    meta = {},
    organizationID,
    req = null
}) => {
    try {
        // ✅ SINGLE SOURCE OF TRUTH (NO HARDCODING ANYWHERE)
        let role = "Employee";

        if (req?.HRid) {
            role = "HR-Admin";
        } else if (req?.EMid) {
            role = "Employee";
        }

        await ActivityLog.create({
            actorID,
            actorName,
            actorRole: role,
            action,
            description,
            targetID,
            targetModel,
            method: req?.method || null,
            endpoint: req?.path || null,
            statusCode: 200,
            meta,
            organizationID
        });
        await runDriftDetection({
    employeeID: actorID,
    organizationID,
    req
})

    } catch (err) {
        console.error('[ActivityLog] Failed:', err.message)
    }
}