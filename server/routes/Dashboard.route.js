import express from "express"
import { HandleHRDashboard } from "../controllers/Dashboard.controller.js"
import { VerifyHRToken } from "../middlewares/Auth.middleware.js"
// You can remove the RoleAuthorization import if you aren't using it in this file anymore
// import { RoleAuthorization } from "../middlewares/RoleAuth.middleware.js"

const router = express.Router()

// ✅ Removed RoleAuthorization("HR-Admin") so Arjun can access the dashboard!
router.get("/HR-dashboard", VerifyHRToken, HandleHRDashboard) 

export default router