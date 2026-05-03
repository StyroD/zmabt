
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
//export const BASE_URL = 'http://10.0.2.2:3000/api';  // Android emulator
 //export const BASE_URL = 'http://localhost:3000/api'// iOS simulator
export const BASE_URL = 'http://10.112.94.65:3000/api'; // Physical device

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

import { router } from 'expo-router'

let isLoggingOut = false 

client.interceptors.response.use(
  res => res,
  async err => {
    if (err.response?.status === 401 && !isLoggingOut) {
      isLoggingOut = true

      try {
        await SecureStore.deleteItemAsync('token')
        await SecureStore.deleteItemAsync('userId')
      } catch {}

      router.replace('/auth/login')
    }

    return Promise.reject(err)
  }
)
export default client;
