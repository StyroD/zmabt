import { Request, Response } from 'express'
import pool from '../config/db'

export const getManagerDashboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params

    const projectsCount = await pool.query(
      'SELECT COUNT(*) FROM projects WHERE manager_id = $1',
      [id]
    )

    const tasksStats = await pool.query(
      `SELECT
        COUNT(*) FILTER (WHERE t.status = 'pending') as pending_tasks,
        COUNT(*) FILTER (WHERE t.status = 'in_progress') as in_progress_tasks,
        COUNT(*) FILTER (WHERE t.status = 'done') as completed_tasks
       FROM tasks t
       JOIN projects p ON t.project_id = p.id
       WHERE p.manager_id = $1`,
      [id]
    )

    const workersCount = await pool.query(
      `SELECT COUNT(DISTINCT pw.worker_id) 
       FROM project_workers pw
       JOIN projects p ON pw.project_id = p.id
       WHERE p.manager_id = $1`,
      [id]
    )

    const onlineWorkersCount = await pool.query(
      `SELECT COUNT(DISTINCT wl.worker_id)
       FROM worker_locations wl
       JOIN project_workers pw ON pw.worker_id = wl.worker_id
       JOIN projects p ON p.id = pw.project_id
       WHERE p.manager_id = $1 AND wl.is_online = true`,
      [id]
    )

    res.json({
      projects_count: parseInt(projectsCount.rows[0].count),
      pending_tasks: parseInt(tasksStats.rows[0].pending_tasks),
      in_progress_tasks: parseInt(tasksStats.rows[0].in_progress_tasks),
      completed_tasks: parseInt(tasksStats.rows[0].completed_tasks),
      workers_count: parseInt(workersCount.rows[0].count),
      online_workers_count: parseInt(onlineWorkersCount.rows[0].count),
    })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}

export const getWorkerDashboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params

    const tasksStats = await pool.query(
      `SELECT 
        COUNT(*) FILTER (WHERE status = 'pending') as pending_tasks,
        COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress_tasks,
        COUNT(*) FILTER (WHERE status = 'done') as completed_tasks,
        COUNT(*) FILTER (WHERE status = 'done' AND DATE(created_at) = CURRENT_DATE) as completed_today
       FROM tasks t
       JOIN task_assignments ta ON t.id = ta.task_id
       WHERE ta.worker_id = $1`,
      [id]
    )

    const projectsCount = await pool.query(
      `SELECT COUNT(DISTINCT project_id) 
       FROM project_workers 
       WHERE worker_id = $1`,
      [id]
    )

    const certificatesCount = await pool.query(
      `SELECT COUNT(*) FROM certificates WHERE worker_id = $1`,
      [id]
    )

    res.json({
      pending_tasks: parseInt(tasksStats.rows[0].pending_tasks),
      in_progress_tasks: parseInt(tasksStats.rows[0].in_progress_tasks),
      completed_tasks: parseInt(tasksStats.rows[0].completed_tasks),
      completed_today: parseInt(tasksStats.rows[0].completed_today),
      projects_count: parseInt(projectsCount.rows[0].count),
      certificates_count: parseInt(certificatesCount.rows[0].count),
    })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}