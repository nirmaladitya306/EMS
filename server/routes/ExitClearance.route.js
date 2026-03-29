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

const router = express.Router()

// All routes HR-only
router.post('/create',                          VerifyHRToken, RoleAuthorization('HR-Admin'), HandleCreateExitClearance)
router.get('/all',                              VerifyHRToken, RoleAuthorization('HR-Admin'), HandleGetAllClearances)
router.get('/summary',                          VerifyHRToken, RoleAuthorization('HR-Admin'), HandleGetClearanceSummary)
router.get('/:clearanceID',                     VerifyHRToken, RoleAuthorization('HR-Admin'), HandleGetClearance)
router.patch('/:clearanceID/checklist',         VerifyHRToken, RoleAuthorization('HR-Admin'), HandleToggleChecklistItem)
router.patch('/:clearanceID/status',            VerifyHRToken, RoleAuthorization('HR-Admin'), HandleUpdateClearanceStatus)
router.patch('/:clearanceID/details',           VerifyHRToken, RoleAuthorization('HR-Admin'), HandleUpdateClearanceDetails)
router.delete('/:clearanceID',                  VerifyHRToken, RoleAuthorization('HR-Admin'), HandleDeleteClearance)

export default router