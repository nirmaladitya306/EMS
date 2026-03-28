import express from "express"
import { HandleCreateApplicant, HandleAllApplicants, HandleApplicant, HandleUpdateApplicant, HandleDeleteApplicant } from "../controllers/Applicant.controller.js"
import { VerifyHRToken } from '../middlewares/Auth.middleware.js'
import { RoleAuthorization } from '../middlewares/RoleAuth.middleware.js'


const router = express.Router()

router.post("/create-applicant", VerifyHRToken, RoleAuthorization("HR-Admin"), HandleCreateApplicant)

router.get("/all", VerifyHRToken, RoleAuthorization("HR-Admin"), HandleAllApplicants)

router.get("/:applicantID", VerifyHRToken, RoleAuthorization("HR-Admin"), HandleApplicant)

router.patch("/update-applicant", VerifyHRToken, RoleAuthorization("HR-Admin"), HandleUpdateApplicant)

router.delete("/delete-applicant/:applicantID", VerifyHRToken, RoleAuthorization("HR-Admin"), HandleDeleteApplicant)

export default router