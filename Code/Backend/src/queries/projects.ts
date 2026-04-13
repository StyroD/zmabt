import { Request, Response } from 'express'
import pool from '../config/db'
import { v4 as uuidv4 } from 'uuid'


export const getProjects = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query('SELECT * FROM projects')
    res.json(result.rows)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}

export const getProjectById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const result = await pool.query('SELECT * FROM projects WHERE id = $1', [id])
    res.json(result.rows[0])
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
    res.status(201).json(result.rows[0])
  }
  catch (err:any){
    res.status(500).json({error:err.message})
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