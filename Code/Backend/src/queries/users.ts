import { Request, Response } from 'express'
import pool from '../config/db'

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const currentUserId = (req.user as { id: string }).id
    const result = await pool.query(
      `SELECT id, first_name, last_name, username, role
       FROM users
       WHERE id != $1
       ORDER BY first_name, last_name`,
      [currentUserId]
    )
    res.json(result.rows)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
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
    user.has_avatar = !!user.avatar
    delete user.avatar
    delete user.avatar_mime_type
    delete user.password_hash
    delete user.google_id
    delete user.avatar
    delete user.avatar_mime_type

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

        const {
            first_name, last_name, phone, address,
            fcm_token, hourly_rate, emergency_contact_name,
            emergency_contact_phone, iban, notes,
        } = req.body

        const values: any[] = [
            first_name ?? null,
            last_name ?? null,
            phone ?? null,
            address ?? null,
            fcm_token ?? null,
            hourly_rate ?? null,
            emergency_contact_name ?? null,
            emergency_contact_phone ?? null,
            iban ?? null,
            notes ?? null,
        ]

        let avatarClause = ''
        if (req.file) {
            let mime = req.file.mimetype
            const b = req.file.buffer
            if (b[0] === 0xff && b[1] === 0xd8) mime = 'image/jpeg'
            else if (b[0] === 0x89 && b[1] === 0x50) mime = 'image/png'
            values.push(b, mime)
            avatarClause = `, avatar = $${values.length - 1}, avatar_mime_type = $${values.length}`
        }

        values.push(id)
        const idParam = `$${values.length}`

        const query = `
          UPDATE users SET
              first_name              = $1,
              last_name               = $2,
              phone                   = $3,
              address                 = $4,
              fcm_token               = COALESCE($5, fcm_token),
              hourly_rate             = $6,
              emergency_contact_name  = $7,
              emergency_contact_phone = $8,
              iban                    = $9,
              notes                   = $10
              ${avatarClause}
          WHERE id = ${idParam}
          RETURNING *
      `

        const result = await pool.query(query, values)

        if (result.rows.length === 0) {
            res.status(404).json({ error: 'User not found' })
            return
        }

        const updated = result.rows[0]
        delete updated.password_hash
        delete updated.google_id
        delete updated.avatar
        delete updated.avatar_mime_type

        res.json(updated)
    } catch (err: any) {
        res.status(500).json({ error: err.message })
    }

    const { first_name, last_name, title, phone, address, avatar_url, fcm_token } = req.body

    let query = `UPDATE users SET
      first_name = COALESCE($1, first_name),
      last_name = COALESCE($2, last_name),
      title = COALESCE($3, title),
      phone = COALESCE($4, phone),
      address = COALESCE($5, address),
      avatar_url = COALESCE($6, avatar_url),
      fcm_token = COALESCE($7, fcm_token)`

    const values: any[] = [first_name, last_name, title, phone, address, avatar_url, fcm_token]

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
