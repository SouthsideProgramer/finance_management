import { Router } from 'express'
import { register, login, refreshToken, logout, logoutAll } from '../controllers/auth.controller.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

router.post('/register', register)
router.post('/login', login)
router.post('/refresh-token', refreshToken)
router.post('/logout', logout)
router.post('/logout-all', authMiddleware, logoutAll)

export default router
