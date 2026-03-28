import express from 'express'
import { HandleAllGenerateRequest, HandleCreateGenerateRequest, HandleDeleteRequest, HandleGenerateRequest, HandleUpdateRequestByEmployee, HandleUpdateRequestByHR, HandleEmployeeRequests } from '../controllers/GenerateRequest.controller.js'

import { VerifyEmployeeToken, VerifyHRToken } from '../middlewares/Auth.middleware.js'
import { RoleAuthorization } from '../middlewares/RoleAuth.middleware.js'

const router = express.Router()

router.post("/create-request", VerifyEmployeeToken, HandleCreateGenerateRequest)
router.get("/my-requests", VerifyEmployeeToken, HandleEmployeeRequests)
router.get("/all", VerifyHRToken, RoleAuthorization("HR-Admin"), HandleAllGenerateRequest)
router.get("/:requestID", VerifyHRToken, RoleAuthorization("HR-Admin"), HandleGenerateRequest)
router.patch("/update-request-content", VerifyEmployeeToken, HandleUpdateRequestByEmployee)
router.patch("/update-request-status", VerifyHRToken, RoleAuthorization("HR-Admin"), HandleUpdateRequestByHR)
router.delete("/delete-request/:requestID", VerifyHRToken, RoleAuthorization("HR-Admin"), HandleDeleteRequest)

export default router