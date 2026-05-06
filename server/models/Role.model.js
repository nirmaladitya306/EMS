import express from 'express'
import {
    HandleGetAllDriftEvents,
    HandleGetDriftSummary,
    HandleResolveDrift,
    HandleDismissDrift,
    HandleGetEmployeeDrifts,
    HandleGetMyDriftEvents
} from '../controllers/AccessDrift.controller.js'
import { VerifyHRToken, VerifyEmployeeToken } from '../middlewares/Auth.middleware.js'
import { RoleAuthorization } from '../middlewares/RoleAuth.middleware.js'
import { CheckPermission } from '../middlewares/Permission.middleware.js'

const router = express.Router()

// ─── Employee routes ──────────────────────────────────────────────────────────
router.get('/my-drifts', VerifyEmployeeToken, HandleGetMyDriftEvents)

// ─── HR-only routes ───────────────────────────────────────────────────────────
router.get('/all',                    VerifyHRToken, CheckPermission('securityalerts.view'), HandleGetAllDriftEvents)
router.get('/summary',                VerifyHRToken, CheckPermission('securityalerts.view'), HandleGetDriftSummary)
router.get('/employee/:employeeID',   VerifyHRToken, CheckPermission('securityalerts.view'), HandleGetEmployeeDrifts)
router.patch('/resolve/:driftID',     VerifyHRToken, CheckPermission('securityalerts.resolve'), HandleResolveDrift)
router.patch('/dismiss/:driftID',     VerifyHRToken, CheckPermission('securityalerts.resolve'), HandleDismissDrift)

export default router
