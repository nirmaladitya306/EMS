import express from "express"
import {
    HandleAllEmployees,
    HandleEmployeeUpdate,
    HandleEmployeeDelete,
    HandleEmployeeByHR,
    HandleEmployeeByEmployee,
    HandleAllEmployeesIDS,
    HandleSearchBySkills,
    HandleGetEmployeeTimeline,
    HandleGetEmployeeTimelineByHR
} from "../controllers/Employee.controller.js"
import { VerifyHRToken, VerifyEmployeeToken, VerifyHROrEmployeeToken } from "../middlewares/Auth.middleware.js"
import { RoleAuthorization } from "../middlewares/RoleAuth.middleware.js"
import { CheckPermission } from "../middlewares/Permission.middleware.js"

const router = express.Router()

router.get("/all",                  VerifyHRToken, CheckPermission("employee.view"), HandleAllEmployees)
router.get("/all-employees-ids",    VerifyHRToken, CheckPermission("employee.view"), HandleAllEmployeesIDS)
router.get("/search-by-skills",     VerifyHRToken, CheckPermission("employee.view"), HandleSearchBySkills)

// VerifyHROrEmployeeToken — allows both HR (modify from dashboard) and Employee (update own profile)
router.patch("/update-employee",    VerifyHROrEmployeeToken, HandleEmployeeUpdate)

router.delete("/delete-employee/:employeeId", VerifyHRToken, CheckPermission("employee.delete"), HandleEmployeeDelete)
router.get("/by-HR/:employeeId",    VerifyHRToken, CheckPermission("employee.view"), HandleEmployeeByHR)
router.get("/by-employee",          VerifyEmployeeToken, HandleEmployeeByEmployee)
router.get("/my-timeline",          VerifyEmployeeToken, HandleGetEmployeeTimeline)
router.get("/timeline/:employeeId", VerifyHRToken, CheckPermission("employee.view"), HandleGetEmployeeTimelineByHR)

export default router