import express from 'express'
import {
    HandleGetRecommendation,
    HandleGetOrgLeaveSummary
} from '../controllers/LeaveRecommendation.controller.js'
import { VerifyHRToken } from '../middlewares/Auth.middleware.js'
import { VerifyEmployeeToken } from '../middlewares/Auth.middleware.js'
import { RoleAuthorization } from '../middlewares/RoleAuth.middleware.js'

const router = express.Router()

// Employee can get their own recommendation
router.get('/employee/:employeeID', VerifyEmployeeToken, HandleGetRecommendation)

// HR can get recommendation for any employee + org-wide summary
router.get('/hr/:employeeID',   VerifyHRToken, RoleAuthorization('HR-Admin'), HandleGetRecommendation)
router.get('/org-summary',      VerifyHRToken, RoleAuthorization('HR-Admin'), HandleGetOrgLeaveSummary)

export default router