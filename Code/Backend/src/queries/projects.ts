import { Request, Response } from 'express'
import pool from '../config/db'

export const getProjects = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query('SELECT * FROM projects')
    res.json(result.rows)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}

export const getProjectById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const result = await pool.query('SELECT * FROM projects WHERE id = $1', [id])
    res.json(result.rows[0])
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}
