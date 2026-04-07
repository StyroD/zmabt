import { Router } from 'express'
import { getCategories } from '../queries/categories'

const router = Router()

router.get('/', getCategories)

export default router
