import { io, Socket } from 'socket.io-client'
import * as SecureStore from 'expo-secure-store'
import NetInfo from '@react-native-community/netinfo'
import { BASE_URL } from './config'

const SOCKET_URL = BASE_URL.replace('/api', '')

let socket: Socket | null = null

export async function getSocket(): Promise<Socket> {
  if (socket?.connected) return socket

  const state = await NetInfo.fetch()
  const isOnline = !!state.isConnected && state.isInternetReachable !== false
  if (!isOnline) throw new Error('offline')

  const token = await SecureStore.getItemAsync('token')

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket'],
    reconnection: false,
  })

  socket.on('connect_error', (err) => {
    if (socket?.connected === false) {
      console.log('[Socket] unavailable:', err.message)
    }
  })

  return socket
}

export function disconnectSocket() {
  socket?.disconnect()
  socket = null
}