import client from "../client"

export const getProjects = () => client.get('/projects')
export const getProjectById = (id: string) => client.get(`/projects/${id}`)
export const getProjectByManagerId = (managerId: string) => client.get(`/projects/manager/${managerId}`)

export const createProject = (data: {
  manager_id: string
  title: string
  description?: string
  status?: string
  deadline?: string
  address?: string
  lat?: number
  lng?: number
  client_name?: string
  client_phone?: string
  client_email?: string
}) => client.post('/projects', data)

export const updateProject = (id: string, data: {
  title?: string
  description?: string
  status?: string
  deadline?: string
  address?: string
  lat?: number
  lng?: number
  client_name?: string
  client_phone?: string
  client_email?: string
}) => client.put(`/projects/${id}`, data)

export const deleteProject = (id: string) => client.delete(`/projects/${id}`)

export const assignWorkerToProject = (projectId: string, workerId: string) => 
  client.post(`/projects/${projectId}/workers`, { worker_id: workerId })

export const removeWorkerFromProject = (projectId: string, workerId: string) => 
  client.delete(`/projects/${projectId}/workers/${workerId}`)