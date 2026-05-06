import express from "express"
import { HandleCreateBalance, HandleAllBalances, HandleBalance, HandleUpdateBalance, HandleDeleteBalance } from "../controllers/Balance.controller.js"
import { VerifyHRToken } from "../middlewares/Auth.middleware.js"
import { RoleAuthorization } from "../middlewares/RoleAuth.middleware.js"
import { CheckPermission } from "../middlewares/Permission.middleware.js"

const router = express.Router()

router.post("/add-balance", VerifyHRToken, CheckPermission("payrollcompliance.view"), HandleCreateBalance)

router.get("/all", VerifyHRToken, CheckPermission("payrollcompliance.view"), HandleAllBalances)

router.get("/:balanceID", VerifyHRToken, CheckPermission("payrollcompliance.view"), HandleBalance)

router.patch("/update-balance", VerifyHRToken, CheckPermission("payrollcompliance.view"), HandleUpdateBalance)

router.delete("/delete-balance/:balanceID", VerifyHRToken, CheckPermission("payrollcompliance.view"), HandleDeleteBalance)


export default router