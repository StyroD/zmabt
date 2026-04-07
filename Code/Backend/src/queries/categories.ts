import { Request, Response } from 'express'
import pool from '../config/db'

export const getCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query('SELECT * FROM skill_categories ORDER BY name')
    res.json(result.rows)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}
