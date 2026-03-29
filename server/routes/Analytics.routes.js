import express from 'express'
import { HandleGetHRAnalytics, HandleGetEmployeeAnalytics } from '../controllers/Analytics.controller.js'
import { VerifyHRToken, VerifyEmployeeToken } from '../middlewares/Auth.middleware.js'
import { RoleAuthorization } from '../middlewares/RoleAuth.middleware.js'

const router = express.Router()

router.get('/hr',       VerifyHRToken,       RoleAuthorization('HR-Admin'), HandleGetHRAnalytics)
router.get('/employee', VerifyEmployeeToken,                                HandleGetEmployeeAnalytics)

export default router