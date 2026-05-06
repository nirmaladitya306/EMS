import express from 'express'
import { HandleAllEvents, HandleCreateEvent, HandleDeleteEvent, HandleEvent, HandleUpdateEvent } from '../controllers/CorporateCalendar.controller.js'
import { VerifyHRToken } from "../middlewares/Auth.middleware.js"
import { RoleAuthorization } from "../middlewares/RoleAuth.middleware.js"
import { CheckPermission } from "../middlewares/Permission.middleware.js"

const router = express.Router()

router.post("/create-event",  VerifyHRToken, CheckPermission("notice.create"), HandleCreateEvent)

router.get("/all",  VerifyHRToken, CheckPermission("notice.view"), HandleAllEvents)

router.get("/:eventID",  VerifyHRToken, CheckPermission("notice.view"), HandleEvent)

router.patch("/update-event",  VerifyHRToken, CheckPermission("notice.update"), HandleUpdateEvent)

router.delete("/delete-event/:eventID",  VerifyHRToken, CheckPermission("notice.delete"), HandleDeleteEvent) 

export default router