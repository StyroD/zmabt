import { Request, Response } from 'express'
import pool from '../config/db'

export const getNotifications = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params

    const result = await pool.query(
      `SELECT * FROM notifications
       WHERE user_id = $1
       ORDER BY sent_at DESC`,
      [userId]
    )

    res.json(result.rows)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}

export const markAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params

    const result = await pool.query(
      'UPDATE notifications SET read = true WHERE id = $1 RETURNING *',
      [id]
    )

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Notification not found' })
      return
    }

    res.json(result.rows[0])
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}