const pool = require('../config/db')

const getProjects = async (req, res) => {
    try{
        const result = await pool.query('SELECT * FROM projects')
        res.json(result.rows)
    }
    catch (err){
        res.status(500).json({error: err.message})
    }
}

const getProjectById = async (req, res) => {
  try {
    const { id } = req.params
    const result = await pool.query('SELECT * FROM projects WHERE id = $1', [id])
    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

module.exports = {getProjects, getProjectById}