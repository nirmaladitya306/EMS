import express from 'express'
import { HandlePayrollComplianceCheck, HandleSingleEmployeeCompliance } from '../controllers/PayrollCompliance.controller.js'
import { VerifyHRToken } from '../middlewares/Auth.middleware.js'
import { RoleAuthorization } from '../middlewares/RoleAuth.middleware.js'

const router = express.Router()

// Full org-wide compliance check
router.get('/check', VerifyHRToken, RoleAuthorization('HR-Admin'), HandlePayrollComplianceCheck)

// Single employee compliance
router.get('/check/:employeeID', VerifyHRToken, RoleAuthorization('HR-Admin'), HandleSingleEmployeeCompliance)

export default router
