import { Router } from 'express'
import {
  getProjectById,
  getProjectByManagerId,
  getProjectsByWorkerId,
  createProject,
  updateProject,
  deleteProject,
  assignWorkerToProject,
  removeWorkerFromProject
} from '../queries/projects'

const router = Router()

router.get('/manager/:managerId', getProjectByManagerId)
router.get('/worker/:workerId', getProjectsByWorkerId)
router.get('/:id', getProjectById)
router.post('/', createProject)
router.put('/:id', updateProject)
router.delete('/:id', deleteProject)
router.post('/:id/workers', assignWorkerToProject)
router.delete('/:id/workers/:workerId', removeWorkerFromProject)

export default router