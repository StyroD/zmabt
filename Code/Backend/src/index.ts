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
import uploadsRouter from './routes/uploads'

import dashboardRouter from './routes/dashboard'
import notificationsRouter from './routes/notifications'
import authMiddleware from './middleware/auth'
import locationsRouter from './routes/locations'



const app = express()
app.use(cors())
app.use(express.json())

app.use('/api/auth', authRouter)
app.use(authMiddleware)
app.use('/api/users', usersRouter)
app.use('/api/projects', projectsRouter)
app.use('/api/workers', workersRouter)
app.use('/api/tasks', tasksRouter)
app.use('/api/uploads', uploadsRouter)
app.use('/api/locations', locationsRouter)

app.use('/api/dashboard', dashboardRouter)
app.use('/api/notifications', notificationsRouter)

const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Workflow API',
    version: '1.0.0',
    description: 'API for the Workflow construction management app',
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      }
    }
  },
  security: [{ bearerAuth: [] }],
  tags: [
    { name: 'Auth', description: 'Authentication' },
    { name: 'Users', description: 'User management' },
    { name: 'Projects', description: 'Project management' },
    { name: 'Workers', description: 'Worker management' },
    { name: 'Tasks', description: 'Task management' },
    { name: 'Uploads', description: 'File uploads' },
    { name: 'Dashboard', description: 'Dashboard statistics' },
    { name: 'Notifications', description: 'User notifications' },
  ],
  paths: {
    // Auth
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

    // Users
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

    // Projects
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
                  manager_id: { type: 'string' },
                  title: { type: 'string', example: 'Bytovy dom Bratislava' },
                  description: { type: 'string' },
                  status: { type: 'string', example: 'pending' },
                  deadline: { type: 'string', example: '2026-08-01' },
                  address: { type: 'string' },
                  lat: { type: 'number' },
                  lng: { type: 'number' },
                  client_name: { type: 'string' },
                  client_phone: { type: 'string' },
                  client_email: { type: 'string' },
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
      },
      put: {
        summary: 'Update project',
        tags: ['Projects'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  description: { type: 'string' },
                  status: { type: 'string', example: 'in_progress' },
                  deadline: { type: 'string' },
                  address: { type: 'string' },
                  lat: { type: 'number' },
                  lng: { type: 'number' },
                  client_name: { type: 'string' },
                  client_phone: { type: 'string' },
                  client_email: { type: 'string' },
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Updated project' },
          404: { description: 'Project not found' },
        }
      },
      delete: {
        summary: 'Delete project',
        tags: ['Projects'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Project deleted' },
          404: { description: 'Project not found' },
        }
      }
    },
    '/api/projects/manager/{managerId}': {
      get: {
        summary: 'Get projects by manager ID',
        tags: ['Projects'],
        parameters: [{ name: 'managerId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'List of projects' } }
      }
    },
    '/api/projects/{id}/workers': {
      get: {
        summary: 'Get workers assigned to a project',
        tags: ['Projects'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'List of workers' } }
      },
      post: {
        summary: 'Assign worker to project',
        tags: ['Projects'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  worker_id: { type: 'string' },
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Worker assigned' },
          409: { description: 'Worker already assigned' },
        }
      }
    },
    '/api/projects/{id}/workers/{workerId}': {
      delete: {
        summary: 'Remove worker from project',
        tags: ['Projects'],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'workerId', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Worker removed' },
          404: { description: 'Worker not assigned to this project' },
        }
      }
    },

    // Workers
    '/api/workers': {
      get: {
        summary: 'Get all workers',
        tags: ['Workers'],
        responses: { 200: { description: 'List of all workers' } }
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

    // Tasks
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
                  project_id: { type: 'string' },
                  title: { type: 'string', example: 'Vymena rozvodov' },
                  description: { type: 'string' },
                  category_id: { type: 'string' },
                  priority: { type: 'string', example: 'high' },
                  status: { type: 'string', example: 'pending' },
                  deadline: { type: 'string', example: '2026-06-01' },
                  lat: { type: 'number' },
                  lng: { type: 'number' },
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
      put: {
        summary: 'Update task',
        tags: ['Tasks'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  description: { type: 'string' },
                  category_id: { type: 'string' },
                  priority: { type: 'string', example: 'high' },
                  status: { type: 'string', example: 'done' },
                  deadline: { type: 'string', example: '2026-06-01' },
                  lat: { type: 'number' },
                  lng: { type: 'number' },
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Updated task' },
          404: { description: 'Task not found' },
        }
      },
      delete: {
        summary: 'Delete task',
        tags: ['Tasks'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Task deleted' },
          404: { description: 'Task not found' },
        }
      }
    },
    '/api/tasks/{id}/status': {
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
                  status: { type: 'string', example: 'done' },
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Status updated' },
          400: { description: 'Invalid status' },
          404: { description: 'Task not found' },
        }
      }
    },
    '/api/tasks/project/{id}': {
      get: {
        summary: 'Get tasks by project ID',
        tags: ['Tasks'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'List of tasks' } }
      }
    },
    '/api/tasks/worker/{workerId}': {
      get: {
        summary: 'Get tasks by worker ID',
        tags: ['Tasks'],
        parameters: [{ name: 'workerId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'List of tasks assigned to worker' } }
      }
    },

    // Dashboard
    '/api/dashboard/manager/{id}': {
      get: {
        summary: 'Get manager dashboard stats',
        tags: ['Dashboard'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: {
            description: 'Dashboard statistics',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    projects_count: { type: 'integer' },
                    pending_tasks: { type: 'integer' },
                    in_progress_tasks: { type: 'integer' },
                    completed_tasks: { type: 'integer' },
                    workers_count: { type: 'integer' },
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/dashboard/worker/{id}': {
      get: {
        summary: 'Get worker dashboard stats',
        tags: ['Dashboard'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: {
            description: 'Dashboard statistics',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    pending_tasks: { type: 'integer' },
                    in_progress_tasks: { type: 'integer' },
                    completed_tasks: { type: 'integer' },
                    completed_today: { type: 'integer' },
                    projects_count: { type: 'integer' },
                  }
                }
              }
            }
          }
        }
      }
    },

    // Notifications
    '/api/notifications/user/{userId}': {
      get: {
        summary: 'Get user notifications',
        tags: ['Notifications'],
        parameters: [{ name: 'userId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'List of notifications' } }
      }
    },
    '/api/notifications/{id}/read': {
      patch: {
        summary: 'Mark notification as read',
        tags: ['Notifications'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Notification marked as read' },
          404: { description: 'Notification not found' },
        }
      }
    },
    '/api/uploads/certificate': {
    post: {
      summary: 'Upload a certificate file',
      tags: ['Uploads'],
      requestBody: {
        content: {
          'multipart/form-data': {
            schema: {
              type: 'object',
              properties: {
                file: { type: 'string', format: 'binary' },
                worker_id: { type: 'string' },
                category_id: { type: 'string' },
                name: { type: 'string', example: 'Elektrikar - osvedcenie' },
              }
            }
          }
        }
      },
      responses: { 200: { description: 'Certificate uploaded' } }
    }
  },
  '/api/uploads/certificate/{id}': {
    get: {
      summary: 'Get certificate file by ID',
      tags: ['Uploads'],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: {
        200: { description: 'Returns binary file' },
        404: { description: 'File not found' },
      }
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