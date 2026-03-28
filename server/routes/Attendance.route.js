import express from 'express'
import { HandleInitializeAttendance, HandleAllAttendance, HandleAttendance, HandleUpdateAttendance, HandleDeleteAttendance, HandleEmployeeAttendance } from '../controllers/Attendance.controller.js'
import { VerifyEmployeeToken, VerifyHRToken } from '../middlewares/Auth.middleware.js'
import { RoleAuthorization } from '../middlewares/RoleAuth.middleware.js'

const router = express.Router()

router.post("/initialize", VerifyEmployeeToken, HandleInitializeAttendance)
router.get("/my-attendance", VerifyEmployeeToken, HandleEmployeeAttendance)
router.get("/all", VerifyHRToken, RoleAuthorization("HR-Admin"), HandleAllAttendance)
router.get("/:attendanceID", VerifyHRToken, RoleAuthorization("HR-Admin"), HandleAttendance)
router.patch("/update-attendance", VerifyEmployeeToken, HandleUpdateAttendance)
router.delete("/delete-attendance/:attendanceID", VerifyHRToken, RoleAuthorization("HR-Admin"), HandleDeleteAttendance)

export default router