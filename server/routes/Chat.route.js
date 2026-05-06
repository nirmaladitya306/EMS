import express from 'express'
import { VerifyHRToken, VerifyEmployeeToken } from '../middlewares/Auth.middleware.js'
import { HRChat, EmployeeChat, ClearChatSession, ChatHealth } from '../controllers/Chat.controller.js'

const ChatRouter = express.Router()

ChatRouter.get('/health',                ChatHealth)
ChatRouter.post('/hr',                   VerifyHRToken,       HRChat)
ChatRouter.post('/employee',             VerifyEmployeeToken, EmployeeChat)
ChatRouter.delete('/session/:sessionId', ClearChatSession)

export default ChatRouter
