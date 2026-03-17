require('dotenv').config()
const express = require('express')
const cors = require('cors')

const app = express()
app.use(cors())
app.use(express.json())

const usersRouter = require('./routes/users')
app.use('/api/users', usersRouter)

app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`)
})