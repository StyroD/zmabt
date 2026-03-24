import { Router } from 'express'
import { getProjectWorkers } from '../queries/workers'

const router = Router()

router.get('/:projectId', getProjectWorkers)

export default router
