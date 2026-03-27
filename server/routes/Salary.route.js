import express from 'express'
import { HandleCreateSalary, HandleAllSalary, HandleSalary, HandleUpdateSalary, HandleDeleteSalary, HandleEmployeeSalaries } from '../controllers/Salary.controller.js'
import { VerifyhHRToken, VerifyEmployeeToken } from '../middlewares/Auth.middleware.js'
import { RoleAuthorization } from '../middlewares/RoleAuth.middleware.js'
const router = express.Router()

router.post("/create-salary", VerifyhHRToken, RoleAuthorization("HR-Admin"), HandleCreateSalary)
router.get("/all", VerifyhHRToken, RoleAuthorization("HR-Admin"), HandleAllSalary)
router.get("/my-salaries", VerifyEmployeeToken, HandleEmployeeSalaries)
router.get("/:salaryID", VerifyhHRToken, RoleAuthorization("HR-Admin"), HandleSalary)
router.patch("/update-salary", VerifyhHRToken, RoleAuthorization("HR-Admin"), HandleUpdateSalary)
router.delete("/delete-salary/:salaryID", VerifyhHRToken, RoleAuthorization("HR-Admin"), HandleDeleteSalary)

export default router