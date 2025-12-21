import { Request, Response } from 'express'
import chatService from '~/services/chat.service'
import gptService from '~/services/gpt.service'
import { CHAT_MESSAGES } from '~/constants/messages'
import { TokenPayload } from '~/models/requests/Account.request'
import socketService from '~/utils/socket'
import { ManagerRoom } from '~/constants/type'

export const createChatSessionController = async (req: Request, res: Response) => {
  const decoded = req.decoded_authorization

  let accountId: string | undefined
  let accountType: 'guest' | 'customer' | 'anonymous' = 'anonymous'

  if (decoded) {
    accountId = decoded.account_id
    accountType = decoded.role === 'Customer' ? 'customer' : 'guest'
  }

  const session = await chatService.createSession(accountId, accountType)

  res.json({
    message: CHAT_MESSAGES.CREATE_SESSION_SUCCESS,
    result: session
  })
}

export const getOrCreateGuestSessionController = async (req: Request, res: Response) => {
  const { account_id } = req.decoded_authorization as TokenPayload
  const session = await chatService.getOrCreateSessionForGuest(account_id)

  res.json({
    message: CHAT_MESSAGES.GET_SESSION_SUCCESS,
    result: session
  })
}

export const getOrCreateCustomerSessionController = async (req: Request, res: Response) => {
  const { account_id } = req.decoded_authorization as TokenPayload
  const session = await chatService.getOrCreateSessionForCustomer(account_id)

  res.json({
    message: CHAT_MESSAGES.GET_SESSION_SUCCESS,
    result: session
  })
}

export const getOrCreateAnonymousSessionController = async (req: Request, res: Response) => {
  const { anonymousId } = req.body

  if (!anonymousId) {
    res.status(400).json({
      message: 'Anonymous ID is required'
    })
    return
  }

  const session = await chatService.getOrCreateAnonymousSession(anonymousId)

  res.json({
    message: CHAT_MESSAGES.GET_SESSION_SUCCESS,
    result: session
  })
}

export const listChatSessionsController = async (req: Request, res: Response) => {
  const limit = Number(req.query.limit) || 20
  const page = Number(req.query.page) || 1

  const result = await chatService.listSessions(limit, page)

  res.json({
    message: CHAT_MESSAGES.LIST_SESSIONS_SUCCESS,
    result
  })
}

export const endChatSessionController = async (req: Request, res: Response) => {
  const { sessionId } = req.params
  await chatService.endSession(sessionId)

  res.json({
    message: CHAT_MESSAGES.END_SESSION_SUCCESS
  })
}

export const listChatMessagesController = async (req: Request, res: Response) => {
  const { sessionId } = req.params
  const limit = Number(req.query.limit) || 100
  const before = req.query.before as string | undefined

  console.log('List messages request:', { sessionId, limit, before })
  const messages = await chatService.listMessages(sessionId, limit, before)
  console.log('List messages result:', { sessionId, messageCount: messages.length })

  res.json({
    message: CHAT_MESSAGES.LIST_MESSAGES_SUCCESS,
    result: messages
  })
}

export const addChatMessageController = async (req: Request, res: Response) => {
  const { sessionId } = req.params
  const { message, sender = 'user' } = req.body

  console.log('Chat Controller - Received message:', { sessionId, message, sender })

  const result = await chatService.addMessageWithGPT(sessionId, sender, message)

  console.log('Chat Controller - Result:', {
    userMessage: result.userMessage._id,
    botMessage: result.botMessage?._id
  })

  // Broadcast to managers via socket (for customers who send via HTTP API)
  try {
    // Serialize message object to ensure ObjectId and Date are properly converted
    const serializeMessage = (msg: any) => ({
      _id: msg._id?.toString(),
      session_id: msg.session_id?.toString(),
      sender_type: msg.sender_type,
      message: msg.message,
      created_at: msg.created_at instanceof Date ? msg.created_at.toISOString() : msg.created_at
    })

    const userMessageSerialized = serializeMessage(result.userMessage)
    console.log('Broadcasting user message to ManagerRoom:', {
      sessionId: userMessageSerialized.session_id,
      messageId: userMessageSerialized._id,
      sender: userMessageSerialized.sender_type,
      roomSize: socketService.getRoomSize(ManagerRoom)
    })
    socketService.emitToRoom(ManagerRoom, 'chat:new-message', userMessageSerialized)

    // Nếu có phản hồi từ bot, cũng broadcast
    if (result.botMessage) {
      const botMessageSerialized = serializeMessage(result.botMessage)
      console.log('Broadcasting bot message to ManagerRoom:', {
        sessionId: botMessageSerialized.session_id,
        messageId: botMessageSerialized._id,
        sender: botMessageSerialized.sender_type
      })
      socketService.emitToRoom(ManagerRoom, 'chat:new-message', botMessageSerialized)
    }
  } catch (error) {
    console.error('Failed to broadcast message to managers:', error)
  }

  res.json({
    message: CHAT_MESSAGES.SEND_MESSAGE_SUCCESS,
    result: result.userMessage,
    ...(result.botMessage && { botMessage: result.botMessage })
  })
}

// Debug endpoint để test GPT
export const testGPTController = async (req: Request, res: Response) => {
  console.log(req.body)
  const { message } = req.body

  console.log('GPT test request received:', message)

  if (!message) {
    res.status(400).json({
      message: 'Message is required'
    })
    return
  }

  try {
    const response = await gptService.generateResponse(message, 'test-session')
    res.json({
      message: 'GPT test successful',
      result: response
    })

    console.log('GPT test successful:', response)
  } catch (error: any) {
    console.error('GPT test error:', error)
    res.status(500).json({
      message: 'GPT test failed',
      error: error.message
    })
  }
}
