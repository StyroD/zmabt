import { Request, Response } from 'express'
import pool from '../config/db'
import { sendNotification } from '../utils/notifications'

export const uploadCertificate = async (req: Request, res: Response): Promise<void> => {
  try {
    const { worker_id, category_id, name } = req.body

    if (!category_id) {
      res.status(400).json({ error: 'category_id is required' })
      return
    }

    const fileData = (req.file as Express.Multer.File).buffer
    const clientMime = (req.file as Express.Multer.File).mimetype

    let mimeType = clientMime
    if (fileData[0] === 0xff && fileData[1] === 0xd8) mimeType = 'image/jpeg'
    else if (fileData[0] === 0x89 && fileData[1] === 0x50) mimeType = 'image/png'
    else if (fileData[0] === 0x25 && fileData[1] === 0x50) mimeType = 'application/pdf'

    const result = await pool.query(
      `INSERT INTO certificates (worker_id, category_id, name, file_data, file_url, status, submitted_at)
       VALUES ($1, $2, $3, $4, $5, 'pending', NOW()) RETURNING id, worker_id, category_id, name, file_url, status, reviewed_by, reviewed_at, submitted_at`,
      [worker_id, category_id, name, fileData, mimeType]
    )
    const cert = result.rows[0]

    // Notify the worker's manager
    const managerResult = await pool.query(
      `SELECT p.manager_id FROM project_workers pw
       JOIN projects p ON p.id = pw.project_id
       WHERE pw.worker_id = $1
       LIMIT 1`,
      [worker_id]
    )
    const managerId = managerResult.rows[0]?.manager_id

    if (managerId) {
      await sendNotification({
        userId: managerId,
        type: 'certificate_submitted',
        title: 'Certificate submitted',
        body: `A worker submitted a certificate: ${name}`,
        referenceId: cert.id,
        referenceType: 'certificate',
      })
    }

    res.json(cert)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}

export const getCertificateFile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const result = await pool.query(
      'SELECT file_data, file_url FROM certificates WHERE id = $1',
      [id]
    )
    const cert = result.rows[0]
    if (!cert || !cert.file_data) {
      res.status(404).json({ error: 'File not found' })
      return
    }
    res.setHeader('Content-Type', cert.file_url)
    res.setHeader('Content-Disposition', 'inline')
    res.send(cert.file_data)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}

export const getCertificatesByWorker = async (req: Request, res: Response): Promise<void> => {
  try {
    const { workerId } = req.params
    const result = await pool.query(
      `SELECT c.id, c.worker_id, c.category_id, c.name, c.file_url, c.status,
              c.reviewed_by, c.reviewed_at, c.submitted_at, sc.name as category_name
       FROM certificates c
       JOIN skill_categories sc ON c.category_id = sc.id
       WHERE c.worker_id = $1
       ORDER BY sc.name, c.submitted_at DESC`,
      [workerId]
    )
    res.json(result.rows)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}

export const updateCertificateStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { status, reviewed_by } = req.body
    if (!['pending', 'accepted', 'rejected'].includes(status)) {
      res.status(400).json({ error: 'Invalid status' })
      return
    }
    const result = await pool.query(
      `UPDATE certificates 
       SET status = $1, reviewed_by = $2, reviewed_at = NOW()
       WHERE id = $3 RETURNING *`,
      [status, reviewed_by, id]
    )
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Certificate not found' })
      return
    }
    const cert = result.rows[0]

    // Notify the worker about the review result
    await sendNotification({
      userId: cert.worker_id,
      type: 'certificate_reviewed',
      title: status === 'accepted' ? 'Certificate accepted' : 'Certificate rejected',
      body: `Your certificate "${cert.name}" has been ${status}`,
      referenceId: cert.id,
      referenceType: 'certificate',
    })

    res.json(cert)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}
export const uploadProjectPhoto = async (req: Request, res: Response): Promise<void> => {
  try {
    const { project_id, task_id } = req.body
    const uploadedBy = (req.user as { id: string }).id
    const fileData = (req.file as Express.Multer.File).buffer
    const clientMime = (req.file as Express.Multer.File).mimetype

    // Detect MIME from magic bytes so it's not spoofable/wrong from client
    let mimeType = clientMime
    if (fileData[0] === 0xff && fileData[1] === 0xd8) mimeType = 'image/jpeg'
    else if (fileData[0] === 0x89 && fileData[1] === 0x50) mimeType = 'image/png'
    else if (fileData[0] === 0x47 && fileData[1] === 0x49) mimeType = 'image/gif'
    else if (fileData[0] === 0x52 && fileData[1] === 0x49) mimeType = 'image/webp'

    const result = await pool.query(
      `INSERT INTO project_photos (project_id, task_id, uploaded_by, file_data, file_url, uploaded_at)
       VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *`,
      [project_id, task_id ?? null, uploadedBy, fileData, mimeType]
    )

    res.status(201).json(result.rows[0])
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}

export const getProjectPhotos = async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params
    const { task_id } = req.query

    let query = `SELECT * FROM project_photos WHERE project_id = $1`
    const values: any[] = [projectId]

    if (task_id) {
      query += ` AND task_id = $2`
      values.push(task_id)
    }

    query += ` ORDER BY uploaded_at DESC`

    const result = await pool.query(query, values)

    // Convert file_data to base64
    const photos = result.rows.map(photo => ({
      ...photo,
      file_data: photo.file_data ? photo.file_data.toString('base64') : null
    }))

    res.json(photos)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}

export const getProjectPhotoFile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const result = await pool.query(
      'SELECT file_data, file_url FROM project_photos WHERE id = $1',
      [id]
    )
    const photo = result.rows[0]
    if (!photo || !photo.file_data) {
      res.status(404).json({ error: 'Photo not found' })
      return
    }
    res.setHeader('Content-Type', photo.file_url)
    res.setHeader('Content-Disposition', 'inline')
    res.send(photo.file_data)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}