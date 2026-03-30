import express from 'express'
import {
    HandleGetPermissionCatalogue,
    HandleGetAllRoles,
    HandleGetRole,
    HandleCreateRole,
    HandleUpdateRole,
    HandleDeleteRole,
    HandleGetHRAssignments,
    HandleAssignRole,
    HandleGetMyPermissions,
} from '../controllers/RBAC.controller.js'
import { VerifyHRToken } from '../middlewares/Auth.middleware.js'
import { CheckPermission } from '../middlewares/Permission.middleware.js'

const router = express.Router()

// ── My permissions (every HR user can call this on login) ─────────────────────
router.get('/my-permissions', VerifyHRToken, HandleGetMyPermissions)

// ── Permission catalogue (list of all possible permissions for the UI) ─────────
router.get('/permissions', VerifyHRToken, CheckPermission('rbac.view'), HandleGetPermissionCatalogue)

// ── Roles CRUD ─────────────────────────────────────────────────────────────────
router.get('/roles',            VerifyHRToken, CheckPermission('rbac.view'),   HandleGetAllRoles)
router.get('/roles/:roleID',    VerifyHRToken, CheckPermission('rbac.view'),   HandleGetRole)
router.post('/roles',           VerifyHRToken, CheckPermission('rbac.create'), HandleCreateRole)
router.patch('/roles/:roleID',  VerifyHRToken, CheckPermission('rbac.update'), HandleUpdateRole)
router.delete('/roles/:roleID', VerifyHRToken, CheckPermission('rbac.delete'), HandleDeleteRole)

// ── HR user → Role assignments ─────────────────────────────────────────────────
router.get('/hr-assignments',   VerifyHRToken, CheckPermission('rbac.view'),   HandleGetHRAssignments)
router.patch('/assign',         VerifyHRToken, CheckPermission('rbac.assign'), HandleAssignRole)

export default router