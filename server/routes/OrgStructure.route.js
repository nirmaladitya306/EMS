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
import { RoleAuthorization } from '../middlewares/RoleAuth.middleware.js'
import { VerifyEmployeeToken } from '../middlewares/Auth.middleware.js'

const router = express.Router()

// ── HR-only ────────────────────────────────────────────────────────────────────
router.post('/',                           VerifyHRToken, RoleAuthorization('HR-Admin'), HandleCreatePosition)
router.get('/all',                         VerifyHRToken, RoleAuthorization('HR-Admin'), HandleGetAllPositions)
router.get('/tree',                        VerifyHRToken, RoleAuthorization('HR-Admin'), HandleGetOrgTree)
router.patch('/:positionID',               VerifyHRToken, RoleAuthorization('HR-Admin'), HandleUpdatePosition)
router.delete('/:positionID',              VerifyHRToken, RoleAuthorization('HR-Admin'), HandleDeletePosition)
router.post('/:positionID/assign',         VerifyHRToken, RoleAuthorization('HR-Admin'), HandleAssignEmployee)
router.post('/:positionID/remove',         VerifyHRToken, RoleAuthorization('HR-Admin'), HandleRemoveEmployee)

// ── HR + Employee ──────────────────────────────────────────────────────────────
router.get('/reporting-chain/:employeeId', VerifyHRToken, RoleAuthorization('HR-Admin'), HandleGetReportingChain)

export default router