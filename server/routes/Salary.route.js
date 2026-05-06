import express from 'express'
import {
    HandleCreateSalary,
    HandleAllSalary,
    HandleSalary,
    HandleUpdateSalary,
    HandleDeleteSalary,
    HandleEmployeeSalaries,
} from '../controllers/Salary.controller.js'
import { VerifyHRToken, VerifyEmployeeToken } from '../middlewares/Auth.middleware.js'
import { RoleAuthorization }  from '../middlewares/RoleAuth.middleware.js'
import { CheckPermission }    from '../middlewares/Permission.middleware.js'

const router = express.Router()

// HR routes — allow any verified HR user who has the relevant permission
// Super-admins (rbacRole = null) pass through automatically (CheckPermission allows them)
router.post('/create-salary',
    VerifyHRToken,
    CheckPermission('salary.update'),   // create counts as "update" in the permission set
    HandleCreateSalary
)

router.get('/all',
    VerifyHRToken,
    CheckPermission('salary.view'),
    HandleAllSalary
)

router.get('/my-salaries',
    VerifyEmployeeToken,
    HandleEmployeeSalaries
)

router.get('/:salaryID',
    VerifyHRToken,
    CheckPermission('salary.view'),
    HandleSalary
)

router.patch('/update-salary',
    VerifyHRToken,
    CheckPermission('salary.update'),
    HandleUpdateSalary
)

router.delete('/delete-salary/:salaryID',
    VerifyHRToken,
    CheckPermission('salary.update'),   // treat delete as an update-level permission
    HandleDeleteSalary
)

export default router
