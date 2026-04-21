import { Request, Response } from 'express'
import pool from '../config/db'

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
              'category_id', c.category_id,
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

    // Remove sensitive fields
    delete user.password_hash
    delete user.google_id
    delete user.iban

    if (user.avatar) {
      user.avatar = user.avatar.toString('base64')
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

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const user = req.user as { id: string; role: string }

    if (user.id !== id) {
      res.status(403).json({ error: 'Forbidden' })
      return
    }

    const fields = ['first_name', 'last_name', 'hourly_rate', 'currency', 'phone', 'email']
    const updates: string[] = []
    const values: any[] = []

    fields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates.push(`${field} = $${updates.length + 1}`)
        values.push(req.body[field])
      }
    })

    // Handle avatar from multer memory storage
    if (req.file) {
      updates.push(`avatar = $${updates.length + 1}`)
      values.push(req.file.buffer) // raw bytes → bytea
    }

    if (updates.length === 0) {
      res.status(400).json({ error: 'No fields provided to update' })
      return
    }

    values.push(id)
    //const result = await pool.query(
      //`UPDATE users SET ${updates.join(', ')} WHERE id = $${values.length} RETURNING *`,
      //values
    const { first_name, last_name, phone, address, avatar_url, fcm_token } = req.body

    const result = await pool.query(
      `UPDATE users SET
        first_name = COALESCE($1, first_name),
        last_name = COALESCE($2, last_name),
        phone = COALESCE($3, phone),
        address = COALESCE($4, address),
        avatar_url = COALESCE($5, avatar_url),
        fcm_token = COALESCE($6, fcm_token)
       WHERE id = $7 RETURNING *`,
      [first_name, last_name, phone, address, avatar_url, fcm_token, id]
    )

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'User not found' })
      return
    }

    const updatedUser = result.rows[0]

    // Convert avatar bytes to base64 for response
    if (updatedUser.avatar) {
      updatedUser.avatar = updatedUser.avatar.toString('base64')
    }

    res.json(updatedUser)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}

export const updatePushToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { expo_push_token } = req.body

    if (!expo_push_token) {
      res.status(400).json({ error: 'expo_push_token is required' })
      return
    }

    const result = await pool.query(
      'UPDATE users SET fcm_token = $1 WHERE id = $2 RETURNING id, fcm_token',
      [expo_push_token, id]
    )

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'User not found' })
      return
    }

    res.json({ message: 'Push token updated', user: result.rows[0] })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}
