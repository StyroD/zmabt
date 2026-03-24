import { Request, Response } from 'express'
import pool from '../config/db'

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  const result = await pool.query('SELECT * FROM users')
  res.json(result.rows)
}

export const getUserById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params
  const result = await pool.query('SELECT * FROM users WHERE id = $1', [id])
  const user = result.rows[0]
  if (!user) {
    res.status(404).json({ error: 'User not found' })
    return
  }
  res.json(user)
}

export const createUser = async (req: Request, res: Response): Promise<void> => {
  const { name, email } = req.body
  const result = await pool.query(
    'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
    [name, email]
  )
  res.json(result.rows[0])
}
