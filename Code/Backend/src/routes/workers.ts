import { Router } from 'express'
import { getProjectWorkers, getAllWorkers } from '../queries/workers'

const router = Router()

router.get('/', getAllWorkers)
router.get('/:projectId', getProjectWorkers)

export default router

