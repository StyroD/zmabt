import { Router } from 'express'
import { getAuditLogs } from '../queries/audit'

const router = Router()

router.get('/', getAuditLogs)

export default router
