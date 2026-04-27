import { Request, Response } from "express";
import pool from "../config/db";

export const getAllWorkers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { manager_id } = req.query

    let result
    if (manager_id) {
      result = await pool.query(`
        SELECT u.id, u.first_name, u.last_name, u.username, u.phone, u.email, u.avatar_url,
          COALESCE(
            json_agg(
              json_build_object('name', sc.name, 'status', c.status, 'category_id', c.category_id)
            ) FILTER (WHERE sc.name IS NOT NULL),
            '[]'
          ) as certificates
        FROM users u
        JOIN project_workers pw ON pw.worker_id = u.id
        JOIN projects p ON p.id = pw.project_id
        LEFT JOIN certificates c ON c.worker_id = u.id
        LEFT JOIN skill_categories sc ON sc.id = c.category_id
        WHERE u.role = 'worker' AND p.manager_id = $1
        GROUP BY u.id
        ORDER BY u.last_name, u.first_name
      `, [manager_id])
    } else {
      result = await pool.query(`
        SELECT u.id, u.first_name, u.last_name, u.username, u.phone, u.email, u.avatar_url,
          COALESCE(
            json_agg(
              json_build_object('name', sc.name, 'status', c.status, 'category_id', c.category_id)
            ) FILTER (WHERE sc.name IS NOT NULL),
            '[]'
          ) as certificates
        FROM users u
        LEFT JOIN certificates c ON c.worker_id = u.id
        LEFT JOIN skill_categories sc ON sc.id = c.category_id
        WHERE u.role = 'worker'
        GROUP BY u.id
        ORDER BY u.last_name, u.first_name
      `)
    }

    res.json(result.rows)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}

export const getProjectWorkers = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { projectId } = req.params
    const { category_id } = req.query

    let query = `
      SELECT u.id, u.first_name, u.last_name,
        COALESCE(
          json_agg(sc.name) FILTER (WHERE sc.name IS NOT NULL AND c.status = 'accepted'),
          '[]'
        ) as certificates
      FROM users u
      JOIN project_workers pw ON pw.worker_id = u.id
      LEFT JOIN certificates c ON c.worker_id = u.id
      LEFT JOIN skill_categories sc ON sc.id = c.category_id
      WHERE pw.project_id = $1
    `

    const values: any[] = [projectId]

    if (category_id) {
      query += `
        AND u.id IN (
          SELECT worker_id FROM certificates
          WHERE category_id = $2 AND status = 'accepted'
        )
      `
      values.push(category_id)
    }

    query += ` GROUP BY u.id, u.first_name, u.last_name`

    const result = await pool.query(query, values)
    res.json(result.rows)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}
