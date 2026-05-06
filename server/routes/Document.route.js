import express from 'express'
import {
    HandleCreateDocument,
    HandleGetAllDocuments,
    HandleGetMyDocuments,
    HandleGetEmployeeDocuments,
    HandleUpdateDocument,
    HandleDeleteDocument,
    HandleRunAlertEngine,
    HandleGetDocumentSummary
} from '../controllers/Document.controller.js'
import { VerifyHRToken, VerifyEmployeeToken } from '../middlewares/Auth.middleware.js'
import { RoleAuthorization } from '../middlewares/RoleAuth.middleware.js'
import { CheckPermission } from '../middlewares/Permission.middleware.js'

const router = express.Router()

// Employee routes
router.get('/my-documents',             VerifyEmployeeToken, HandleGetMyDocuments)

// HR-only routes
router.post('/create',                  VerifyHRToken, CheckPermission('document.create'), HandleCreateDocument)
router.get('/all',                      VerifyHRToken, CheckPermission('document.view'), HandleGetAllDocuments)
router.get('/summary',                  VerifyHRToken, CheckPermission('document.view'), HandleGetDocumentSummary)
router.get('/employee/:employeeID',     VerifyHRToken, CheckPermission('document.view'), HandleGetEmployeeDocuments)
router.patch('/update',                 VerifyHRToken, CheckPermission('document.update'), HandleUpdateDocument)
router.delete('/delete/:documentID',    VerifyHRToken, CheckPermission('document.delete'), HandleDeleteDocument)
router.post('/run-alerts',              VerifyHRToken, CheckPermission('document.view'), HandleRunAlertEngine)

export default router