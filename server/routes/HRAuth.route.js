import express from 'express'
import { HandleHRSignup, HandleHRVerifyEmail, HandleHRResetverifyEmail, HandleHRLogin, HandleHRCheck, HandleHRLogout, HandleHRForgotPassword, HandleHRResetPassword, HandleHRcheckVerifyEmail } from '../controllers/HRAuth.controller.js'
import { VerifyHRToken } from '../middlewares/Auth.middleware.js'
import { RoleAuthorization } from '../middlewares/RoleAuth.middleware.js'

const router = express.Router()

router.post("/signup", HandleHRSignup)

router.post("/verify-email", VerifyHRToken, RoleAuthorization("HR-Admin"), HandleHRVerifyEmail)

router.post("/resend-verify-email", VerifyHRToken, RoleAuthorization("HR-Admin"), HandleHRResetverifyEmail)

router.post("/login", HandleHRLogin)

router.get("/check-login", VerifyHRToken, RoleAuthorization("HR-Admin"), HandleHRCheck)

router.get("/check-verify-email", VerifyHRToken, RoleAuthorization("HR-Admin"), HandleHRcheckVerifyEmail)

router.post("/logout", HandleHRLogout)

router.post("/forgot-password", VerifyHRToken, RoleAuthorization("HR-Admin"), HandleHRForgotPassword)

router.post("/reset-password/:token", HandleHRResetPassword)


export default router