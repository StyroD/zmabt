import client from '../client'

export const getAllWorkers = () => client.get('/workers')

export const getProjectWorkers = (projectId: string) =>
  client.get(`/workers/${projectId}`)