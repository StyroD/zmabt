import { Router } from 'express'
import { getAllWorkers, getProjectWorkers } from '../queries/workers'

const router = Router()

router.get('/', getAllWorkers)
router.get('/:projectId', getProjectWorkers)

export default router

