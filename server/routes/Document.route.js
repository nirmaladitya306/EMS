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
import { VerifyhHRToken } from '../middlewares/Auth.middleware.js'
import { RoleAuthorization } from '../middlewares/RoleAuth.middleware.js'

const router = express.Router()

// All routes are HR-only
router.post('/create',                  VerifyhHRToken, RoleAuthorization('HR-Admin'), HandleCreateDocument)
router.get('/all',                      VerifyhHRToken, RoleAuthorization('HR-Admin'), HandleGetAllDocuments)
router.get('/summary',                  VerifyhHRToken, RoleAuthorization('HR-Admin'), HandleGetDocumentSummary)
router.get('/employee/:employeeID',     VerifyhHRToken, RoleAuthorization('HR-Admin'), HandleGetEmployeeDocuments)
router.patch('/update',                 VerifyhHRToken, RoleAuthorization('HR-Admin'), HandleUpdateDocument)
router.delete('/delete/:documentID',    VerifyhHRToken, RoleAuthorization('HR-Admin'), HandleDeleteDocument)
router.post('/run-alerts',              VerifyhHRToken, RoleAuthorization('HR-Admin'), HandleRunAlertEngine)

export default router