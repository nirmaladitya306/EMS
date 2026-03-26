import express from 'express'
import {
    HandleGetActivityLogs,
    HandleGetActorLogs,
    HandleGetLogSummary,
    HandleClearOldLogs
} from '../controllers/ActivityLog.controller.js'
import { VerifyhHRToken } from '../middlewares/Auth.middleware.js'
import { RoleAuthorization } from '../middlewares/RoleAuth.middleware.js'

const router = express.Router()

// All activity log routes are HR-only
router.get('/all',              VerifyhHRToken, RoleAuthorization('HR-Admin'), HandleGetActivityLogs)
router.get('/summary',          VerifyhHRToken, RoleAuthorization('HR-Admin'), HandleGetLogSummary)
router.get('/actor/:actorID',   VerifyhHRToken, RoleAuthorization('HR-Admin'), HandleGetActorLogs)
router.delete('/clear',         VerifyhHRToken, RoleAuthorization('HR-Admin'), HandleClearOldLogs)

export default router