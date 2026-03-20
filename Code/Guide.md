# How to fetch data from the backend

## Overview

```
PostgreSQL → queries/x.js → routes/x.js → index.js → client.ts → endpoints/x.ts → Screen
```

---

## Step 1 — Add a query (Backend)

In `Backend/src/queries/` create or edit a file, e.g. `projects.js`:

```js
const pool = require('../config/db')

// GET all projects
const getProjects = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM projects')
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// GET single project by id
const getProjectById = async (req, res) => {
  try {
    const { id } = req.params
    const result = await pool.query('SELECT * FROM projects WHERE id = $1', [id])
    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

module.exports = { getProjects, getProjectById }
```

**Rules:**
- Always use `try/catch`
- Use `$1, $2...` for variables — never put variables directly in the SQL string
- Always `res.json()` the result

---

## Step 2 — Add a route (Backend)

In `Backend/src/routes/` create `projects.js`:

```js
const router = require('express').Router()
const { getProjects, getProjectById } = require('../queries/projects')

router.get('/', getProjects)
router.get('/:id', getProjectById)

module.exports = router
```

---

## Step 3 — Register the route in index.js (Backend)

In `Backend/src/index.js` add:

```js
const projectsRouter = require('./routes/projects')
app.use('/api/projects', projectsRouter)
```

**Test it** — open in browser or Postman:
```
http://localhost:3000/api/projects
http://localhost:3000/api/projects/<some-uuid>
```

---

## Step 4 — Add an endpoint (Frontend)

In `Frontend/api/endpoints/` create `projects.ts`:

```ts
import client from '../client'

export const getProjects = () => client.get('/projects')
export const getProjectById = (id: string) => client.get(`/projects/${id}`)
```

---

## Step 5 — Use it in a screen (Frontend)

```tsx
import { useEffect, useState } from 'react'
import { View, Text, ActivityIndicator } from 'react-native'
import { getProjects } from '@/api/endpoints/projects'

export default function ProjectsScreen() {
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getProjects()
      .then(res => {
        setProjects(res.data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [])

  if (loading) return <ActivityIndicator />

  return (
    <View>
      {projects.map(project => (
        <Text key={project.id}>{project.title}</Text>
      ))}
    </View>
  )
}
```

---

## Common SQL queries

```js
// Get all rows
pool.query('SELECT * FROM tasks')

// Get by id
pool.query('SELECT * FROM tasks WHERE id = $1', [id])

// Get by foreign key
pool.query('SELECT * FROM tasks WHERE project_id = $1', [projectId])

// Insert
pool.query(
  'INSERT INTO tasks (title, project_id) VALUES ($1, $2) RETURNING *',
  [title, projectId]
)

// Update
pool.query(
  'UPDATE tasks SET status = $1 WHERE id = $2 RETURNING *',
  [status, id]
)

// Delete
pool.query('DELETE FROM tasks WHERE id = $1', [id])
```

---

## Summary checklist

For every new resource (tasks, projects, certificates...):

- [ ] `Backend/src/queries/x.js` — SQL functions
- [ ] `Backend/src/routes/x.js` — route definitions
- [ ] Register route in `Backend/src/index.js`
- [ ] `Frontend/api/endpoints/x.ts` — axios calls
- [ ] Use in screen with `useEffect` + `useState`