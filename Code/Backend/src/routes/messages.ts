import { Router } from 'express'
import { getMessagesBetween, getConversations, sendMessage } from '../queries/messages'

const router = Router()

router.get('/conversations', getConversations)
router.post('/', sendMessage)
router.get('/:otherUserId', getMessagesBetween)

export default router
