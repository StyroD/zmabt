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
  try {
    const { name, email } = req.body
    const result = await pool.query(
      'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
      [name, email]
    )
    res.json(result.rows[0])
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const user = req.user as { id: string; role: string }

    if (user.id !== id) {
      res.status(403).json({ error: 'Forbidden' })
      return
    }

    const { first_name, last_name, phone, address, avatar_url, fcm_token } = req.body

    let query = `UPDATE users SET
      first_name = COALESCE($1, first_name),
      last_name = COALESCE($2, last_name),
      phone = COALESCE($3, phone),
      address = COALESCE($4, address),
      avatar_url = COALESCE($5, avatar_url),
      fcm_token = COALESCE($6, fcm_token)`

    const values: any[] = [first_name, last_name, phone, address, avatar_url, fcm_token]

    if (req.file) {
      let mimeType = req.file.mimetype
      const b = req.file.buffer
      if (b[0] === 0xff && b[1] === 0xd8) mimeType = 'image/jpeg'
      else if (b[0] === 0x89 && b[1] === 0x50) mimeType = 'image/png'
      values.push(b, mimeType)
      query += `, avatar = $${values.length - 1}, avatar_mime_type = $${values.length}`
    }

    values.push(id)
    query += ` WHERE id = $${values.length} RETURNING *`

    const result = await pool.query(query, values)

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'User not found' })
      return
    }

    const updatedUser = result.rows[0]
    delete updatedUser.password_hash
    delete updatedUser.google_id

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
