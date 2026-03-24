const pool = require('../config/db')

const getUsers = async (req, res) => {
  const result = await pool.query('SELECT * FROM users')
  res.json(result.rows)
}

const getUserById = async (req, res) => {
    const { id } = req.params
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id])
    const user = result.rows[0]
    if (!user) return res.status(404).json({ error: 'User not found' })
    res.json(user)
}

const createUser = async (req, res) => {
  const { name, email } = req.body
  const result = await pool.query(
    'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
    [name, email]
  )
  res.json(result.rows[0])
}


module.exports = { getUsers, createUser, getUserById }