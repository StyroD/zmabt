import client from '../client'

export const getUsers = () => client.get('/users')
export const getUserById = (id: string) => client.get(`/users/${id}`)

export const getDashboard= async (userId: string) => {
  const response = await client.get(`/dashboard/${userId}`);
  return response.data;
};

export const getProfile = async (userId: string) => {
  const response = await client.get(`/users/${userId}`);
  return response.data;
};

export const updateProfile = async (userId: string, data: object) => {
  const response = await client.put(`/users/${userId}`, data);
  return response.data;
};
