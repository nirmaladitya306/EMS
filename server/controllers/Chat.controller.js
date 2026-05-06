/**
 * Chat.controller.js — thin HTTP handlers. Zero AI logic here.
 */
import * as ChatService from '../ai/ChatService.js'
import { randomUUID }   from 'crypto'

export const HRChat = async (req, res) => {
    try {
        const { message } = req.body
        if (!message?.trim()) return res.status(400).json({ success: false, message: 'Message is required' })

        const sessionId = req.body.sessionId || `hr_${req.HRid}_${randomUUID()}`
        const result    = await ChatService.sendMessage({ sessionId, message, role: 'hr', orgID: req.ORGID, actorID: req.HRid })
        return res.status(200).json({ success: true, ...result })
    } catch (err) {
        console.error('[Chat] HR error:', err.message)
        return res.status(500).json({ success: false, message: err.message || 'AI service error' })
    }
}

export const EmployeeChat = async (req, res) => {
    try {
        const { message } = req.body
        if (!message?.trim()) return res.status(400).json({ success: false, message: 'Message is required' })

        const sessionId = req.body.sessionId || `em_${req.EMid}_${randomUUID()}`
        const result    = await ChatService.sendMessage({ sessionId, message, role: 'employee', orgID: req.ORGID, actorID: req.EMid })
        return res.status(200).json({ success: true, ...result })
    } catch (err) {
        console.error('[Chat] Employee error:', err.message)
        return res.status(500).json({ success: false, message: err.message || 'AI service error' })
    }
}

export const ClearChatSession = (req, res) => {
    const { sessionId } = req.params
    if (!sessionId) return res.status(400).json({ success: false, message: 'sessionId required' })
    ChatService.clearSession(sessionId)
    return res.status(200).json({ success: true, message: 'Session cleared' })
}

export const ChatHealth = async (req, res) => {
    try {
        const status = await ChatService.healthCheck()
        return res.status(200).json({ success: true, ...status })
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message })
    }
}
