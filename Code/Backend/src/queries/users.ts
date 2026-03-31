import { Request, Response } from 'express'
import pool from '../config/db'

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  const result = await pool.query('SELECT * FROM users')
  res.json(result.rows)
}

export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const result = await pool.query(
      `SELECT u.*,
        COALESCE(
          json_agg(
            json_build_object(
              'id', c.id,
              'name', c.name,
              'category', sc.name,
              'status', c.status,
              'submitted_at', c.submitted_at
            )
          ) FILTER (WHERE c.id IS NOT NULL),
          '[]'
        ) as certificates
      FROM users u
      LEFT JOIN certificates c ON c.worker_id = u.id
      LEFT JOIN skill_categories sc ON sc.id = c.category_id
      WHERE u.id = $1
      GROUP BY u.id`,
      [id]
    )
    const user = result.rows[0]
    if (!user) {
      res.status(404).json({ error: 'User not found' })
      return
    }
    res.json(user)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}

export const createUser = async (req: Request, res: Response): Promise<void> => {
  const { name, email } = req.body
  const result = await pool.query(
    'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
    [name, email]
  )
  res.json(result.rows[0])
}
