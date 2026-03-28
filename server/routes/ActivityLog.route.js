import express from 'express'
import {
    HandleGetActivityLogs,
    HandleGetActorLogs,
    HandleGetLogSummary,
    HandleClearOldLogs
} from '../controllers/ActivityLog.controller.js'
import { VerifyHRToken } from '../middlewares/Auth.middleware.js'
import { RoleAuthorization } from '../middlewares/RoleAuth.middleware.js'

const router = express.Router()

// All activity log routes are HR-only
router.get('/all',              VerifyHRToken, RoleAuthorization('HR-Admin'), HandleGetActivityLogs)
router.get('/summary',          VerifyHRToken, RoleAuthorization('HR-Admin'), HandleGetLogSummary)
router.get('/actor/:actorID',   VerifyHRToken, RoleAuthorization('HR-Admin'), HandleGetActorLogs)
router.delete('/clear',         VerifyHRToken, RoleAuthorization('HR-Admin'), HandleClearOldLogs)

export default router