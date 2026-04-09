import { Router } from 'express'
import { getUsers, createUser, getUserById, updateUser } from '../queries/users'

const router = Router()

router.get('/', getUsers)
router.post('/', createUser)
router.get('/:id', getUserById)
router.put('/:id', updateUser)

export default router
