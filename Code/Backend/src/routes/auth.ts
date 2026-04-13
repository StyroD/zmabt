import { Router } from 'express'
import { registerUser, loginUser, getMe, googleAuth, googleCallback, googleFailed } from '../queries/auth'
import authMiddleware from '../middleware/auth'
import passport from 'passport'

const router = Router()

router.post('/register', registerUser)
router.post('/login', loginUser)
router.get('/me', authMiddleware, getMe)
router.get('/google', googleAuth)
router.get('/google/callback', googleCallback)
router.get('/google/failed', googleFailed)

export default router