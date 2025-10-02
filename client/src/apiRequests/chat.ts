import http from '@/lib/http'
import {
  CreateSessionResType,
  GetSessionResType,
  ListSessionsResType,
  ListMessagesResType,
  SendMessageBodyType,
  SendMessageResType,
  EndSessionResType,
  ListSessionsQueryParamsType,
  ListMessagesQueryParamsType,
  CreateAnonymousSessionBodyType
} from '@/schemaValidations/chat.schema'
import queryString from 'query-string'

const prefix = '/chat'

const chatApiRequest = {
  // Create new session (for staff or anonymous users)
  createSession: () => http.post<CreateSessionResType>(`${prefix}/sessions`, {}),

  // Create anonymous session
  createAnonymousSession: (body: CreateAnonymousSessionBodyType) =>
    http.post<GetSessionResType>(`${prefix}/sessions/anonymous`, body),

  // Get or create session for current guest
  getOrCreateGuestSession: () => http.get<GetSessionResType>(`${prefix}/sessions/me`),

  // Get or create session for current customer
  getOrCreateCustomerSession: () => http.get<GetSessionResType>(`${prefix}/sessions/me/customer`),

  // List all sessions (for staff/manager)
  listSessions: (params: ListSessionsQueryParamsType) =>
    http.get<ListSessionsResType>(`${prefix}/sessions?${queryString.stringify(params)}`),

  // End a session
  endSession: (sessionId: string) => http.post<EndSessionResType>(`${prefix}/sessions/${sessionId}/end`, {}),

  // Get messages for a session
  listMessages: (sessionId: string, params: ListMessagesQueryParamsType) =>
    http.get<ListMessagesResType>(`${prefix}/sessions/${sessionId}/messages?${queryString.stringify(params)}`),

  // Send a message
  sendMessage: (sessionId: string, body: SendMessageBodyType) =>
    http.post<SendMessageResType>(`${prefix}/sessions/${sessionId}/messages`, body)
}

export default chatApiRequest

export const {
  createSession,
  createAnonymousSession,
  getOrCreateGuestSession,
  getOrCreateCustomerSession,
  listSessions,
  endSession,
  listMessages,
  sendMessage
} = chatApiRequest
