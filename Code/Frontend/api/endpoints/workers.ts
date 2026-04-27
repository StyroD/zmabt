import client from '../client'

export const getAllWorkers = (managerId?: string) =>
  client.get('/workers', { params: managerId ? { manager_id: managerId } : undefined })

export const getProjectWorkers = (projectId: string) =>
  client.get(`/workers/${projectId}`)