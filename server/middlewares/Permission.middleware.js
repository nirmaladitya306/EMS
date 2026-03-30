import { HumanResources } from '../models/HR.model.js'
import { Role } from '../models/Role.model.js'

// ─── CheckPermission middleware ───────────────────────────────────────────────
// Usage: router.get('/all', VerifyHRToken, CheckPermission('employee.view'), handler)
//
// How it works:
//  1. Look up the HR user's rbacRole
//  2. If they have no rbacRole assigned, fall back to allowing all (HR_ADMIN super role)
//     This preserves backward compat — existing HRs without a role assigned stay unrestricted
//  3. If they have a role, check the required permission is in their permissions array
//  4. Reject with 403 if the permission is missing

export const CheckPermission = (requiredPermission) => {
    return async (req, res, next) => {
        try {
            if (!req.HRid) {
                return res.status(401).json({ success: false, message: 'Unauthorized' })
            }

            const hr = await HumanResources.findById(req.HRid)
                .select('rbacRole')
                .lean()

            if (!hr) {
                return res.status(401).json({ success: false, message: 'HR user not found' })
            }

            // No RBAC role assigned → full access (super-admin / legacy HR)
            if (!hr.rbacRole) {
                return next()
            }

            const role = await Role.findById(hr.rbacRole).select('permissions').lean()

            if (!role) {
                // Role was deleted — fall back to full access
                return next()
            }

            if (!role.permissions.includes(requiredPermission)) {
                return res.status(403).json({
                    success: false,
                    message: `Access denied. Required permission: ${requiredPermission}`,
                    requiredPermission
                })
            }

            // Attach permissions to req for downstream use (optional)
            req.permissions = role.permissions
            next()

        } catch (error) {
            console.error('[RBAC] CheckPermission error:', error)
            return res.status(500).json({ success: false, message: 'Internal server error' })
        }
    }
}

// ─── LoadPermissions middleware ───────────────────────────────────────────────
// Attaches the HR's permission list to req.permissions without blocking.
// Use this on the /auth/hr/check-login route so the frontend gets permissions on load.
export const LoadPermissions = async (req, res, next) => {
    try {
        if (!req.HRid) return next()

        const hr = await HumanResources.findById(req.HRid)
            .select('rbacRole')
            .lean()

        if (!hr || !hr.rbacRole) {
            req.permissions = null   // null = unrestricted super-admin
            return next()
        }

        const role = await Role.findById(hr.rbacRole).select('permissions name').lean()
        req.permissions = role?.permissions || null
        req.rbacRoleName = role?.name || null
        next()
    } catch {
        next()
    }
}