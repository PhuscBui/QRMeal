import { Server as ServerHttp } from 'http'
import { ObjectId } from 'mongodb'
import { Server, Socket } from 'socket.io'
import { envConfig } from '~/config'
import databaseService from '~/services/databases.service'

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

    // Store socket connections for guests
    socket.on('register-guest', async (guest_id: string) => {
      if (guest_id) {
        try {
          await databaseService.sockets.findOneAndUpdate(
            { guest_id: new ObjectId(guest_id) },
            { $set: { socketId: socket.id, updated_at: new Date() } },
            { upsert: true }
          )

          // Join manager room if needed
          // socket.join(ManagerRoom);  // Uncomment if needed

          console.log(`Socket ${socket.id} registered for guest ${guest_id}`)
        } catch (error) {
          console.error('Error registering socket:', error)
        }
      }
    })

    socket.on('disconnect', async () => {
      console.log('Client disconnected:', socket.id)

      // Remove socket from database
      try {
        await databaseService.sockets.deleteOne({ socketId: socket.id })
      } catch (error) {
        console.error('Error removing socket:', error)
      }
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

const socketService = SocketService.getInstance()
export default socketService
