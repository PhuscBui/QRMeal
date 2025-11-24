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

  const messages = await chatService.listMessages(sessionId, limit, before)

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

  // Broadcast to managers via socket (for anonymous users who don't have socket connection)
  try {
    socketService.emitToRoom(ManagerRoom, 'chat:new-message', result.userMessage)

    // Nếu có phản hồi từ bot, cũng broadcast
    if (result.botMessage) {
      socketService.emitToRoom(ManagerRoom, 'chat:new-message', result.botMessage)
    }
  } catch (error) {
    console.error('Failed to broadcast message to managers:', error)
  }

  res.json({
    message: CHAT_MESSAGES.SEND_MESSAGE_SUCCESS,
    result: result.userMessage
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
