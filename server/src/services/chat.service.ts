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
    // Find all active sessions for this customer
    const customerObjectId = new ObjectId(customerId)
    
    // Query for active sessions (no end_time)
    let activeSessions = await databaseService.chatSessions
      .find({
        customer_id: customerObjectId,
        $or: [
          { end_time: { $exists: false } },
          { end_time: null }
        ]
      })
      .sort({ start_time: -1 }) // Get most recent first
      .toArray()

    console.log('getOrCreateSessionForCustomer - Active sessions:', activeSessions.length, 'for customer:', customerId)
    
    // Debug: Log all sessions for this customer to see what's in DB
    if (activeSessions.length === 0) {
      const allSessionsForCustomer = await databaseService.chatSessions
        .find({
          customer_id: customerObjectId
        })
        .toArray()
      console.log('getOrCreateSessionForCustomer - All sessions (including ended):', allSessionsForCustomer.length)
      if (allSessionsForCustomer.length > 0) {
        console.log('getOrCreateSessionForCustomer - Sample sessions:', allSessionsForCustomer.slice(0, 3).map(s => ({
          _id: s._id?.toString(),
          customer_id: s.customer_id?.toString(),
          end_time: s.end_time,
          start_time: s.start_time
        })))
      }
    }

    // If there are multiple active sessions, find the one with the most recent message
    let session: WithId<ChatSession> | null = null
    
    if (activeSessions.length === 0) {
      // No active session, create new one
      console.log('Creating new session for customer:', customerId)
      const created = await this.createSession(customerId, 'customer')
      session = created as WithId<ChatSession>
      console.log('Created new session:', session._id?.toString())
    } else if (activeSessions.length === 1) {
      // Only one active session, use it
      session = activeSessions[0] as WithId<ChatSession>
      console.log('Using single active session:', session._id?.toString())
    } else {
      // Multiple active sessions, find the one with the most recent message
      console.log('Multiple active sessions found, finding one with most recent message')
      let sessionWithMostRecentMessage: WithId<ChatSession> | null = null
      let mostRecentMessageTime: Date | null = null

      for (const s of activeSessions) {
        const latestMessage = await databaseService.chatMessages
          .findOne(
            { session_id: s._id },
            { sort: { created_at: -1 } }
          )

        if (latestMessage && latestMessage.created_at) {
          const messageTime = latestMessage.created_at instanceof Date 
            ? latestMessage.created_at 
            : new Date(latestMessage.created_at)
          
          if (!mostRecentMessageTime || messageTime > mostRecentMessageTime) {
            mostRecentMessageTime = messageTime
            sessionWithMostRecentMessage = s as WithId<ChatSession>
          }
        }
      }

      // If no session has messages, use the most recent session by start_time
      if (!sessionWithMostRecentMessage) {
        session = activeSessions.sort((a, b) => 
          (b.start_time?.getTime() || 0) - (a.start_time?.getTime() || 0)
        )[0] as WithId<ChatSession>
        console.log('No messages found, using most recent session by start_time:', session._id?.toString())
      } else {
        session = sessionWithMostRecentMessage
        console.log('Using session with most recent message:', session._id?.toString())
      }
    }

    // Check message count for debugging
    if (session) {
      const messageCount = await databaseService.chatMessages.countDocuments({
        session_id: session._id
      })
      console.log('Session message count:', messageCount, 'for session:', session._id?.toString())
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
    try {
      const filter: Record<string, unknown> = { session_id: new ObjectId(sessionId) }
      if (before) filter._id = { $lt: new ObjectId(before) }
      
      console.log('List messages filter:', JSON.stringify(filter))
      
      // First check if session exists
      const session = await databaseService.chatSessions.findOne({ _id: new ObjectId(sessionId) })
      console.log('Session exists:', !!session, 'Session ID:', sessionId)
      
      const cursor = databaseService.chatMessages.find(filter).sort({ _id: -1 }).limit(limit)
      const messages = await cursor.toArray()
      console.log('Found messages:', messages.length, 'for session:', sessionId)
      
      const reversed = messages.reverse()
      return reversed
    } catch (error) {
      console.error('Error listing messages:', error)
      throw error
    }
  }

  async addMessage(sessionId: string, sender: 'user' | 'bot' | 'staff', message: string) {
    console.log('addMessage called:', { sessionId, sender, messageLength: message.length })
    const existing = await databaseService.chatSessions.findOne({ _id: new ObjectId(sessionId) })
    if (!existing) {
      console.error('Session not found:', sessionId)
      throw new Error('Session not found')
    }
    console.log('Session found:', existing._id?.toString(), 'customer_id:', existing.customer_id?.toString())
    const doc: ChatMessage = new ChatMessage({
      session_id: new ObjectId(sessionId),
      sender_type: sender,
      message
    })
    const result = await databaseService.chatMessages.insertOne(doc)
    console.log('Message inserted:', result.insertedId.toString(), 'for session:', sessionId)
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
