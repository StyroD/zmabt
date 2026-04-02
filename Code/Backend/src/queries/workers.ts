import { Request, Response } from "express";
import pool from "../config/db";

export const getProjectWorkers = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { projectId } = req.params;
    const result = await pool.query(
      `SELECT u.id, u.first_name, u.last_name,
    COALESCE(
      json_agg(sc.name) FILTER (WHERE sc.name IS NOT NULL AND c.status = 'accepted'),
      '[]'
    ) as certificates
  FROM users u
  JOIN project_workers pw ON pw.worker_id = u.id
  LEFT JOIN certificates c ON c.worker_id = u.id
  LEFT JOIN skill_categories sc ON sc.id = c.category_id
  WHERE pw.project_id = $1
  GROUP BY u.id, u.first_name, u.last_name`,
      [projectId],
    );
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getAllWorkers = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      `SELECT id, first_name, last_name, email, phone, certificates 
       FROM users 
       WHERE role = 'worker'`
    )
    res.json(result.rows)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}
