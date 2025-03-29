import { Server as ServerHttp } from 'http'
import { ObjectId } from 'mongodb'
import { Server, Socket } from 'socket.io'
import { envConfig } from '~/config'
import { ManagerRoom, Role } from '~/constants/type'
import databaseService from '~/services/databases.service'
import { verifyToken } from '~/utils/jwt'
import chalk from 'chalk'

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

  public async initialize(httpServer: ServerHttp, corsOrigin: string = envConfig.clientUrl): Promise<void> {
    console.log('🚀 Initializing WebSocket Server...') // Thêm log kiểm tra
    this.io = new Server(httpServer, {
      cors: {
        origin: corsOrigin
      }
    })

    // Authentication middleware
    this.io.use(async (socket: Socket, next) => {
      console.log(chalk.blue('Socket authentication middleware'))
      console.log(socket.handshake.auth)
      const { Authorization } = socket.handshake.auth
      console.log(chalk.yellow('Authorization:', Authorization))
      if (!Authorization) {
        return next(new Error('Authorization không hợp lệ'))
      }

      const accessToken = Authorization.split(' ')[1]
      console.log(chalk.blueBright('Access Token:', accessToken))

      try {
        const decodedAccessToken = await verifyToken({
          token: accessToken,
          secretOrPublicKey: envConfig.accessTokenSecret
        })
        const { account_id, role } = decodedAccessToken

        if (role === Role.Guest) {
          // Handle guest socket connection
          await databaseService.sockets.updateOne(
            { guest_id: new ObjectId(account_id) },
            {
              $set: {
                socketId: socket.id,
                updatedAt: new Date()
              }
            },
            { upsert: true }
          )
        } else {
          // Handle manager/owner socket connection
          await databaseService.sockets.updateOne(
            { account_id: new ObjectId(account_id) },
            {
              $set: {
                socketId: socket.id,
                updatedAt: new Date()
              }
            },
            { upsert: true }
          )

          // Add managers to the manager room
          socket.join(ManagerRoom)
        }

        // Attach decoded token to socket for future use
        socket.handshake.auth.decodedAccessToken = decodedAccessToken
      } catch (error: any) {
        return next(error)
      }

      next()
    })

    this.io.on('connection', async (socket: Socket) => {
      console.log(chalk.greenBright('🔌 Socket connected:', socket.id))

      socket.on('disconnect', async () => {
        console.log(chalk.redBright('🔌 Socket disconnected:', socket.id))

        // Remove socket from database
        try {
          await databaseService.sockets.deleteOne({ socketId: socket.id })
        } catch (error) {
          console.error('Error removing socket:', error)
        }
      })
    })
  }

  public getIO(): Server {
    if (!this.io) {
      throw new Error('Socket.IO has not been initialized. Call initialize() first.')
    }
    return this.io
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

  public emitToSocket(socketId: string, event: string, data: unknown): void {
    if (this.io) {
      this.io.to(socketId).emit(event, data)
    }
  }
}

const socketService = SocketService.getInstance()
export default socketService
