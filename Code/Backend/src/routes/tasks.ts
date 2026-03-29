import { Router } from 'express'
import { getTasks, getTasksByProjectId } from '../queries/tasks'

const router = Router()

router.get('/', getTasks)
router.get('/:id', getTasksByProjectId)

export default router
