const pool = require('../config/db')
<<<<<<< HEAD

=======
>>>>>>> origin/adam

const getUsers = async (req, res) => {
  const result = await pool.query('SELECT * FROM users')
  res.json(result.rows)
}

const createUser = async (req, res) => {
  const { name, email } = req.body
  const result = await pool.query(
    'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
    [name, email]
  )
  res.json(result.rows[0])
}

module.exports = { getUsers, createUser }