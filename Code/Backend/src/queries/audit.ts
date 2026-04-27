import { Request, Response } from 'express'
import pool from '../config/db'

export const getAuditLogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user as { id: string; role: string }
    if (user.role !== 'manager') {
      res.status(403).json({ error: 'Forbidden: managers only' })
      return
    }

    const { target_type, target_id, limit = '50' } = req.query

    let query = `
      SELECT al.*, u.username as actor_name, u.first_name, u.last_name
      FROM audit_logs al
      LEFT JOIN users u ON al.actor_id = u.id
      WHERE 1=1
    `
    const values: any[] = []

    if (target_type) {
      values.push(target_type)
      query += ` AND al.target_type = $${values.length}`
    }

    if (target_id) {
      values.push(target_id)
      query += ` AND al.target_id = $${values.length}`
    }

    values.push(Number(limit))
    query += ` ORDER BY al.created_at DESC LIMIT $${values.length}`

    const result = await pool.query(query, values)
    res.json(result.rows)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}
