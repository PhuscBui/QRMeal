import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import chatApiRequest from '@/apiRequests/chat'
import { ListMessagesQueryParamsType, ListSessionsQueryParamsType } from '@/schemaValidations/chat.schema'

// Create new session
export const useCreateSessionMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: chatApiRequest.createSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat', 'session'] })
    }
  })
}

// Get or create guest session - manual trigger only
export const useMyChatSessionQuery = (enabled: boolean, manualTrigger: boolean = false, accountId?: string | null) => {
  return useQuery({
    queryKey: ['chat', 'session', 'guest', accountId],
    queryFn: chatApiRequest.getOrCreateGuestSession,
    select: (data) => data.payload.result,
    enabled: enabled && manualTrigger && !!accountId,
    staleTime: Infinity,
    gcTime: Infinity
  })
}

// Get or create customer session - manual trigger only
export const useMyCustomerChatSessionQuery = (
  enabled: boolean,
  manualTrigger: boolean = false,
  accountId?: string | null
) => {
  return useQuery({
    queryKey: ['chat', 'session', 'customer', accountId],
    queryFn: chatApiRequest.getOrCreateCustomerSession,
    select: (data) => data.payload.result,
    enabled: enabled && manualTrigger && !!accountId,
    staleTime: Infinity,
    gcTime: Infinity
  })
}

// List all sessions (for staff)
export const useListChatSessionsQuery = (params: ListSessionsQueryParamsType) => {
  const { limit = 20, page = 1 } = params
  return useQuery({
    queryKey: ['chat', 'sessions', { limit, page }],
    queryFn: () => chatApiRequest.listSessions({ limit, page }),
    select: (data) => data.payload.result
  })
}

// End session
export const useEndSessionMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: chatApiRequest.endSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat', 'sessions'] })
    }
  })
}

// Get messages for a session
export const useChatMessagesQuery = (sessionId: string | undefined, params: ListMessagesQueryParamsType) => {
  const paramsKey = params ? JSON.stringify(params) : ''
  return useQuery({
    queryKey: ['chat', 'messages', sessionId, paramsKey, params],
    queryFn: () => chatApiRequest.listMessages(sessionId!, params),
    select: (data) => data.payload.result,
    enabled: !!sessionId,
    refetchOnMount: false,
    refetchOnWindowFocus: false
  })
}

// Send message
export const useSendChatMessageMutation = (sessionId: string | undefined) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (message: string) => chatApiRequest.sendMessage(sessionId!, { message }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat', 'messages', sessionId] })
    }
  })
}
