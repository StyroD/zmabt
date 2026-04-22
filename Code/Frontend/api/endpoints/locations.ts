import client from '../client'

export const updateWorkerLocation = (data: {
  worker_id: string
  project_id: string
  lat: number
  lng: number
  is_online?: boolean
}) => client.post('/locations', data)

export const getProjectWorkerLocations = (projectId: string) =>
  client.get(`/locations/project/${projectId}`)
