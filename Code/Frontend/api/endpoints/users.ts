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

export const updateProfileWithAvatar = async (
    id: string,
    data: Record<string, any>,
    avatarUri: string,
) => {
    const form = new FormData()

    Object.entries(data).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
            form.append(key, String(value))
        }
    })

    const filename = avatarUri.split('/').pop() ?? 'avatar.jpg'
    const ext = filename.split('.').pop()?.toLowerCase()
    const mime = ext === 'png' ? 'image/png' : 'image/jpeg'

    form.append('avatar', { uri: avatarUri, name: filename, type: mime } as any)

    const res = await client.put(`/users/${id}`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data
}

export const getAvatarUrl = (userId: string): string => {
    const base = (client.defaults.baseURL ?? '').replace(/\/$/, '')
    return `${base}/users/${userId}/avatar?t=${Date.now()}`
}
