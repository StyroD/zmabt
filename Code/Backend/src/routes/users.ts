import { Router, Request, Response } from 'express'
import { getAllUsers, searchUsers, createUser, getUserById, updateUser, updatePushToken } from '../queries/users'
import authMiddleware from '../middleware/auth'
import upload from '../middleware/upload'
import pool from '../config/db'

const router = Router()

router.post('/', createUser)

router.get('/:id/avatar', async (req: Request, res: Response) => {
    try {
        const result = await pool.query(
            'SELECT avatar, avatar_mime_type FROM users WHERE id = $1',
            [req.params.id]
        )
        const user = result.rows[0]
        if (!user || !user.avatar) {
            res.status(404).json({ error: 'No avatar' })
            return
        }
        res.setHeader('Content-Type', user.avatar_mime_type ?? 'image/jpeg')
        res.send(user.avatar)
    } catch (err: any) {
        res.status(500).json({ error: err.message })
    }
})

router.get('/', authMiddleware, getAllUsers)
router.get('/search', authMiddleware, searchUsers)
router.get('/:id', authMiddleware, getUserById)
router.put('/:id', authMiddleware, upload.single('avatar'), updateUser)
router.patch('/:id/push-token', authMiddleware, updatePushToken)

export default router