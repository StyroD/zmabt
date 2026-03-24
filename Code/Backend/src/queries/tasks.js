const pool = require('../config/db')

const getTasks = async (req, res) =>{
    try{
        const result = await pool.query("SELECT * FROM tasks")
        res.json(result.rows)
    }catch(err){
        res.status(500).json({error: err.message})
    }
}

const getTasksByProjectId = async (req, res) => {
    try{
        const {id} = req.params
        const result = await pool.query("SELECT * FROM tasks WHERE project_id = $1",[id])
        res.json(result.rows)
    }catch(err){
        res.status(500).json({error: err.message})
    }
}

module.exports = {getTasks, getTasksByProjectId}