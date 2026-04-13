import { Router } from 'express'
import { getUsers, createUser, getUserById, updateUser, updatePushToken } from '../queries/users'
import authMiddleware from '../middleware/auth'
import upload from '../middleware/upload'

const router = Router()

router.get('/', authMiddleware, getUsers)
router.post('/', createUser)
router.get('/:id', authMiddleware, getUserById)
router.put('/:id', authMiddleware, upload.single('avatar'), updateUser)
router.patch('/:id/push-token', authMiddleware, updatePushToken)
router.get('/:id', getUserById)
router.put('/:id', updateUser)

export default router