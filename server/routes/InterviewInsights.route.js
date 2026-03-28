import express from 'express'
import { HandleAllInterviews, HandleCreateInterview, HandleInterview, HandleUpdateInterview, HandleDeleteInterview } from '../controllers/InterviewInsights.controller.js'
import { VerifyHRToken } from '../middlewares/Auth.middleware.js'
import { RoleAuthorization } from '../middlewares/RoleAuth.middleware.js'



const router = express.Router()

router.post("/create-interview", VerifyHRToken, RoleAuthorization("HR-Admin"), HandleCreateInterview)

router.get("/all", VerifyHRToken, RoleAuthorization("HR-Admin"), HandleAllInterviews)

router.get("/:interviewID", VerifyHRToken, RoleAuthorization("HR-Admin"), HandleInterview)

router.patch("/update-interview", VerifyHRToken, RoleAuthorization("HR-Admin"), HandleUpdateInterview)

router.delete("/delete-interview/:interviewID", VerifyHRToken, RoleAuthorization("HR-Admin"), HandleDeleteInterview)


export default router