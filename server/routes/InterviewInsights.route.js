import express from 'express'
import { HandleAllInterviews, HandleCreateInterview, HandleInterview, HandleUpdateInterview, HandleDeleteInterview } from '../controllers/InterviewInsights.controller.js'
import { VerifyHRToken } from '../middlewares/Auth.middleware.js'
import { RoleAuthorization } from '../middlewares/RoleAuth.middleware.js'
import { CheckPermission } from '../middlewares/Permission.middleware.js'



const router = express.Router()

router.post("/create-interview", VerifyHRToken, CheckPermission("recruitment.create"), HandleCreateInterview)

router.get("/all", VerifyHRToken, CheckPermission("recruitment.view"), HandleAllInterviews)

router.get("/:interviewID", VerifyHRToken, CheckPermission("recruitment.view"), HandleInterview)

router.patch("/update-interview", VerifyHRToken, CheckPermission("recruitment.update"), HandleUpdateInterview)

router.delete("/delete-interview/:interviewID", VerifyHRToken, CheckPermission("recruitment.delete"), HandleDeleteInterview)


export default router