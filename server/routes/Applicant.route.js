import express from "express"
import { HandleCreateApplicant, HandleAllApplicants, HandleApplicant, HandleUpdateApplicant, HandleDeleteApplicant } from "../controllers/Applicant.controller.js"
import { VerifyHRToken } from '../middlewares/Auth.middleware.js'
import { RoleAuthorization } from '../middlewares/RoleAuth.middleware.js'
import { CheckPermission } from '../middlewares/Permission.middleware.js'


const router = express.Router()

router.post("/create-applicant", VerifyHRToken, CheckPermission("recruitment.create"), HandleCreateApplicant)

router.get("/all", VerifyHRToken, CheckPermission("recruitment.view"), HandleAllApplicants)

router.get("/:applicantID", VerifyHRToken, CheckPermission("recruitment.view"), HandleApplicant)

router.patch("/update-applicant", VerifyHRToken, CheckPermission("recruitment.update"), HandleUpdateApplicant)

router.delete("/delete-applicant/:applicantID", VerifyHRToken, CheckPermission("recruitment.delete"), HandleDeleteApplicant)

export default router