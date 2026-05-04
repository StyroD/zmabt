import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router'
import { disconnectSocket } from './socket'
import { BASE_URL } from './config'

export { BASE_URL } from './config'

const client = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Attach JWT token to every request automatically
client.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let isLoggingOut = false

client.interceptors.response.use(
  res => res,
  async err => {
    if (err.response?.status === 401 && !isLoggingOut) {
      isLoggingOut = true

      disconnectSocket()
      try {
        await SecureStore.deleteItemAsync('token')
        await SecureStore.deleteItemAsync('userId')
      } catch {}

      router.replace('/auth/login')
      isLoggingOut = false
    }

    return Promise.reject(err)
  }
)
export default client;
