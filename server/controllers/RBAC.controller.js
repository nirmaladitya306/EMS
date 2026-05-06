import { Role, ALL_PERMISSIONS } from '../models/Role.model.js'
import { HumanResources } from '../models/HR.model.js'

// ─── Seed the default HR_ADMIN role for a new org ────────────────────────────
// Called automatically from HRAuth signup. Not an HTTP handler.
export const seedDefaultRoles = async (organizationID) => {
    const existing = await Role.findOne({ name: 'HR_ADMIN', organizationID })
    if (existing) return existing

    return await Role.create({
        name: 'HR_ADMIN',
        description: 'Full access to all modules. Cannot be deleted.',
        permissions: [...ALL_PERMISSIONS],
        isSystem: true,
        organizationID
    })
}

// ─── GET /v1/rbac/permissions ─────────────────────────────────────────────────
// Returns the full permission catalogue + groupings for the UI
export const HandleGetPermissionCatalogue = async (req, res) => {
    try {
        const { PERMISSION_GROUPS } = await import('../models/Role.model.js')
        return res.status(200).json({
            success: true,
            data: {
                all: ALL_PERMISSIONS,
                groups: PERMISSION_GROUPS
            }
        })
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Internal server error' })
    }
}

// ─── GET /v1/rbac/roles ───────────────────────────────────────────────────────
export const HandleGetAllRoles = async (req, res) => {
    try {
        const roles = await Role.find({ organizationID: req.ORGID }).sort({ isSystem: -1, createdAt: 1 })
        return res.status(200).json({ success: true, data: roles })
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Internal server error' })
    }
}

// ─── GET /v1/rbac/roles/:roleID ──────────────────────────────────────────────
export const HandleGetRole = async (req, res) => {
    try {
        const role = await Role.findOne({ _id: req.params.roleID, organizationID: req.ORGID })
        if (!role) return res.status(404).json({ success: false, message: 'Role not found' })
        return res.status(200).json({ success: true, data: role })
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Internal server error' })
    }
}

// ─── POST /v1/rbac/roles ─────────────────────────────────────────────────────
export const HandleCreateRole = async (req, res) => {
    try {
        const { name, description, permissions } = req.body

        if (!name) return res.status(400).json({ success: false, message: 'Role name is required' })

        // Validate permissions
        const invalid = (permissions || []).filter(p => !ALL_PERMISSIONS.includes(p))
        if (invalid.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Invalid permissions: ${invalid.join(', ')}`
            })
        }

        const role = await Role.create({
            name,
            description: description || '',
            permissions: permissions || [],
            isSystem: false,
            organizationID: req.ORGID
        })

        return res.status(201).json({ success: true, data: role, message: 'Role created successfully' })
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ success: false, message: 'A role with this name already exists' })
        }
        return res.status(500).json({ success: false, message: 'Internal server error' })
    }
}

// ─── PATCH /v1/rbac/roles/:roleID ────────────────────────────────────────────
export const HandleUpdateRole = async (req, res) => {
    try {
        const { name, description, permissions } = req.body
        const role = await Role.findOne({ _id: req.params.roleID, organizationID: req.ORGID })

        if (!role) return res.status(404).json({ success: false, message: 'Role not found' })

        // Validate permissions
        const invalid = (permissions || []).filter(p => !ALL_PERMISSIONS.includes(p))
        if (invalid.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Invalid permissions: ${invalid.join(', ')}`
            })
        }

        if (name)        role.name        = name
        if (description !== undefined) role.description = description
        if (permissions) role.permissions = permissions

        await role.save()
        return res.status(200).json({ success: true, data: role, message: 'Role updated successfully' })
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ success: false, message: 'A role with this name already exists' })
        }
        return res.status(500).json({ success: false, message: 'Internal server error' })
    }
}

// ─── DELETE /v1/rbac/roles/:roleID ───────────────────────────────────────────
export const HandleDeleteRole = async (req, res) => {
    try {
        const role = await Role.findOne({ _id: req.params.roleID, organizationID: req.ORGID })
        if (!role) return res.status(404).json({ success: false, message: 'Role not found' })
        if (role.isSystem) return res.status(400).json({ success: false, message: 'System roles cannot be deleted' })

        // Unassign this role from any HR users who had it
        await HumanResources.updateMany(
            { rbacRole: role._id, organizationID: req.ORGID },
            { $set: { rbacRole: null } }
        )

        await role.deleteOne()
        return res.status(200).json({ success: true, message: 'Role deleted successfully' })
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Internal server error' })
    }
}

// ─── GET /v1/rbac/hr-assignments ─────────────────────────────────────────────
// Returns all HR users with their assigned role populated
export const HandleGetHRAssignments = async (req, res) => {
    try {
        const hrs = await HumanResources.find({ organizationID: req.ORGID })
            .select('firstname lastname email rbacRole isverified lastlogin')
            .populate('rbacRole', 'name permissions isSystem')
            .sort({ createdAt: 1 })

        return res.status(200).json({ success: true, data: hrs })
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Internal server error' })
    }
}

// ─── PATCH /v1/rbac/assign ───────────────────────────────────────────────────
// Assign or unassign a role to/from an HR user
// body: { hrID, roleID }  — pass roleID: null to remove the assignment
export const HandleAssignRole = async (req, res) => {
    try {
        const { hrID, roleID } = req.body

        if (!hrID) return res.status(400).json({ success: false, message: 'hrID is required' })

        const hr = await HumanResources.findOne({ _id: hrID, organizationID: req.ORGID })
        if (!hr) return res.status(404).json({ success: false, message: 'HR user not found' })

        if (roleID) {
            const role = await Role.findOne({ _id: roleID, organizationID: req.ORGID })
            if (!role) return res.status(404).json({ success: false, message: 'Role not found' })
            hr.rbacRole = role._id
        } else {
            hr.rbacRole = null  // remove assignment → full access (super-admin)
        }

        await hr.save()

        const updated = await HumanResources.findById(hrID)
            .select('firstname lastname email rbacRole')
            .populate('rbacRole', 'name permissions isSystem')

        return res.status(200).json({ success: true, data: updated, message: 'Role assignment updated' })
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Internal server error' })
    }
}

// ─── GET /v1/rbac/my-permissions ─────────────────────────────────────────────
// Called by the frontend on login to load the current HR user's permissions
export const HandleGetMyPermissions = async (req, res) => {
    try {
        const hr = await HumanResources.findById(req.HRid)
            .select('rbacRole firstname lastname')
            .populate('rbacRole', 'name permissions isSystem')

        if (!hr) return res.status(404).json({ success: false, message: 'HR not found' })

        // No role → unrestricted (null permissions = all access in frontend guard)
        if (!hr.rbacRole) {
            return res.status(200).json({
                success: true,
                data: {
                    roleName: 'HR_ADMIN',
                    permissions: null,  // null = unrestricted
                    isUnrestricted: true
                }
            })
        }

        return res.status(200).json({
            success: true,
            data: {
                roleName: hr.rbacRole.name,
                permissions: hr.rbacRole.permissions,
                isUnrestricted: hr.rbacRole.isSystem && hr.rbacRole.name === 'HR_ADMIN'
            }
        })
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Internal server error' })
    }
}

import { RoleDrift } from '../models/RoleDrift.model.js';

// ─── GET /v1/rbac/drifts ─────────────────────────────────────────────────────
export const HandleGetRoleDrifts = async (req, res) => {
    try {
        const drifts = await RoleDrift.find({ organizationID: req.ORGID })
            .populate({
                path: 'hrUserID',
                select: 'firstname lastname email department',
                populate: { path: 'department', select: 'name' }
            })
            .populate('baseRole', 'name')
            .populate('driftRole', 'name')
            .sort({ createdAt: -1 });

        // Map the data to exactly match what our new React UI expects
        const formattedDrifts = drifts.map(d => ({
            _id: d._id,
            employee: d.hrUserID, 
            baseRole: d.baseRole,
            drift: {
                role: d.driftRole,
                reason: d.reason,
                expiresAt: d.expiresAt,
                isExpired: d.isExpired 
            }
        }));

        return res.status(200).json({ success: true, data: formattedDrifts });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Failed to fetch access drifts' });
    }
}

// ─── POST /v1/rbac/drifts/:driftID/revoke ────────────────────────────────────
export const HandleRevokeDrift = async (req, res) => {
    try {
        const { driftID } = req.params;

        const drift = await RoleDrift.findOneAndUpdate(
            { _id: driftID, organizationID: req.ORGID },
            { isRevoked: true },
            { new: true }
        );

        if (!drift) return res.status(404).json({ success: false, message: 'Drift record not found' });

        return res.status(200).json({ success: true, message: 'Privilege revoked successfully' });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Failed to revoke privilege' });
    }
}

// ─── POST /v1/rbac/drifts/:driftID/extend ────────────────────────────────────
export const HandleExtendDrift = async (req, res) => {
    try {
        const { driftID } = req.params;
        const { newExpiry } = req.body;

        const drift = await RoleDrift.findOneAndUpdate(
            { _id: driftID, organizationID: req.ORGID },
            { 
                expiresAt: new Date(newExpiry),
                isRevoked: false // Un-revoke if it was previously revoked
            },
            { new: true }
        );

        if (!drift) return res.status(404).json({ success: false, message: 'Drift record not found' });

        return res.status(200).json({ success: true, message: 'Privilege extended successfully' });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Failed to extend privilege' });
    }
}

// ─── POST /v1/rbac/drifts ────────────────────────────────────────────────────
export const HandleCreateDrift = async (req, res) => {
    try {
        const { hrUserID, driftRoleID, reason, expiresAt } = req.body;

        if (!hrUserID || !driftRoleID || !reason || !expiresAt) {
            return res.status(400).json({ success: false, message: 'All drift fields are required' });
        }

        const hr = await HumanResources.findOne({ _id: hrUserID, organizationID: req.ORGID });
        if (!hr) return res.status(404).json({ success: false, message: 'HR user not found' });

        const drift = await RoleDrift.create({
            organizationID: req.ORGID,
            hrUserID,
            baseRole: hr.rbacRole || null,
            driftRole: driftRoleID,
            reason,
            expiresAt: new Date(expiresAt),
            grantedBy: req.HRid
        });

        return res.status(201).json({ success: true, message: 'Privilege granted successfully', data: drift });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Failed to initiate access drift' });
    }
}