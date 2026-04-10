import { Router } from 'express'
import { getUsers, createUser, getUserById, updateUser } from '../queries/users'
import authMiddleware from '../middleware/auth'
import upload from '../middleware/upload'

const router = Router()

router.get('/', authMiddleware, getUsers)
router.post('/', createUser)
router.get('/:id', authMiddleware, getUserById)
router.put('/:id', authMiddleware, upload.single('avatar'), updateUser)

export default router