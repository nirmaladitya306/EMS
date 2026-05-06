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

const router = express.Router()

router.get("/all",                  VerifyHRToken, RoleAuthorization("HR-Admin"), HandleAllEmployees)
router.get("/all-employees-ids",    VerifyHRToken, RoleAuthorization("HR-Admin"), HandleAllEmployeesIDS)
router.get("/search-by-skills",     VerifyHRToken, RoleAuthorization("HR-Admin"), HandleSearchBySkills)

// VerifyHROrEmployeeToken — accepts HR cookie (Modify button) OR Employee cookie (self-update)
router.patch("/update-employee",    VerifyHROrEmployeeToken, HandleEmployeeUpdate)

router.delete("/delete-employee/:employeeId", VerifyHRToken, RoleAuthorization("HR-Admin"), HandleEmployeeDelete)
router.get("/by-HR/:employeeId",    VerifyHRToken, RoleAuthorization("HR-Admin"), HandleEmployeeByHR)
router.get("/by-employee",          VerifyEmployeeToken, HandleEmployeeByEmployee)
router.get("/my-timeline",          VerifyEmployeeToken, HandleGetEmployeeTimeline)
router.get("/timeline/:employeeId", VerifyHRToken, RoleAuthorization("HR-Admin"), HandleGetEmployeeTimelineByHR)

export default router