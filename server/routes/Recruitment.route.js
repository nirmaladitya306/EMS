import express from 'express'
import { HandleCreateRecruitment, HandleAllRecruitments, HandleRecruitment, HandleUpdateRecruitment, HandleDeleteRecruitment } from '../controllers/Recruitment.controller.js'
import { VerifyHRToken } from '../middlewares/Auth.middleware.js'
import { RoleAuthorization } from '../middlewares/RoleAuth.middleware.js'
import { CheckPermission } from '../middlewares/Permission.middleware.js'

const router = express.Router()

router.post("/create-recruitment", VerifyHRToken, CheckPermission("recruitment.create"), HandleCreateRecruitment)

router.get("/all", VerifyHRToken, CheckPermission("recruitment.view"), HandleAllRecruitments)

router.get("/:recruitmentID", VerifyHRToken, CheckPermission("recruitment.view"), HandleRecruitment)

router.patch("/update-recruitment", VerifyHRToken, CheckPermission("recruitment.update"), HandleUpdateRecruitment)

router.delete("/delete-recruitment/:recruitmentID", VerifyHRToken, CheckPermission("recruitment.delete"), HandleDeleteRecruitment)

export default router