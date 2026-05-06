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
import { CheckPermission } from '../middlewares/Permission.middleware.js'

const router = express.Router()

// Employee routes
router.get('/my-activity',      VerifyEmployeeToken, HandleGetMyActivityLogs)

// HR-only routes
router.get('/all',              VerifyHRToken, CheckPermission('activitylog.view'), HandleGetActivityLogs)
router.get('/summary',          VerifyHRToken, CheckPermission('activitylog.view'), HandleGetLogSummary)
router.get('/actor/:actorID',   VerifyHRToken, CheckPermission('activitylog.view'), HandleGetActorLogs)
router.delete('/clear',         VerifyHRToken, CheckPermission('activitylog.clear'), HandleClearOldLogs)

export default router