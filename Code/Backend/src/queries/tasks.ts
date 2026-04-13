import { Request, Response } from 'express'
import pool from '../config/db'
import { v4 as uuidv4 } from 'uuid'
import { sendNotification } from '../utils/notifications'

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

export const assignWorkersToTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string
    const { worker_ids } = req.body as { worker_ids: string[] }

    if (!worker_ids?.length) {
      res.status(400).json({ error: 'worker_ids is required' })
      return
    }

    // Get task to check category
    const taskResult = await pool.query('SELECT id, title, category_id FROM tasks WHERE id = $1', [id])
    if (taskResult.rows.length === 0) {
      res.status(404).json({ error: 'Task not found' })
      return
    }
    const task = taskResult.rows[0]

    // Check eligibility if task has a category
    const ineligible: string[] = []
    if (task.category_id) {
      const eligibilityResult = await pool.query(
        `SELECT worker_id FROM certificates
         WHERE worker_id = ANY($1::uuid[])
         AND category_id = $2
         AND status = 'accepted'`,
        [worker_ids, task.category_id]
      )
      const eligibleIds = eligibilityResult.rows.map(r => r.worker_id)
      worker_ids.forEach(wId => {
        if (!eligibleIds.includes(wId)) ineligible.push(wId)
      })
    }

    if (ineligible.length > 0) {
      res.status(400).json({
        error: 'Some workers are not eligible for this task',
        ineligible_worker_ids: ineligible
      })
      return
    }

    // Assign eligible workers
    const values = worker_ids.map((_, i) => `($1, $${i + 2}, NOW())`).join(', ')
    await pool.query(
      `INSERT INTO task_assignments (task_id, worker_id, assigned_at) VALUES ${values} ON CONFLICT DO NOTHING`,
      [id, ...worker_ids]
    )

    // Notify each assigned worker
    await Promise.all(
      worker_ids.map(workerId =>
        sendNotification({
          userId: workerId,
          type: 'task_assigned',
          title: 'New task assigned',
          body: `You have been assigned to: ${task.title}`,
          referenceId: id,
          referenceType: 'task',
        })
      )
    )

    res.status(201).json({ message: 'Workers assigned' })
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