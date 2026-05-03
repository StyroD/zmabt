import { io, Socket } from 'socket.io-client'
import * as SecureStore from 'expo-secure-store'

const SOCKET_URL = 'http://10.112.94.65:3000'

let socket: Socket | null = null

export async function getSocket(): Promise<Socket> {
  if (socket?.connected) return socket

  const token = await SecureStore.getItemAsync('token')

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket'],
    autoConnect: true,
  })

  return socket
}

export function disconnectSocket() {
  socket?.disconnect()
  socket = null
}
