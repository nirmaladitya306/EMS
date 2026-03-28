import express from "express"
import { HandleCreateBalance, HandleAllBalances, HandleBalance, HandleUpdateBalance, HandleDeleteBalance } from "../controllers/Balance.controller.js"
import { VerifyHRToken } from "../middlewares/Auth.middleware.js"
import { RoleAuthorization } from "../middlewares/RoleAuth.middleware.js"

const router = express.Router()

router.post("/add-balance", VerifyHRToken, RoleAuthorization("HR-Admin"), HandleCreateBalance)

router.get("/all", VerifyHRToken, RoleAuthorization("HR-Admin"), HandleAllBalances)

router.get("/:balanceID", VerifyHRToken, RoleAuthorization("HR-Admin"), HandleBalance)

router.patch("/update-balance", VerifyHRToken, RoleAuthorization("HR-Admin"), HandleUpdateBalance)

router.delete("/delete-balance/:balanceID", VerifyHRToken, RoleAuthorization("HR-Admin"), HandleDeleteBalance)


export default router