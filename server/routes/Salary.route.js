import express from 'express'
import { HandleCreateSalary, HandleAllSalary, HandleSalary, HandleUpdateSalary, HandleDeleteSalary, HandleEmployeeSalaries } from '../controllers/Salary.controller.js'
import { VerifyHRToken, VerifyEmployeeToken } from '../middlewares/Auth.middleware.js'
import { RoleAuthorization } from '../middlewares/RoleAuth.middleware.js'
const router = express.Router()

router.post("/create-salary", VerifyHRToken, RoleAuthorization("HR-Admin"), HandleCreateSalary)
router.get("/all", VerifyHRToken, RoleAuthorization("HR-Admin"), HandleAllSalary)
router.get("/my-salaries", VerifyEmployeeToken, HandleEmployeeSalaries)
router.get("/:salaryID", VerifyHRToken, RoleAuthorization("HR-Admin"), HandleSalary)
router.patch("/update-salary", VerifyHRToken, RoleAuthorization("HR-Admin"), HandleUpdateSalary)
router.delete("/delete-salary/:salaryID", VerifyHRToken, RoleAuthorization("HR-Admin"), HandleDeleteSalary)

export default router