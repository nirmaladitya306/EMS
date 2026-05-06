import express from 'express'
import { HandleAllHR, HandleDeleteHR, HandleHR, HandleUpdateHR } from '../controllers/HR.controller.js'
import { RoleAuthorization } from '../middlewares/RoleAuth.middleware.js'
import { CheckPermission } from '../middlewares/Permission.middleware.js'
import { HandleCreateHRByAdmin } from '../controllers/HRAuth.controller.js';
import { VerifyHRToken } from '../middlewares/Auth.middleware.js';

const router = express.Router()

router.post('/create-hr', VerifyHRToken, HandleCreateHRByAdmin);
router.get("/all", VerifyHRToken, CheckPermission("employee.view"), HandleAllHR)

router.get("/:HRID", VerifyHRToken, CheckPermission("employee.view"), HandleHR)

router.patch("/update-HR", VerifyHRToken, CheckPermission("employee.update"), HandleUpdateHR)

router.delete("/delete-HR/:HRID", VerifyHRToken, CheckPermission("employee.delete"), HandleDeleteHR) 


export default router