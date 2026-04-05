import express from "express"
import { HandleAllEmployees, HandleEmployeeUpdate, HandleEmployeeDelete, HandleEmployeeByHR, HandleEmployeeByEmployee, HandleAllEmployeesIDS, HandleSearchBySkills, HandleGetEmployeeTimeline, HandleGetEmployeeTimelineByHR } from "../controllers/Employee.controller.js"
import { VerifyHRToken } from "../middlewares/Auth.middleware.js"
import { RoleAuthorization } from "../middlewares/RoleAuth.middleware.js"
import { VerifyEmployeeToken } from "../middlewares/Auth.middleware.js"

const router = express.Router()


router.get("/all", VerifyHRToken, RoleAuthorization("HR-Admin"), HandleAllEmployees)

router.get("/all-employees-ids", VerifyHRToken, RoleAuthorization("HR-Admin"), HandleAllEmployeesIDS)

router.get("/search-by-skills", VerifyHRToken, RoleAuthorization("HR-Admin"), HandleSearchBySkills)

router.patch("/update-employee", VerifyEmployeeToken, HandleEmployeeUpdate)

router.delete("/delete-employee/:employeeId", VerifyHRToken, RoleAuthorization("HR-Admin"), HandleEmployeeDelete)

router.get("/by-HR/:employeeId", VerifyHRToken, RoleAuthorization("HR-Admin"), HandleEmployeeByHR)

router.get("/by-employee", VerifyEmployeeToken, HandleEmployeeByEmployee)

router.get("/my-timeline", VerifyEmployeeToken, HandleGetEmployeeTimeline)

router.get("/timeline/:employeeId", VerifyHRToken, RoleAuthorization("HR-Admin"), HandleGetEmployeeTimelineByHR)



export default router