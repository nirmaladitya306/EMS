import express from "express"
import {
    HandleAllDepartments,
    HandleDepartment,
    HandleCreateDepartment,
    HandleUpdateDepartment,
    HandleDeleteDepartment,
} from "../controllers/Department.controller.js"
import { VerifyHRToken } from "../middlewares/Auth.middleware.js"
import { RoleAuthorization } from "../middlewares/RoleAuth.middleware.js"

const router = express.Router()

router.get("/all",             VerifyHRToken, RoleAuthorization("HR-Admin"), HandleAllDepartments)
router.get("/:departmentId",   VerifyHRToken, RoleAuthorization("HR-Admin"), HandleDepartment)
router.post("/create-department",   VerifyHRToken, RoleAuthorization("HR-Admin"), HandleCreateDepartment)
router.patch("/update-department",  VerifyHRToken, RoleAuthorization("HR-Admin"), HandleUpdateDepartment)
router.delete("/delete-department", VerifyHRToken, RoleAuthorization("HR-Admin"), HandleDeleteDepartment)

export default router