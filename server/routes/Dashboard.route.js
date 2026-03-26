import express from "express"
import { HandleHRDashboard } from "../controllers/Dashboard.controller.js"
import { VerifyHRToken } from "../middlewares/Auth.middleware.js"
import { RoleAuthorization } from "../middlewares/RoleAuth.middleware.js"

const router = express.Router()

router.get("/HR-dashboard", VerifyHRToken, RoleAuthorization("HR-Admin"), HandleHRDashboard) 

export default router