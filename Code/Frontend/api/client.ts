import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router'
import { disconnectSocket } from './socket'


//export const BASE_URL = 'http://10.0.2.2:3000/api';  // Android emulator
 //export const BASE_URL = 'http://localhost:3000/api'// iOS simulator
export const BASE_URL = 'http://10.30.15.65:3000/api' // Physical device

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
