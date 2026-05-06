import express from 'express'
import {
    HandlePayrollComplianceCheck,
    HandleSingleEmployeeCompliance,
} from '../controllers/PayrollCompliance.controller.js'
import { VerifyHRToken }     from '../middlewares/Auth.middleware.js'
import { CheckPermission }   from '../middlewares/Permission.middleware.js'

const router = express.Router()

// Full org-wide compliance check
router.get('/check',
    VerifyHRToken,
    CheckPermission('payrollcompliance.view'),
    HandlePayrollComplianceCheck
)

// Single employee compliance
router.get('/check/:employeeID',
    VerifyHRToken,
    CheckPermission('payrollcompliance.view'),
    HandleSingleEmployeeCompliance
)

export default router
