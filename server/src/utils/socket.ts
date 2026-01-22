import { Server as ServerHttp } from 'http'
import { ObjectId } from 'mongodb'
import { Server, Socket } from 'socket.io'
import { envConfig } from '~/config'
import { ManagerRoom, Role } from '~/constants/type'
import databaseService from '~/services/databases.service'
import { verifyToken } from '~/utils/jwt'
import chalk from 'chalk'
import chatService from '~/services/chat.service'

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
    console.log('🚀 Initializing WebSocket Server...')
    this.io = new Server(httpServer, {
      cors: {
        origin: corsOrigin
      }
    })

    // Authentication middleware - now optional for anonymous users
    this.io.use(async (socket: Socket, next) => {
      const { Authorization } = socket.handshake.auth

      // Allow connection without authorization for anonymous users
      if (!Authorization) {
        console.log(chalk.yellowBright('🔌 Anonymous socket connecting:', socket.id))
        // Mark as anonymous
        socket.handshake.auth.isAnonymous = true
        return next()
      }

      const accessToken = Authorization.split(' ')[1]

      try {
        const decodedAccessToken = await verifyToken({
          token: accessToken,
          secretOrPublicKey: envConfig.accessTokenSecret
        })
        const { account_id, role } = decodedAccessToken

        if (role === Role.Guest) {
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
        } else if (role === Role.Customer) {
          await databaseService.sockets.updateOne(
            { customer_id: new ObjectId(account_id) },
            {
              $set: {
                socketId: socket.id,
                updatedAt: new Date()
              }
            },
            { upsert: true }
          )
        } else {
          // Handle manager/owner/employee socket connection
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

        socket.handshake.auth.decodedAccessToken = decodedAccessToken
        socket.handshake.auth.isAnonymous = false
      } catch (error) {
        console.log(chalk.redBright('❌ Socket auth error:', error))
        // Allow connection even if token is invalid (treat as anonymous)
        socket.handshake.auth.isAnonymous = true
      }

      next()
    })

    this.io.on('connection', async (socket: Socket) => {
      const isAnonymous = socket.handshake.auth.isAnonymous
      console.log(chalk.greenBright(`🔌 Socket connected: ${socket.id} ${isAnonymous ? '(Anonymous)' : ''}`))

      // Handle chat send events
      socket.on(
        'chat:send',
        async (payload: { sessionId: string; message: string; sender?: 'user' | 'staff'; anonymousId?: string }) => {
          try {
            const senderType = payload.sender || 'user'
            
            // Sử dụng addMessageWithGPT để tự động tạo bot response nếu cần
            const result = await chatService.addMessageWithGPT(payload.sessionId, senderType, payload.message)

            // Find the session
            const session = await databaseService.chatSessions.findOne({
              _id: new ObjectId(payload.sessionId)
            })

            if (!session) {
              socket.emit('chat:error', { message: 'Session not found' })
              return
            }

            // ALWAYS broadcast to manager room for ALL message types
            this.getIO().to(ManagerRoom).emit('chat:new-message', result.userMessage)

            // Nếu có bot message, cũng broadcast đến manager room
            if (result.botMessage) {
              this.getIO().to(ManagerRoom).emit('chat:new-message', result.botMessage)
            }

            // Route message to specific participants
            if (session.guest_id) {
              const guestSocket = await databaseService.sockets.findOne({
                guest_id: session.guest_id
              })
              if (guestSocket && guestSocket.socketId !== socket.id) {
                this.getIO().to(guestSocket.socketId).emit('chat:new-message', result.userMessage)
                if (result.botMessage) {
                  this.getIO().to(guestSocket.socketId).emit('chat:new-message', result.botMessage)
                }
              }
            } else if (session.customer_id) {
              const customerSocket = await databaseService.sockets.findOne({
                customer_id: session.customer_id
              })
              if (customerSocket && customerSocket.socketId !== socket.id) {
                this.getIO().to(customerSocket.socketId).emit('chat:new-message', result.userMessage)
                if (result.botMessage) {
                  this.getIO().to(customerSocket.socketId).emit('chat:new-message', result.botMessage)
                }
              }
            }
            // For anonymous sessions, managers will get notification via broadcast above

            // Echo back to sender
            socket.emit('chat:new-message', result.userMessage)
            if (result.botMessage) {
              socket.emit('chat:new-message', result.botMessage)
            }
          } catch (error) {
            socket.emit('chat:error', { message: (error as Error).message })
          }
        }
      )

      // Handle typing indicators
      socket.on('chat:typing', async (payload: { sessionId: string; isTyping: boolean }) => {
        try {
          const session = await databaseService.chatSessions.findOne({
            _id: new ObjectId(payload.sessionId)
          })
          if (!session) return

          // Broadcast typing status to managers
          this.getIO()
            .to(ManagerRoom)
            .emit('chat:typing', {
              sessionId: payload.sessionId,
              isTyping: payload.isTyping,
              sender: socket.handshake.auth.decodedAccessToken?.role || 'user'
            })

          // Route to specific participants
          if (session.guest_id) {
            const guestSocket = await databaseService.sockets.findOne({
              guest_id: session.guest_id
            })
            if (guestSocket && guestSocket.socketId !== socket.id) {
              this.getIO().to(guestSocket.socketId).emit('chat:typing', {
                sessionId: payload.sessionId,
                isTyping: payload.isTyping
              })
            }
          } else if (session.customer_id) {
            const customerSocket = await databaseService.sockets.findOne({
              customer_id: session.customer_id
            })
            if (customerSocket && customerSocket.socketId !== socket.id) {
              this.getIO().to(customerSocket.socketId).emit('chat:typing', {
                sessionId: payload.sessionId,
                isTyping: payload.isTyping
              })
            }
          }
        } catch (error) {
          console.error('Error handling typing indicator:', error)
        }
      })

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
    if (!this.io) {
      console.error('Socket.IO not initialized, cannot emit to room:', room)
      return
    }
    
    const roomSize = this.io.sockets.adapter.rooms.get(room)?.size || 0
    console.log(`Emitting ${event} to room ${room}, room size: ${roomSize}`)
    
    this.io.to(room).emit(event, data)
  }

  public getRoomSize(room: string): number {
    if (!this.io) return 0
    return this.io.sockets.adapter.rooms.get(room)?.size || 0
  }

  public emitToSocket(socketId: string, event: string, data: unknown): void {
    if (this.io) {
      this.io.to(socketId).emit(event, data)
    }
  }
}

const socketService = SocketService.getInstance()
export default socketService
