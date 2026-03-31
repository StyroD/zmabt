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