import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import cors from 'cors'
import swaggerUi from 'swagger-ui-express'
import usersRouter from './routes/users'
import projectsRouter from './routes/projects'
import workersRouter from './routes/workers'
import authRouter from './routes/auth'
import tasksRouter from './routes/tasks'

const app = express()
app.use(cors())
app.use(express.json())

app.use('/api/users', usersRouter)
app.use('/api/projects', projectsRouter)
app.use('/api/workers', workersRouter)
app.use('/api/auth', authRouter)
app.use('/api/tasks', tasksRouter)

const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Workflow API',
    version: '1.0.0',
    description: 'API for the Workflow construction management app',
  },
  tags: [
    { name: 'Auth', description: 'Authentication' },
    { name: 'Users', description: 'User management' },
    { name: 'Projects', description: 'Project management' },
    { name: 'Workers', description: 'Worker assignment' },
    { name: 'Tasks', description: 'Task management' },
  ],
  paths: {
    '/api/auth/login': {
      post: {
        summary: 'Login',
        tags: ['Auth'],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string', example: 'peter@workflow.com' },
                  password: { type: 'string', example: 'password123' },
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Returns JWT token' },
          401: { description: 'Invalid credentials' },
        }
      }
    },
    '/api/users': {
      get: {
        summary: 'Get all users',
        tags: ['Users'],
        responses: { 200: { description: 'List of users' } }
      }
    },
    '/api/users/{id}': {
      get: {
        summary: 'Get user by ID',
        tags: ['Users'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'User object' },
          404: { description: 'User not found' },
        }
      },
      put: {
        summary: 'Update user',
        tags: ['Users'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Updated user' } }
      }
    },
    '/api/projects': {
      get: {
        summary: 'Get all projects',
        tags: ['Projects'],
        responses: { 200: { description: 'List of projects' } }
      },
      post: {
        summary: 'Create a project',
        tags: ['Projects'],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  title: { type: 'string', example: 'Bytovy dom Bratislava' },
                  description: { type: 'string' },
                  deadline: { type: 'string', example: '2026-08-01' },
                  address: { type: 'string' },
                }
              }
            }
          }
        },
        responses: { 201: { description: 'Created project' } }
      }
    },
    '/api/projects/{id}': {
      get: {
        summary: 'Get project by ID',
        tags: ['Projects'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Project object' },
          404: { description: 'Project not found' },
        }
      }
    },
    '/api/projects/{id}/workers': {
      get: {
        summary: 'Get workers assigned to a project',
        tags: ['Projects'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'List of workers' } }
      }
    },
    '/api/tasks': {
      get: {
        summary: 'Get all tasks',
        tags: ['Tasks'],
        responses: { 200: { description: 'List of tasks' } }
      },
      post: {
        summary: 'Create a task',
        tags: ['Tasks'],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  title: { type: 'string', example: 'Vymena rozvodov' },
                  project_id: { type: 'string' },
                  priority: { type: 'string', example: 'high' },
                  deadline: { type: 'string', example: '2026-06-01' },
                }
              }
            }
          }
        },
        responses: { 201: { description: 'Created task' } }
      }
    },
    '/api/tasks/{id}': {
      get: {
        summary: 'Get task by ID',
        tags: ['Tasks'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Task object' },
          404: { description: 'Task not found' },
        }
      },
      patch: {
        summary: 'Update task status',
        tags: ['Tasks'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string', example: 'in_progress' },
                }
              }
            }
          }
        },
        responses: { 200: { description: 'Updated task' } }
      }
    },
    '/api/workers/{projectId}': {
      get: {
        summary: 'Get workers by project ID',
        tags: ['Workers'],
        parameters: [{ name: 'projectId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'List of workers' } }
      }
    },
  }
}

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`)
})