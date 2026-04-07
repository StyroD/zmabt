import { Router } from 'express'
import {
  getTasks,
  getTasksByProjectId,
  createTask,
  updateTask,
  deleteTask,
  getTasksByWorkerId,
  updateTaskStatus,
  assignWorkersToTask
} from '../queries/tasks'

const router = Router()

router.get('/', getTasks)
router.get('/project/:id', getTasksByProjectId)
router.get('/worker/:workerId', getTasksByWorkerId)
router.post('/', createTask)
router.put('/:id', updateTask)
router.patch('/:id/status', updateTaskStatus)
router.post('/:id/workers', assignWorkersToTask)
router.delete('/:id', deleteTask)

export default router