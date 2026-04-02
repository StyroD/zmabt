import { Router } from 'express'
import { getManagerDashboard, getWorkerDashboard } from '../queries/dashboard'

const router = Router()

router.get('/manager/:id', getManagerDashboard)
router.get('/worker/:id', getWorkerDashboard)

export default router