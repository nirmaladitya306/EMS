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

const router = express.Router()

// ─── Employee routes ──────────────────────────────────────────────────────────
router.get('/my-drifts', VerifyEmployeeToken, HandleGetMyDriftEvents)

// ─── HR-only routes ───────────────────────────────────────────────────────────
router.get('/all',                    VerifyHRToken, RoleAuthorization('HR-Admin'), HandleGetAllDriftEvents)
router.get('/summary',                VerifyHRToken, RoleAuthorization('HR-Admin'), HandleGetDriftSummary)
router.get('/employee/:employeeID',   VerifyHRToken, RoleAuthorization('HR-Admin'), HandleGetEmployeeDrifts)
router.patch('/resolve/:driftID',     VerifyHRToken, RoleAuthorization('HR-Admin'), HandleResolveDrift)
router.patch('/dismiss/:driftID',     VerifyHRToken, RoleAuthorization('HR-Admin'), HandleDismissDrift)

export default router
