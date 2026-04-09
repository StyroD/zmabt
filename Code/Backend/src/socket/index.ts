import { Server as HttpServer } from 'http'
import { Server as SocketServer } from 'socket.io'
import jwt from 'jsonwebtoken'

let io: SocketServer | null = null

export function initSocket(httpServer: HttpServer): SocketServer {
  io = new SocketServer(httpServer, {
    cors: { origin: '*' },
  })

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token
    if (!token) return next(new Error('No token'))

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string; role: string }
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

// Called by the REST route after saving to DB
export function emitNewMessage(receiverId: string, message: object) {
  io?.to(`user:${receiverId}`).emit('new_message', message)
}
