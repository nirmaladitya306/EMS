import express from 'express'
import { HandleAllLeaves, HandleCreateLeave, HandleDeleteLeave, HandleLeave, HandleUpdateLeaveByEmployee, HandleUpdateLeavebyHR, HandleEmployeeLeaves } from '../controllers/Leave.controller.js'
import { VerifyEmployeeToken, VerifyHRToken } from '../middlewares/Auth.middleware.js'
import { RoleAuthorization } from '../middlewares/RoleAuth.middleware.js'

const router = express.Router()

router.post("/create-leave", VerifyEmployeeToken, HandleCreateLeave)
router.get("/my-leaves", VerifyEmployeeToken, HandleEmployeeLeaves)
router.get("/all", VerifyHRToken, RoleAuthorization("HR-Admin"), HandleAllLeaves)
router.get("/:leaveID", VerifyHRToken, RoleAuthorization("HR-Admin"), HandleLeave)
router.patch("/employee-update-leave", VerifyEmployeeToken, HandleUpdateLeaveByEmployee)
router.patch("/HR-update-leave", VerifyHRToken, RoleAuthorization("HR-Admin"), HandleUpdateLeavebyHR)
router.delete("/delete-leave/:leaveID", VerifyEmployeeToken, HandleDeleteLeave)

export default router