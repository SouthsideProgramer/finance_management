import { Router } from 'express'
import { listSessions, revokeSession, revokeAllSessions } from '../controllers/session.controller.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

router.get('/', authMiddleware, listSessions)
router.delete('/:id', authMiddleware, revokeSession)
router.delete('/', authMiddleware, revokeAllSessions)

export default router
