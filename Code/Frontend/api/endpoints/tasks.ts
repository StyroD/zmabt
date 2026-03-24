import client from "../client";

export const getTasks = () => client.get('/tasks')
export const getTasksByProjectId = (id: string) => client.get(`/tasks/${id}`)