import express from 'express'
import { 
    HandleHRSignup, 
    HandleHRVerifyEmail, 
    HandleHRResetverifyEmail, 
    HandleHRLogin, 
    HandleHRCheck, 
    HandleHRLogout, 
    HandleHRForgotPassword, 
    HandleHRResetPassword, 
    HandleHRcheckVerifyEmail,
    HandleCreateHRByAdmin
} from '../controllers/HRAuth.controller.js'
import { VerifyHRToken } from '../middlewares/Auth.middleware.js'
import { RoleAuthorization } from '../middlewares/RoleAuth.middleware.js'

const router = express.Router()

// ─── PUBLIC ROUTES (No token required) ──────────────────────────────────
router.post("/signup", HandleHRSignup)
router.post("/login", HandleHRLogin)
router.post("/reset-password/:token", HandleHRResetPassword)

// ─── GENERAL HR ROUTES (Token required, but open to ALL HR roles) ───────
// ✅ Removed RoleAuthorization("HR-Admin") from these so Arjun can use them!
router.post("/verify-email", VerifyHRToken, HandleHRVerifyEmail)
router.post("/resend-verify-email", VerifyHRToken, HandleHRResetverifyEmail)
router.get("/check-login", VerifyHRToken, HandleHRCheck)
router.get("/check-verify-email", VerifyHRToken, HandleHRcheckVerifyEmail)
router.post("/logout", VerifyHRToken, HandleHRLogout) // ✅ Added VerifyHRToken
router.post("/forgot-password", VerifyHRToken, HandleHRForgotPassword) 

// ─── ADMIN ONLY ROUTES ──────────────────────────────────────────────────
// ✅ Kept RoleAuthorization("HR-Admin") so ONLY Super Admins can invite
router.post("/create-hr", VerifyHRToken, RoleAuthorization("HR-Admin"), HandleCreateHRByAdmin)

export default router