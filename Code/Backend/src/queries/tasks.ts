import { Request, Response } from 'express'
import pool from '../config/db'
import { v4 as uuidv4 } from 'uuid'

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

export const createTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      project_id,
      title,
      description,
      category_id,
      priority,
      status,
      deadline,
      lat,
      lng
    } = req.body

    const id = uuidv4()

    const result = await pool.query(
      `INSERT INTO tasks 
        (id, project_id, title, description, category_id, priority, status, deadline, lat, lng, created_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
       RETURNING *`,
      [id, project_id, title, description, category_id, priority || 'medium', status || 'pending', deadline, lat, lng]
    )

    res.status(201).json(result.rows[0])
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}

export const updateTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const {
      title,
      description,
      category_id,
      priority,
      status,
      deadline,
      lat,
      lng
    } = req.body

    const result = await pool.query(
      `UPDATE tasks SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        category_id = COALESCE($3, category_id),
        priority = COALESCE($4, priority),
        status = COALESCE($5, status),
        deadline = COALESCE($6, deadline),
        lat = COALESCE($7, lat),
        lng = COALESCE($8, lng)
       WHERE id = $9
       RETURNING *`,
      [title, description, category_id, priority, status, deadline, lat, lng, id]
    )

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Task not found' })
      return
    }

    res.json(result.rows[0])
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}

export const deleteTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params

    const result = await pool.query(
      'DELETE FROM tasks WHERE id = $1 RETURNING *',
      [id]
    )

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Task not found' })
      return
    }

    res.json({ message: 'Task deleted', task: result.rows[0] })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}

export const getTasksByWorkerId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { workerId } = req.params

    const result = await pool.query(
      `SELECT t.* FROM tasks t
       JOIN task_assignments ta ON t.id = ta.task_id
       WHERE ta.worker_id = $1`,
      [workerId]
    )

    res.json(result.rows)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}

export const updateTaskStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { status } = req.body

    if (!['pending', 'in_progress', 'done'].includes(status)) {
      res.status(400).json({ error: 'Invalid status' })
      return
    }

    const result = await pool.query(
      'UPDATE tasks SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    )

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Task not found' })
      return
    }

    res.json(result.rows[0])
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}