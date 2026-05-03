import { Request, Response } from 'express'
import pool from '../config/db'
import { emitWorkerLocation } from '../socket'

export const updateWorkerLocation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { worker_id, project_id, lat, lng, is_online } = req.body
    const user = req.user as { id: string; role: string }

    if (user.id !== worker_id) {
      res.status(403).json({ error: 'Forbidden: you can only update your own location' })
      return
    }

    const membership = await pool.query(
      `SELECT 1 FROM project_workers WHERE project_id = $1 AND worker_id = $2`,
      [project_id, worker_id]
    )

    if (membership.rows.length === 0) {
      res.status(403).json({ error: 'Forbidden: you are not part of this project' })
      return
    }

    const result = await pool.query(
      `INSERT INTO worker_locations (worker_id, project_id, lat, lng, is_online, recorded_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       ON CONFLICT (worker_id, project_id) 
       DO UPDATE SET lat = $3, lng = $4, is_online = $5, recorded_at = NOW()
       RETURNING *`,
      [worker_id, project_id, lat, lng, is_online ?? true]
    )
    const managerRow = await pool.query(
      'SELECT manager_id FROM projects WHERE id = $1',
      [project_id]
    )
    const managerId = managerRow.rows[0]?.manager_id
    if (managerId) {
      const withUser = await pool.query(
        `SELECT wl.*, u.first_name, u.last_name
         FROM worker_locations wl JOIN users u ON u.id = wl.worker_id
         WHERE wl.worker_id = $1 AND wl.project_id = $2`,
        [worker_id, project_id]
      )
      emitWorkerLocation(managerId, withUser.rows[0])
    }

    res.json(result.rows[0])
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}

export const getProjectWorkerLocations = async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params
    const user = req.user as { id: string; role: string }

    if (user.role !== 'manager') {
      res.status(403).json({ error: 'Forbidden: only managers can view worker locations' })
      return
    }

    
    const m_result = await pool.query(
      `SELECT * FROM projects WHERE id = $1`,
      [projectId]
    )


    if (m_result.rows.length === 0) {
      res.status(404).json({ error: 'Project not found' })
      return
    }

    const project = m_result.rows[0]

    if (project.manager_id !== user.id) {
      res.status(403).json({ error: 'Forbidden: you are not the manager of this project' })
      return
    }

    const result = await pool.query(
    `SELECT wl.*, u.first_name, u.last_name,
        CASE 
            WHEN wl.recorded_at > NOW() - INTERVAL '15 minutes' THEN wl.is_online
            ELSE false
        END as is_online
     FROM worker_locations wl
     JOIN users u ON wl.worker_id = u.id
     WHERE wl.project_id = $1
     ORDER BY wl.recorded_at DESC`,
    [projectId]
)

    res.json(result.rows)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}