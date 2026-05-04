import { io, Socket } from 'socket.io-client'
import * as SecureStore from 'expo-secure-store'
import { BASE_URL } from './config'

const SOCKET_URL = BASE_URL.replace('/api', '')

let socket: Socket | null = null

export async function getSocket(): Promise<Socket> {
  if (socket) return socket

  const token = await SecureStore.getItemAsync('token')

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket'],
  })

  socket.on('connect_error', (err) => {
    console.error('[Socket] connect_error:', err.message)
  })

  return socket
}

export function disconnectSocket() {
  socket?.disconnect()
  socket = null
}
