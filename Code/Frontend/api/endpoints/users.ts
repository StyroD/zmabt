import client from '../client'

export const getUsers = () => client.get('/users')
export const getUserById = (id: string) => client.get(`/users/${id}`)
