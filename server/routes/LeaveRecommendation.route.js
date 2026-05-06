import express from 'express'
import {
    HandleGetRecommendation,
    HandleGetOrgLeaveSummary
} from '../controllers/LeaveRecommendation.controller.js'
import { VerifyHRToken } from '../middlewares/Auth.middleware.js'
import { VerifyEmployeeToken } from '../middlewares/Auth.middleware.js'
import { RoleAuthorization } from '../middlewares/RoleAuth.middleware.js'
import { CheckPermission } from '../middlewares/Permission.middleware.js'

const router = express.Router()

// Employee can get their own recommendation
router.get('/employee/:employeeID', VerifyEmployeeToken, HandleGetRecommendation)

// HR can get recommendation for any employee + org-wide summary
router.get('/hr/:employeeID',   VerifyHRToken, CheckPermission('leaverecommendation.view'), HandleGetRecommendation)
router.get('/org-summary',      VerifyHRToken, CheckPermission('leaverecommendation.view'), HandleGetOrgLeaveSummary)

export default router