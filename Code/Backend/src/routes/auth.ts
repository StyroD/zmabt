import { Router } from 'express'
import { registerUser, loginUser, getMe } from '../queries/auth'
import authMiddleware from '../middleware/auth'

const router = Router()

router.post('/register', registerUser)
router.post('/login', loginUser)
router.get('/me', authMiddleware, getMe)

export default router
