import express from 'express'
import { PERMISSIONS } from '../constants/permissions.js'

const router = express.Router()

router.get('/', (req, res) => {
    res.json({
        success: true,
        data: PERMISSIONS
    })
})

export default router