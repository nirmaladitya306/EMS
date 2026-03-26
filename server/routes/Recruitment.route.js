import express from 'express'
import { HandleCreateRecruitment, HandleAllRecruitments, HandleRecruitment, HandleUpdateRecruitment, HandleDeleteRecruitment } from '../controllers/Recruitment.controller.js'
import { VerifyHRToken } from '../middlewares/Auth.middleware.js'
import { RoleAuthorization } from '../middlewares/RoleAuth.middleware.js'

const router = express.Router()

router.post("/create-recruitment", VerifyHRToken, RoleAuthorization("HR-Admin"), HandleCreateRecruitment)

router.get("/all", VerifyHRToken, RoleAuthorization("HR-Admin"), HandleAllRecruitments)

router.get("/:recruitmentID", VerifyHRToken, RoleAuthorization("HR-Admin"), HandleRecruitment)

router.patch("/update-recruitment", VerifyHRToken, RoleAuthorization("HR-Admin"), HandleUpdateRecruitment)

router.delete("/delete-recruitment/:recruitmentID", VerifyHRToken, RoleAuthorization("HR-Admin"), HandleDeleteRecruitment)

export default router