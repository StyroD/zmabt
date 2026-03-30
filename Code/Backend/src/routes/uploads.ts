import { Router } from 'express'
import upload from '../middleware/upload'
import { uploadCertificate, getCertificateFile } from '../queries/uploads'

const router = Router()

router.post('/certificate', upload.single('file'), uploadCertificate)
router.get('/certificate/:id', getCertificateFile)

export default router