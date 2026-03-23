const pool = require("../config/db");

const getProjectWorkers = async (req, res) => {
  try {
    const { projectId } = req.params

    const result = await pool.query("SELECT u.id, u.first_name, u.last_name FROM users u JOIN project_workers pw ON pw.worker_id = u.id WHERE pw.project_id = $1", [projectId]);
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({error: err.message})
  }
};

module.exports = {getProjectWorkers}
