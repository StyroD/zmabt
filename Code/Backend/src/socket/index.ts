import { Server as HttpServer } from 'http'
import { Server as SocketServer } from 'socket.io'
import jwt from 'jsonwebtoken'

let io: SocketServer | null = null

export function initSocket(httpServer: HttpServer): SocketServer {
  io = new SocketServer(httpServer, {
    cors: { origin: '*' },
  })

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token

    if (!token) return next(new Error('No token'))

    try {
      const decoded = jwt.verify(token as string, process.env.JWT_SECRET as string) as { id: string; role: string }
      socket.data.userId = decoded.id
      next()
    } catch {
      next(new Error('Invalid token'))
    }
  })

  io.on('connection', (socket) => {
    const userId: string = socket.data.userId
    socket.join(`user:${userId}`)
    socket.on('disconnect', () => {})
  })

  return io
}

export function emitNewMessage(receiverId: string, message: object) {
  io?.to(`user:${receiverId}`).emit('new_message', message)
}

export function emitNotification(userId: string, payload: object) {
  io?.to(`user:${userId}`).emit('notification', payload)
}

export function emitWorkerLocation(managerId: string, location: object) {
  io?.to(`user:${managerId}`).emit('worker_location_update', location)
}
