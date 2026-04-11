import { Request, Response } from 'express'
import pool from '../config/db'
import { v4 as uuidv4 } from 'uuid'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

export const generateInvite = async (req: Request, res: Response): Promise<void> => {
  try {
    const managerId = (req.user as { id: string }).id
    const token = uuidv4()
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

    await pool.query(
      `INSERT INTO invite_links (manager_id, token, expires_at) VALUES ($1, $2, $3)`,
      [managerId, token, expiresAt]
    )

    res.json({ token, expires_at: expiresAt })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}

export const registerWithInvite = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, username, email, password, first_name, last_name, phone } = req.body

    const inviteResult = await pool.query(
      `SELECT * FROM invite_links WHERE token = $1 AND used = false AND expires_at > NOW()`,
      [token]
    )

    if (inviteResult.rows.length === 0) {
      res.status(400).json({ error: 'Invalid or expired invite link' })
      return
    }

    const invite = inviteResult.rows[0]
    const passwordHash = await bcrypt.hash(password, 10)
    const userId = uuidv4()

    const userResult = await pool.query(
      `INSERT INTO users (id, username, email, password_hash, role, first_name, last_name, phone, created_at)
       VALUES ($1, $2, $3, $4, 'worker', $5, $6, $7, NOW()) RETURNING *`,
      [userId, username, email, passwordHash, first_name, last_name, phone]
    )

    await pool.query(`UPDATE invite_links SET used = true WHERE id = $1`, [invite.id])

    const user = userResult.rows[0]
    const jwtToken = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET as string)

    res.status(201).json({ token: jwtToken, user })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}
