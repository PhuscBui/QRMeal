import { ObjectId, WithId } from 'mongodb'
import databaseService from './databases.service'
import ChatSession from '~/models/schemas/ChatSession.schema'
import ChatMessage from '~/models/schemas/ChatMessage.schema'
import gptService from './gpt.service'

class ChatService {
  async createSession(accountId?: string, accountType: 'guest' | 'customer' | 'anonymous' = 'guest') {
    interface SessionData {
      start_time: Date
      guest_id?: ObjectId
      customer_id?: ObjectId
      anonymous_id?: string
    }

    const sessionData: SessionData = {
      start_time: new Date()
    }

    if (accountType === 'guest' && accountId) {
      sessionData.guest_id = new ObjectId(accountId)
    } else if (accountType === 'customer' && accountId) {
      sessionData.customer_id = new ObjectId(accountId)
    } else if (accountType === 'anonymous') {
      sessionData.anonymous_id = accountId || `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }

    const session: ChatSession = new ChatSession(sessionData)
    const result = await databaseService.chatSessions.insertOne(session)
    return { _id: result.insertedId, ...session }
  }

  async endSession(sessionId: string) {
    await databaseService.chatSessions.updateOne({ _id: new ObjectId(sessionId) }, { $set: { end_time: new Date() } })
  }

  async listSessions(limit = 20, page = 1) {
    const skip = (page - 1) * limit

    // Aggregate to join with accounts collection
    const pipeline = [
      {
        $sort: { start_time: -1 }
      },
      {
        $skip: skip
      },
      {
        $limit: limit
      },
      {
        $lookup: {
          from: 'guests',
          localField: 'guest_id',
          foreignField: '_id',
          as: 'guest_info'
        }
      },
      {
        $lookup: {
          from: 'accounts',
          localField: 'customer_id',
          foreignField: '_id',
          as: 'customer_info'
        }
      },
      {
        $addFields: {
          user_info: {
            $cond: {
              if: { $gt: [{ $size: '$guest_info' }, 0] },
              then: { $arrayElemAt: ['$guest_info', 0] },
              else: {
                $cond: {
                  if: { $gt: [{ $size: '$customer_info' }, 0] },
                  then: { $arrayElemAt: ['$customer_info', 0] },
                  else: null
                }
              }
            }
          }
        }
      },
      {
        $project: {
          _id: 1,
          start_time: 1,
          end_time: 1,
          guest_id: 1,
          customer_id: 1,
          anonymous_id: 1,
          'user_info.name': 1,
          'user_info.email': 1,
          'user_info.phone': 1
        }
      }
    ]

    const data = await databaseService.chatSessions.aggregate(pipeline).toArray()
    const total = await databaseService.chatSessions.countDocuments()

    return { data, total, page, limit }
  }

  async getOrCreateSessionForGuest(guestId: string) {
    // Always look for active session first
    let session = await databaseService.chatSessions.findOne({
      guest_id: new ObjectId(guestId),
      end_time: { $exists: false }
    })

    if (!session) {
      const created = await this.createSession(guestId, 'guest')
      session = created as WithId<ChatSession>
    }

    return session as WithId<ChatSession>
  }

  async getOrCreateSessionForCustomer(customerId: string) {
    // Always look for active session first
    let session = await databaseService.chatSessions.findOne({
      customer_id: new ObjectId(customerId),
      end_time: { $exists: false }
    })

    if (!session) {
      const created = await this.createSession(customerId, 'customer')
      session = created as WithId<ChatSession>
    }

    return session as WithId<ChatSession>
  }

  async getOrCreateAnonymousSession(anonymousId: string) {
    // Check for existing active session with this anonymous ID
    let session = await databaseService.chatSessions.findOne({
      anonymous_id: anonymousId,
      end_time: { $exists: false }
    })

    if (!session) {
      const created = await this.createSession(anonymousId, 'anonymous')
      session = created as WithId<ChatSession>
    }

    return session as WithId<ChatSession>
  }

  async listMessages(sessionId: string, limit = 100, before?: string) {
    const filter: Record<string, unknown> = { session_id: new ObjectId(sessionId) }
    if (before) filter._id = { $lt: new ObjectId(before) }
    const cursor = databaseService.chatMessages.find(filter).sort({ _id: -1 }).limit(limit)
    const reversed = (await cursor.toArray()).reverse()
    return reversed
  }

  async addMessage(sessionId: string, sender: 'user' | 'bot' | 'staff', message: string) {
    const existing = await databaseService.chatSessions.findOne({ _id: new ObjectId(sessionId) })
    if (!existing) throw new Error('Session not found')
    const doc: ChatMessage = new ChatMessage({
      session_id: new ObjectId(sessionId),
      sender_type: sender,
      message
    })
    const result = await databaseService.chatMessages.insertOne(doc)
    return { _id: result.insertedId, ...doc }
  }

  async addMessageWithGPT(sessionId: string, sender: 'user' | 'bot' | 'staff', message: string) {
    console.log('Chat Service - Adding message:', { sessionId, sender, message })
    
    // Lưu tin nhắn của user
    const userMessage = await this.addMessage(sessionId, sender, message)
    console.log('Chat Service - User message saved:', userMessage._id)
    
    // Kiểm tra xem có cần GPT xử lý không
    if (sender === 'user' && gptService.shouldUseGPT(message)) {
      console.log('Chat Service - GPT processing triggered for message:', message)
      try {
        // Tạo phản hồi từ GPT
        const gptResponse = await gptService.generateResponse(message, sessionId)
        console.log('Chat Service - GPT response received:', gptResponse.substring(0, 100) + '...')
        
        // Lưu phản hồi từ GPT
        const botMessage = await this.addMessage(sessionId, 'bot', gptResponse)
        console.log('Chat Service - Bot message saved:', botMessage._id)
        
        return {
          userMessage,
          botMessage
        }
      } catch (error) {
        console.error('GPT processing error:', error)
        // Nếu GPT lỗi, vẫn trả về tin nhắn của user
        return { userMessage }
      }
    } else {
      console.log('Chat Service - GPT processing not triggered')
    }
    
    return { userMessage }
  }

  async getSessionById(sessionId: string) {
    return await databaseService.chatSessions.findOne({ _id: new ObjectId(sessionId) })
  }
}

const chatService = new ChatService()
export default chatService
