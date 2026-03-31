import { Router } from 'express'
import { getProjects, getProjectById, getProjectByManagerId } from '../queries/projects'

const router = Router()

router.get('/', getProjects)
router.get('manager/:managerId', getProjectByManagerId)
router.get('/:id', getProjectById)


export default router
