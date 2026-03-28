import express from "express"
import { HandleCreateNotice, HandleAllNotice, HandleNotice, HandleUpdateNotice, HandleDeleteNotice, HandleEmployeeNotices } from "../controllers/Notice.controller.js"
import { VerifyHRToken, VerifyEmployeeToken } from "../middlewares/Auth.middleware.js"
import { RoleAuthorization } from "../middlewares/RoleAuth.middleware.js"

const router = express.Router()

router.post("/create-notice", VerifyHRToken, RoleAuthorization("HR-Admin"), HandleCreateNotice)
router.get("/all/", VerifyHRToken, RoleAuthorization("HR-Admin"), HandleAllNotice)
router.get("/my-notices", VerifyEmployeeToken, HandleEmployeeNotices)
router.get("/:noticeID", VerifyHRToken, RoleAuthorization("HR-Admin"), HandleNotice)
router.patch("/update-notice", VerifyHRToken, RoleAuthorization("HR-Admin"), HandleUpdateNotice)
router.delete("/delete-notice/:noticeID", VerifyHRToken, RoleAuthorization("HR-Admin"), HandleDeleteNotice)

export default router