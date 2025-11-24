import { Router } from 'express'
import {
  addChatMessageController,
  createChatSessionController,
  endChatSessionController,
  getOrCreateGuestSessionController,
  getOrCreateCustomerSessionController,
  getOrCreateAnonymousSessionController,
  listChatMessagesController,
  listChatSessionsController,
  testGPTController
} from '~/controllers/chat.controller'
import { accessTokenValidator, optionalAccessTokenValidator } from '~/middlewares/auth.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const chatRouter = Router()

// Staff list sessions (requires auth)
chatRouter.get('/sessions', accessTokenValidator, wrapRequestHandler(listChatSessionsController))

// Create session - optional auth (allows anonymous users)
chatRouter.post('/sessions', optionalAccessTokenValidator, wrapRequestHandler(createChatSessionController))

// Guest get or create current session (requires auth)
chatRouter.get('/sessions/me', accessTokenValidator, wrapRequestHandler(getOrCreateGuestSessionController))

// Customer get or create current session (requires auth)
chatRouter.get('/sessions/me/customer', accessTokenValidator, wrapRequestHandler(getOrCreateCustomerSessionController))

// Anonymous get or create session (no auth required)
chatRouter.post('/sessions/anonymous', wrapRequestHandler(getOrCreateAnonymousSessionController))

// End session (requires auth)
chatRouter.post('/sessions/:sessionId/end', accessTokenValidator, wrapRequestHandler(endChatSessionController))

// Messages - optional auth (allows anonymous users to read/send if they have sessionId)
chatRouter.get(
  '/sessions/:sessionId/messages',
  optionalAccessTokenValidator,
  wrapRequestHandler(listChatMessagesController)
)
chatRouter.post(
  '/sessions/:sessionId/messages',
  optionalAccessTokenValidator,
  wrapRequestHandler(addChatMessageController)
)

// Debug endpoint để test GPT
chatRouter.post('/test-gpt', wrapRequestHandler(testGPTController))

export default chatRouter
