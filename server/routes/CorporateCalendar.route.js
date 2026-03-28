import express from 'express'
import { HandleAllEvents, HandleCreateEvent, HandleDeleteEvent, HandleEvent, HandleUpdateEvent } from '../controllers/CorporateCalendar.controller.js'
import { VerifyHRToken } from "../middlewares/Auth.middleware.js"
import { RoleAuthorization } from "../middlewares/RoleAuth.middleware.js"

const router = express.Router()

router.post("/create-event",  VerifyHRToken, RoleAuthorization("HR-Admin"), HandleCreateEvent)

router.get("/all",  VerifyHRToken, RoleAuthorization("HR-Admin"), HandleAllEvents)

router.get("/:eventID",  VerifyHRToken, RoleAuthorization("HR-Admin"), HandleEvent)

router.patch("/update-event",  VerifyHRToken, RoleAuthorization("HR-Admin"), HandleUpdateEvent)

router.delete("/delete-event/:eventID",  VerifyHRToken, RoleAuthorization("HR-Admin"), HandleDeleteEvent) 

export default router