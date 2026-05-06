import express from 'express'
import { HandleInitializeAttendance, HandleAllAttendance, HandleAttendance, HandleUpdateAttendance, HandleDeleteAttendance, HandleEmployeeAttendance } from '../controllers/Attendance.controller.js'
import { VerifyEmployeeToken, VerifyHRToken } from '../middlewares/Auth.middleware.js'
import { RoleAuthorization } from '../middlewares/RoleAuth.middleware.js'
import { CheckPermission } from '../middlewares/Permission.middleware.js'

const router = express.Router()

router.post("/initialize", VerifyEmployeeToken, HandleInitializeAttendance)
router.get("/my-attendance", VerifyEmployeeToken, HandleEmployeeAttendance)
router.get("/all", VerifyHRToken, CheckPermission("attendance.view"), HandleAllAttendance)
router.get("/:attendanceID", VerifyHRToken, CheckPermission("attendance.view"), HandleAttendance)
router.patch("/update-attendance", VerifyEmployeeToken, HandleUpdateAttendance)
router.delete("/delete-attendance/:attendanceID", VerifyHRToken, CheckPermission("attendance.view"), HandleDeleteAttendance)

export default router