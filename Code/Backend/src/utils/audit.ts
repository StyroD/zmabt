import pool from '../config/db'

export const createAuditLog = async (params: {
  actorId: string
  action: string
  targetType: string
  targetId: string
  oldValue?: string
  newValue?: string
}): Promise<void> => {
  try {
    await pool.query(
      `INSERT INTO audit_logs (actor_id, action, target_type, target_id, old_value, new_value, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
      [params.actorId, params.action, params.targetType, params.targetId, params.oldValue ?? null, params.newValue ?? null]
    )
  } catch {
    // audit log failure must not break the main operation
  }
}
