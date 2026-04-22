import client from '../client'

export const getUsers = () => client.get('/users')
export const updatePushToken = (userId: string, token: string) =>
  client.patch(`/users/${userId}/push-token`, { token })
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

export const updateProfileWithAvatar = async (userId: string, data: Record<string, any>, avatarUri?: string) => {
  const formData = new FormData()
  Object.entries(data).forEach(([key, val]) => {
    if (val !== undefined && val !== null) formData.append(key, String(val))
  })
  if (avatarUri) {
    formData.append('avatar', { uri: avatarUri, name: 'avatar.jpg', type: 'image/jpeg' } as any)
  }
  const response = await client.put(`/users/${userId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data
}
