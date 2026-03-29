import { Request, Response } from 'express'
import pool from '../config/db'

export const getTasks = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query('SELECT * FROM tasks')
    res.json(result.rows)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}

export const getTasksByProjectId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const result = await pool.query('SELECT * FROM tasks WHERE project_id = $1', [id])
    res.json(result.rows)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}
