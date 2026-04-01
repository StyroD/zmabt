import client from "../client"

export const getManagerDashboard = (managerId: string) => 
  client.get(`/dashboard/manager/${managerId}`)

export const getWorkerDashboard = (workerId: string) => 
  client.get(`/dashboard/worker/${workerId}`)