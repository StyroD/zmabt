import { Router } from 'express'
import { getProjects, getProjectById } from '../queries/projects'

const router = Router()

router.get('/', getProjects)
router.get('/:id', getProjectById)

export default router
