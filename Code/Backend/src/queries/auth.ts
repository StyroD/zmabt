import { Request, Response } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import pool from '../config/db'

export const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password, role } = req.body
    const passwordHash = await bcrypt.hash(password, 10)
    const result = await pool.query(
      'INSERT INTO users (username, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING *',
      [username, email, passwordHash, role]
    )
    const user = result.rows[0]
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET as string)
    res.json({ token, user })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email])
    const user = result.rows[0]
    if (!user) {
      res.status(401).json({ error: 'User not found' })
      return
    }
    const match = await bcrypt.compare(password, user.password_hash)
    if (!match) {
      res.status(401).json({ error: 'Wrong password' })
      return
    }
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET as string)
    res.json({ token, user })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}

export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user as { id: string }
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [user.id])
    res.json(result.rows[0])
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}
