import express from 'express'
import { HandleAllGenerateRequest, HandleCreateGenerateRequest, HandleDeleteRequest, HandleGenerateRequest, HandleUpdateRequestByEmployee, HandleUpdateRequestByHR, HandleEmployeeRequests } from '../controllers/GenerateRequest.controller.js'

import { VerifyEmployeeToken, VerifyHRToken } from '../middlewares/Auth.middleware.js'
import { RoleAuthorization } from '../middlewares/RoleAuth.middleware.js'
import { CheckPermission } from '../middlewares/Permission.middleware.js'

const router = express.Router()

router.post("/create-request", VerifyEmployeeToken, HandleCreateGenerateRequest)
router.get("/my-requests", VerifyEmployeeToken, HandleEmployeeRequests)
router.get("/all", VerifyHRToken, CheckPermission("request.view"), HandleAllGenerateRequest)
router.get("/:requestID", VerifyHRToken, CheckPermission("request.view"), HandleGenerateRequest)
router.patch("/update-request-content", VerifyEmployeeToken, HandleUpdateRequestByEmployee)
router.patch("/update-request-status", VerifyHRToken, CheckPermission("request.update"), HandleUpdateRequestByHR)
router.delete("/delete-request/:requestID", VerifyHRToken, CheckPermission("request.delete"), HandleDeleteRequest)

export default router