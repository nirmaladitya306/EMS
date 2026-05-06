import express from "express"
import {
    HandleAllDepartments,
    HandleDepartment,
    HandleCreateDepartment,
    HandleUpdateDepartment,
    HandleDeleteDepartment,
} from "../controllers/Department.controller.js"
import { VerifyHRToken } from "../middlewares/Auth.middleware.js"

// ✅ Import the new CheckPermission middleware instead of RoleAuthorization
import { CheckPermission } from "../middlewares/RoleAuth.middleware.js" 

const router = express.Router()

// ✅ Anyone with 'department.view' can FETCH departments
router.get("/all", VerifyHRToken, CheckPermission("department.view"), HandleAllDepartments)
router.get("/:departmentId", VerifyHRToken, CheckPermission("department.view"), HandleDepartment)

// ✅ Anyone with 'department.create' can MAKE departments
router.post("/create-department", VerifyHRToken, CheckPermission("department.create"), HandleCreateDepartment)

// ✅ Anyone with 'department.edit' can UPDATE departments
router.patch("/update-department", VerifyHRToken, CheckPermission("department.edit"), HandleUpdateDepartment)

// ✅ Anyone with 'department.delete' can DELETE departments
router.delete("/delete-department", VerifyHRToken, CheckPermission("department.delete"), HandleDeleteDepartment)

export default router