import { Request, Response } from 'express'
import pool from '../config/db'

export const uploadCertificate = async (req: Request, res: Response): Promise<void> => {
  try {
    const { worker_id, category_id, name } = req.body
    const fileData = (req.file as Express.Multer.File).buffer
    const mimeType = (req.file as Express.Multer.File).mimetype

    const result = await pool.query(
      `INSERT INTO certificates (worker_id, category_id, name, file_data, file_url, status, submitted_at)
       VALUES ($1, $2, $3, $4, $5, 'pending', NOW()) RETURNING *`,
      [worker_id, category_id, name, fileData, mimeType]
    )
    res.json(result.rows[0])
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
    res.send(cert.file_data)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}

export const getCertificatesByWorker = async (req: Request, res: Response): Promise<void> => {
  try {
    const { workerId } = req.params
    const result = await pool.query(
      `SELECT c.*, sc.name as category_name 
       FROM certificates c
       JOIN skill_categories sc ON c.category_id = sc.id
       WHERE c.worker_id = $1
       ORDER BY c.submitted_at DESC`,
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
    res.json(result.rows[0])
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}