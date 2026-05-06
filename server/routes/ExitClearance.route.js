import express from 'express'
import {
    HandleCreateExitClearance,
    HandleGetAllClearances,
    HandleGetClearance,
    HandleToggleChecklistItem,
    HandleUpdateClearanceStatus,
    HandleUpdateClearanceDetails,
    HandleDeleteClearance,
    HandleGetClearanceSummary
} from '../controllers/ExitClearance.controller.js'
import { VerifyHRToken } from '../middlewares/Auth.middleware.js'
import { RoleAuthorization } from '../middlewares/RoleAuth.middleware.js'
import { CheckPermission } from '../middlewares/Permission.middleware.js'

const router = express.Router()

// All routes HR-only
router.post('/create',                          VerifyHRToken, CheckPermission('exitclearance.create'), HandleCreateExitClearance)
router.get('/all',                              VerifyHRToken, CheckPermission('exitclearance.view'), HandleGetAllClearances)
router.get('/summary',                          VerifyHRToken, CheckPermission('exitclearance.view'), HandleGetClearanceSummary)
router.get('/:clearanceID',                     VerifyHRToken, CheckPermission('exitclearance.view'), HandleGetClearance)
router.patch('/:clearanceID/checklist',         VerifyHRToken, CheckPermission('exitclearance.update'), HandleToggleChecklistItem)
router.patch('/:clearanceID/status',            VerifyHRToken, CheckPermission('exitclearance.update'), HandleUpdateClearanceStatus)
router.patch('/:clearanceID/details',           VerifyHRToken, CheckPermission('exitclearance.update'), HandleUpdateClearanceDetails)
router.delete('/:clearanceID',                  VerifyHRToken, CheckPermission('exitclearance.delete'), HandleDeleteClearance)

export default router