import { Router } from 'express'
import upload from '../middleware/upload'
import { 
  uploadCertificate, getCertificateFile, getCertificatesByWorker, updateCertificateStatus,
  uploadProjectPhoto, getProjectPhotos, getProjectPhotoFile
} from '../queries/uploads'

const router = Router()

router.post('/certificate', upload.single('file'), uploadCertificate)
router.get('/certificate/:id', getCertificateFile)
router.get('/certificates/worker/:workerId', getCertificatesByWorker)
router.patch('/certificates/:id/status', updateCertificateStatus)

router.post('/photos', upload.single('photo'), uploadProjectPhoto)
router.get('/photos/project/:projectId', getProjectPhotos)
router.get('/photos/:id', getProjectPhotoFile)

export default router