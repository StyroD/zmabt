import { Request, Response } from 'express'
import pool from '../config/db'
import { v4 as uuidv4 } from 'uuid'
import { emitNewMessage } from '../socket'

export const getMessagesBetween = async (req: Request, res: Response): Promise<void> => {
  try {
    const currentUserId = (req.user as { id: string }).id
    const { otherUserId } = req.params

    const result = await pool.query(
      `SELECT m.*,
              u.username as sender_name
       FROM messages m
       JOIN users u ON u.id = m.sender_id
       WHERE (m.sender_id = $1 AND m.receiver_id = $2)
          OR (m.sender_id = $2 AND m.receiver_id = $1)
       ORDER BY m.sent_at ASC`,
      [currentUserId, otherUserId]
    )

    res.json(result.rows)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}

export const getConversations = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req.user as { id: string }).id

    const result = await pool.query(
      `SELECT latest.other_user_id,
              u.username as name,
              latest.content as last_message,
              latest.sent_at as timestamp,
              latest.sender_id
       FROM (
         SELECT DISTINCT ON (other_user_id)
           CASE WHEN sender_id = $1 THEN receiver_id ELSE sender_id END as other_user_id,
           content,
           sent_at,
           sender_id
         FROM messages
         WHERE sender_id = $1 OR receiver_id = $1
         ORDER BY other_user_id, sent_at DESC
       ) latest
       JOIN users u ON u.id = latest.other_user_id
       ORDER BY latest.sent_at DESC`,
      [userId]
    )

    res.json(result.rows)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}

export const sendMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const senderId = (req.user as { id: string }).id
    const { receiverId, content } = req.body

    if (!receiverId || !content?.trim()) {
      res.status(400).json({ error: 'receiverId and content are required' })
      return
    }

    const id = uuidv4()
    const result = await pool.query(
      `WITH inserted AS (
         INSERT INTO messages (id, sender_id, receiver_id, content)
         VALUES ($1, $2, $3, $4)
         RETURNING *
       )
       SELECT i.*, u.username AS sender_name
       FROM inserted i
       JOIN users u ON u.id = i.sender_id`,
      [id, senderId, receiverId, content.trim()]
    )
    const message = result.rows[0]

    // Push to receiver in real-time if they are connected
    emitNewMessage(receiverId, message)

    res.status(201).json(message)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}
