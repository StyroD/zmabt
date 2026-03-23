require('dotenv').config()
const express = require('express')
const cors = require('cors')

const app = express()
app.use(cors())
app.use(express.json())

const usersRouter = require('./routes/users')
app.use('/api/users', usersRouter)

const projectsRouter = require('./routes/projects')
app.use('/api/projects', projectsRouter)

const workersRouter = require('./routes/workers')
app.use('/api/workers', workersRouter)

const authRouter = require('./routes/auth')
app.use('/api/auth', authRouter)

app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`)
})