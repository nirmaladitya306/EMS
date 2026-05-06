import express from 'express'
import { HandleCreateRecruitment, HandleAllRecruitments, HandleRecruitment, HandleUpdateRecruitment, HandleDeleteRecruitment } from '../controllers/Recruitment.controller.js'
import { VerifyhHRToken } from '../middlewares/Auth.middleware.js'
import { RoleAuthorization } from '../middlewares/RoleAuth.middleware.js'
import { CheckPermission } from '../middlewares/Permission.middleware.js'

const router = express.Router()

router.post("/create-recruitment", VerifyhHRToken, CheckPermission("recruitment.create"), HandleCreateRecruitment)

router.get("/all", VerifyhHRToken, CheckPermission("recruitment.view"), HandleAllRecruitments)

router.get("/:recruitmentID", VerifyhHRToken, CheckPermission("recruitment.view"), HandleRecruitment)

router.patch("/update-recruitment", VerifyhHRToken, CheckPermission("recruitment.update"), HandleUpdateRecruitment)

router.delete("/delete-recruitment/:recruitmentID", VerifyhHRToken, CheckPermission("recruitment.delete"), HandleDeleteRecruitment)

export default router