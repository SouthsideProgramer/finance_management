import { Router } from 'express'
import { listCards, addCard, setPrimaryCard, deleteCard } from '../controllers/bank.controller.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

router.get('/', authMiddleware, listCards)
router.post('/', authMiddleware, addCard)
router.put('/:id/primary', authMiddleware, setPrimaryCard)
router.delete('/:id', authMiddleware, deleteCard)

export default router
