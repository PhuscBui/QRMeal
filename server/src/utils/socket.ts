// import { Server as ServerHttp } from 'http'
// import { Server } from 'socket.io'

// const initSocket = (httpServer: ServerHttp) => {
//   const io = new Server(httpServer, {
//     cors: {
//       origin: 'http://localhost:3000'
//     }
//   })

//   io.on('connection', (socket) => {
//     console.log(socket.id)
//   })
// }
// export default initSocket

// src/services/socket.service.ts
import { Server as ServerHttp } from 'http'
import { Server, Socket } from 'socket.io'
import { envConfig } from '~/config'

class SocketService {
  private static instance: SocketService
  private io: Server | null = null

  private constructor() {}

  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService()
    }
    return SocketService.instance
  }

  public initialize(httpServer: ServerHttp, corsOrigin: string = envConfig.clientUrl): void {
    this.io = new Server(httpServer, {
      cors: {
        origin: corsOrigin
      }
    })

    this.io.on('connection', this.handleConnection)
  }

  public getIO(): Server {
    if (!this.io) {
      throw new Error('Socket.IO has not been initialized. Call initialize() first.')
    }
    return this.io
  }

  private handleConnection(socket: Socket): void {
    console.log('Client connected:', socket.id)

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id)
    })
  }

  public emitToAll(event: string, data: unknown): void {
    if (this.io) {
      this.io.emit(event, data)
    }
  }

  public emitToRoom(room: string, event: string, data: unknown): void {
    if (this.io) {
      this.io.to(room).emit(event, data)
    }
  }
}

export default SocketService.getInstance()
