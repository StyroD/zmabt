import { Router } from 'express'
import { generateInvite, registerWithInvite } from '../queries/invite'
import authMiddleware from '../middleware/auth'

const router = Router()

router.post('/generate', authMiddleware, generateInvite)  // manager only
router.post('/register', registerWithInvite)              // public, uses invite token

export default router
