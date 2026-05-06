import express from 'express'
import {
    HandleCreatePosition,
    HandleGetAllPositions,
    HandleGetOrgTree,
    HandleUpdatePosition,
    HandleDeletePosition,
    HandleAssignEmployee,
    HandleRemoveEmployee,
    HandleGetReportingChain,
} from '../controllers/OrgStructure.controller.js'
import { VerifyHRToken } from '../middlewares/Auth.middleware.js'
// ✅ We completely swap out RoleAuthorization for CheckPermission
import { CheckPermission } from "../middlewares/Permission.middleware.js"

const router = express.Router()

// ── HR-only ────────────────────────────────────────────────────────────────────

// CREATE
router.post('/', VerifyHRToken, CheckPermission('department.create'), HandleCreatePosition)

// READ (View) - ✅ Arjun has 'department.view', so these will now let him through!
router.get('/all',  VerifyHRToken, CheckPermission('department.view'), HandleGetAllPositions)
router.get('/tree', VerifyHRToken, CheckPermission('department.view'), HandleGetOrgTree)

// UPDATE
router.patch('/:positionID',       VerifyHRToken, CheckPermission('department.edit'), HandleUpdatePosition)
router.post('/:positionID/assign', VerifyHRToken, CheckPermission('department.edit'), HandleAssignEmployee)
router.post('/:positionID/remove', VerifyHRToken, CheckPermission('department.edit'), HandleRemoveEmployee)

// DELETE
router.delete('/:positionID', VerifyHRToken, CheckPermission('department.delete'), HandleDeletePosition)

// ── HR + Employee ──────────────────────────────────────────────────────────────
router.get('/reporting-chain/:employeeId', VerifyHRToken, CheckPermission('department.view'), HandleGetReportingChain)

export default router