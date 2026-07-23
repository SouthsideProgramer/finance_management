import { Router } from 'express'
import { sendMessage, getHistory, listConversations } from '../controllers/chat.controller.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

router.post('/', authMiddleware, sendMessage)
router.get('/conversations', authMiddleware, listConversations)
router.get('/:conversationId/history', authMiddleware, getHistory)

export default router
