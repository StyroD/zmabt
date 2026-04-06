import { Router } from 'express'
import { updateWorkerLocation, getProjectWorkerLocations } from '../queries/locations'
import authMiddleware from '../middleware/auth'

const router = Router()

router.post('/', authMiddleware, updateWorkerLocation)
router.get('/project/:projectId', authMiddleware, getProjectWorkerLocations)

export default router