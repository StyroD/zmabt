import { Request, Response } from 'express'
import pool from '../config/db'
import { v4 as uuidv4 } from 'uuid'
import { createAuditLog } from '../utils/audit'


export const getProjectById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const user = req.user as { id: string; role: string }

    const access = await pool.query(
      `SELECT 1 FROM projects WHERE id = $1 AND manager_id = $2
       UNION
       SELECT 1 FROM project_workers WHERE project_id = $1 AND worker_id = $2`,
      [id, user.id]
    )

    if (access.rows.length === 0) {
      res.status(403).json({ error: 'Forbidden: you are not part of this project' })
      return
    }

    const result = await pool.query('SELECT * FROM projects WHERE id = $1', [id])
    res.json(result.rows[0])
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}

export const getProjectsByWorkerId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { workerId } = req.params
    const result = await pool.query(
      `SELECT p.* FROM projects p
       JOIN project_workers pw ON p.id = pw.project_id
       WHERE pw.worker_id = $1
       ORDER BY p.created_at DESC`,
      [workerId]
    )
    res.json(result.rows)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}

export const getProjectByManagerId = async (req: Request, res: Response): Promise<void> => {
  try{
    const {managerId} = req.params
    const result = await pool.query('SELECT * FROM projects WHERE manager_id = $1', [managerId])
    res.json(result.rows)
  }catch (err: any){
    res.status(500).json({error: err.message})
  }
}



export const createProject = async (req: Request, res: Response): Promise<void> => {
  try{
    const user = req.user as { id: string; role: string }
    if (user.role !== 'manager') {
      res.status(403).json({ error: 'Forbidden: managers only' })
      return
    }
    const{
      manager_id,
      title,
      description,
      status,
      deadline,
      address,
      lat,
      lng,
      client_name,
      client_phone,
      client_email
    } = req.body
    const id = uuidv4()

    const result = await pool.query(`INSERT INTO projects (id, manager_id, title, description,status,deadline, address,lat,lng,client_name,client_phone,client_email, created_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12, NOW()) RETURNING *`,[id, manager_id, title, description, status || 'pending', deadline, address,lat,lng,client_name,client_phone,client_email])
    void createAuditLog({ actorId: user.id, action: 'create', targetType: 'project', targetId: result.rows[0].id, newValue: title })
    res.status(201).json(result.rows[0])
  }
  catch (err: any) {
    if (err.code === '23505') {
      res.status(409).json({ error: 'A project with this title already exists' })
    } else {
      res.status(500).json({ error: err.message })
    }
  }
}

export const updateProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const {
      title,
      description,
      status,
      deadline,
      address,
      lat,
      lng,
      client_name,
      client_phone,
      client_email
    } = req.body

    const result = await pool.query(
      `UPDATE projects SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        status = COALESCE($3, status),
        deadline = COALESCE($4, deadline),
        address = COALESCE($5, address),
        lat = COALESCE($6, lat),
        lng = COALESCE($7, lng),
        client_name = COALESCE($8, client_name),
        client_phone = COALESCE($9, client_phone),
        client_email = COALESCE($10, client_email)
       WHERE id = $11
       RETURNING *`,
      [title, description, status, deadline, address, lat, lng, client_name, client_phone, client_email, id]
    )

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Project not found' })
      return
    }

    const user = req.user as { id: string; role: string }
    void createAuditLog({ actorId: user.id, action: 'update', targetType: 'project', targetId: id as string })
    res.json(result.rows[0])
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}

export const deleteProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params

    const result = await pool.query(
      'DELETE FROM projects WHERE id = $1 RETURNING *',
      [id]
    )

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Project not found' })
      return
    }

    const user = req.user as { id: string; role: string }
    void createAuditLog({ actorId: user.id, action: 'delete', targetType: 'project', targetId: id as string, oldValue: result.rows[0].title })
    res.json({ message: 'Project deleted', project: result.rows[0] })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}

export const assignWorkerToProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { worker_id } = req.body

    const result = await pool.query(
      `INSERT INTO project_workers (project_id, worker_id, joined_at)
      VALUES ($1, $2, NOW())
      ON CONFLICT (project_id, worker_id) DO NOTHING
      RETURNING *`,
      [id, worker_id]
    )

    if (result.rows.length === 0) {
      res.status(409).json({ error: 'Worker already assigned to this project' })
      return
    }

    res.status(201).json(result.rows[0])
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}

export const removeWorkerFromProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id, workerId } = req.params

    const result = await pool.query(
      'DELETE FROM project_workers WHERE project_id = $1 AND worker_id = $2 RETURNING *',
      [id, workerId]
    )

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Worker not assigned to this project' })
      return
    }

    res.json({ message: 'Worker removed from project' })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}