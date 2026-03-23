import client from '../client'

export const getProjectWorkers = (projectId: string) =>
  client.get(`/workers/${projectId}`)