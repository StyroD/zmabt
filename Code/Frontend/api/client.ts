
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
//const BASE_URL = 'http://10.0.2.2:3000/api';  // Android emulator
const BASE_URL = 'http://localhost:3000/api'; // iOS simulator only
//const BASE_URL = 'http://10.10.14.238:3000/api'; // both simulators / physical device
//const BASE_URL = 'http://172.20.10.8:3000/api'; // physical device - iPhone wifi


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

export default client;
