import express from "express"
import { HandleHRDashboard } from "../controllers/Dashboard.controller.js"
import { VerifyhHRToken } from "../middlewares/Auth.middleware.js"
import { CheckPermission } from "../middlewares/Permission.middleware.js"

const router = express.Router()

// Dashboard is accessible to any verified HR user regardless of role
// CheckPermission with 'employee.view' — a basic view permission all HR roles should have
// Super-admins (no rbacRole) pass through automatically
router.get("/HR-dashboard", VerifyhHRToken, CheckPermission("employee.view"), HandleHRDashboard)

export default router
