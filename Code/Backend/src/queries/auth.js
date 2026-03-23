const pool = require('../config/db')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const registerUser = async (req, res) => {
    const { email, password } = req.body
    const passwordHash = await bcrypt.hash(password, 10)
    const result = await pool.query(
        'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING *',
        [email, email, passwordHash]
    )
    res.json(result.rows[0])
}

const loginUser = async (req, res) => {
    const { email, password } = req.body
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email])
    const user = result.rows[0]
    if (!user) return res.status(401).json({ error: 'User not found' })
    const match = await bcrypt.compare(password, user.password_hash)
    if (!match) return res.status(401).json({ error: 'Wrong password' })
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET)
    res.json({ token, user })
}

module.exports = { registerUser, loginUser }