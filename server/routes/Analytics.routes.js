import express from 'express'
import { HandleGetHRAnalytics, HandleGetEmployeeAnalytics } from '../controllers/Analytics.controller.js'
import { VerifyHRToken, VerifyEmployeeToken } from '../middlewares/Auth.middleware.js'
import { RoleAuthorization } from '../middlewares/RoleAuth.middleware.js'
import { CheckPermission } from '../middlewares/Permission.middleware.js'

const router = express.Router()

router.get('/hr',       VerifyHRToken,       CheckPermission('analytics.view'), HandleGetHRAnalytics)
router.get('/employee', VerifyEmployeeToken,                                HandleGetEmployeeAnalytics)

export default router