import { Router } from 'express'
import { getNotifications, markAsRead } from '../queries/notifications'

const router = Router()

router.get('/user/:userId', getNotifications)
router.patch('/:id/read', markAsRead)

export default router