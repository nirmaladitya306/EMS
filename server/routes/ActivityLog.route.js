import express from 'express'
import {
    HandleGetActivityLogs,
    HandleGetActorLogs,
    HandleGetMyActivityLogs,
    HandleGetLogSummary,
    HandleClearOldLogs
} from '../controllers/ActivityLog.controller.js'
import { VerifyHRToken, VerifyEmployeeToken } from '../middlewares/Auth.middleware.js'
import { RoleAuthorization } from '../middlewares/RoleAuth.middleware.js'

const router = express.Router()

// Employee routes
router.get('/my-activity',      VerifyEmployeeToken, HandleGetMyActivityLogs)

// HR-only routes
router.get('/all',              VerifyHRToken, RoleAuthorization('HR-Admin'), HandleGetActivityLogs)
router.get('/summary',          VerifyHRToken, RoleAuthorization('HR-Admin'), HandleGetLogSummary)
router.get('/actor/:actorID',   VerifyHRToken, RoleAuthorization('HR-Admin'), HandleGetActorLogs)
router.delete('/clear',         VerifyHRToken, RoleAuthorization('HR-Admin'), HandleClearOldLogs)

export default router