import { ActivityLog } from '../models/ActivityLog.model.js'

/**
 * createLog — call this inside any controller after a successful operation
 *
 * @param {object} options
 * @param {string}   options.actorID    - The HR or Employee _id performing the action
 * @param {string}   options.actorName  - Display name e.g. "John Smith"
 * @param {string}   options.actorRole  - "HR-Admin" | "Employee"
 * @param {string}   options.action     - One of the enum values in ActivityLog model
 * @param {string}   options.description - Human-readable sentence e.g. "HR John created employee Jane"
 * @param {string}   [options.targetID]  - MongoDB ID of the affected resource
 * @param {string}   [options.targetModel] - Model name e.g. "Employee"
 * @param {object}   [options.meta]     - Any extra data worth storing
 * @param {string}   options.organizationID
 * @param {object}   [options.req]      - Express req object (to capture method/endpoint)
 */
export const createLog = async ({
    actorID,
    actorName,
    actorRole,
    action,
    description,
    targetID      = null,
    targetModel   = null,
    meta          = {},
    organizationID,
    req           = null
}) => {
    try {
        await ActivityLog.create({
            actorID,
            actorName,
            actorRole,
            action,
            description,
            targetID,
            targetModel,
            method:   req?.method   || null,
            endpoint: req?.path     || null,
            statusCode: 200,
            meta,
            organizationID
        })
    } catch (err) {
        // Logging must never crash the main request — swallow silently
        console.error('[ActivityLog] Failed to write log:', err.message)
    }
}