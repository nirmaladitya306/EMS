import express from 'express'
import {
    HandleCreateDocument,
    HandleGetAllDocuments,
    HandleGetEmployeeDocuments,
    HandleUpdateDocument,
    HandleDeleteDocument,
    HandleRunAlertEngine,
    HandleGetDocumentSummary
} from '../controllers/Document.controller.js'
import { VerifyHRToken } from '../middlewares/Auth.middleware.js'
import { RoleAuthorization } from '../middlewares/RoleAuth.middleware.js'

const router = express.Router()

// All routes are HR-only
router.post('/create',                  VerifyHRToken, RoleAuthorization('HR-Admin'), HandleCreateDocument)
router.get('/all',                      VerifyHRToken, RoleAuthorization('HR-Admin'), HandleGetAllDocuments)
router.get('/summary',                  VerifyHRToken, RoleAuthorization('HR-Admin'), HandleGetDocumentSummary)
router.get('/employee/:employeeID',     VerifyHRToken, RoleAuthorization('HR-Admin'), HandleGetEmployeeDocuments)
router.patch('/update',                 VerifyHRToken, RoleAuthorization('HR-Admin'), HandleUpdateDocument)
router.delete('/delete/:documentID',    VerifyHRToken, RoleAuthorization('HR-Admin'), HandleDeleteDocument)
router.post('/run-alerts',              VerifyHRToken, RoleAuthorization('HR-Admin'), HandleRunAlertEngine)

export default router