import express from "express"
import { HandleCreateNotice, HandleAllNotice, HandleNotice, HandleUpdateNotice, HandleDeleteNotice, HandleEmployeeNotices } from "../controllers/Notice.controller.js"
import { VerifyHRToken, VerifyEmployeeToken } from "../middlewares/Auth.middleware.js"
import { RoleAuthorization } from "../middlewares/RoleAuth.middleware.js"
import { CheckPermission } from "../middlewares/Permission.middleware.js"

const router = express.Router()

router.post("/create-notice", VerifyHRToken, CheckPermission("notice.create"), HandleCreateNotice)
router.get("/all/", VerifyHRToken, CheckPermission("notice.view"), HandleAllNotice)
router.get("/my-notices", VerifyEmployeeToken, HandleEmployeeNotices)
router.get("/:noticeID", VerifyHRToken, CheckPermission("notice.view"), HandleNotice)
router.patch("/update-notice", VerifyHRToken, CheckPermission("notice.update"), HandleUpdateNotice)
router.delete("/delete-notice/:noticeID", VerifyHRToken, CheckPermission("notice.delete"), HandleDeleteNotice)

export default router