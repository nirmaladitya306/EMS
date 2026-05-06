import express from 'express'
import { HandleAllLeaves, HandleCreateLeave, HandleDeleteLeave, HandleLeave, HandleUpdateLeaveByEmployee, HandleUpdateLeavebyHR, HandleEmployeeLeaves } from '../controllers/Leave.controller.js'
import { VerifyEmployeeToken, VerifyHRToken } from '../middlewares/Auth.middleware.js'
import { RoleAuthorization } from '../middlewares/RoleAuth.middleware.js'
import { CheckPermission } from '../middlewares/Permission.middleware.js'

const router = express.Router()

router.post("/create-leave", VerifyEmployeeToken, HandleCreateLeave)
router.get("/my-leaves", VerifyEmployeeToken, HandleEmployeeLeaves)
router.get("/all", VerifyHRToken, CheckPermission("leave.approve"), HandleAllLeaves)
router.get("/:leaveID", VerifyHRToken, CheckPermission("leave.approve"), HandleLeave)
router.patch("/employee-update-leave", VerifyEmployeeToken, HandleUpdateLeaveByEmployee)
router.patch("/HR-update-leave", VerifyHRToken, CheckPermission("leave.approve"), HandleUpdateLeavebyHR)
router.delete("/delete-leave/:leaveID", VerifyEmployeeToken, HandleDeleteLeave)

export default router