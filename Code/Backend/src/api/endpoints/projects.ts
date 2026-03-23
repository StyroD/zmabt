import client from "../client";

export const getProjects = () => client.get('/projects')
export const getProjectById = (id: string) => client.get(`/projects/${id}`)