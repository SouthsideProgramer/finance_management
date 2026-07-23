import { Router } from 'express'
import { listTransactions, createTransaction, deleteTransaction } from '../controllers/transaction.controller.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

router.get('/', authMiddleware, listTransactions)
router.post('/', authMiddleware, createTransaction)
router.delete('/:id', authMiddleware, deleteTransaction)

export default router
