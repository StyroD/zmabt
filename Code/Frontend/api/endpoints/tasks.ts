import client from "../client"

export const getTasks = () => client.get('/tasks')
export const getTasksByProjectId = (projectId: string) => client.get(`/tasks/project/${projectId}`)
export const getTasksByWorkerId = (workerId: string) => client.get(`/tasks/worker/${workerId}`)

export const createTask = (data: {
  project_id: string
  title: string
  description?: string
  category_id?: string
  priority?: string
  status?: string
  deadline?: string
  lat?: number
  lng?: number
}) => client.post('/tasks', data)

export const updateTask = (id: string, data: {
  title?: string
  description?: string
  category_id?: string
  priority?: string
  status?: string
  deadline?: string
  lat?: number
  lng?: number
}) => client.put(`/tasks/${id}`, data)

export const updateTaskStatus = (id: string, status: 'pending' | 'in_progress' | 'done') => 
  client.patch(`/tasks/${id}/status`, { status })

export const deleteTask = (id: string) => client.delete(`/tasks/${id}`)