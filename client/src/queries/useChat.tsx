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
export const useMyChatSessionQuery = (enabled: boolean, manualTrigger: boolean = false) => {
  return useQuery({
    queryKey: ['chat', 'session', 'guest'],
    queryFn: chatApiRequest.getOrCreateGuestSession,
    select: (data) => data.payload.result,
    enabled: enabled && manualTrigger, // Only fetch when explicitly triggered
    staleTime: Infinity, // Don't refetch automatically
    gcTime: Infinity // Keep in cache
  })
}

// Get or create customer session - manual trigger only
export const useMyCustomerChatSessionQuery = (enabled: boolean, manualTrigger: boolean = false) => {
  return useQuery({
    queryKey: ['chat', 'session', 'customer'],
    queryFn: chatApiRequest.getOrCreateCustomerSession,
    select: (data) => data.payload.result,
    enabled: enabled && manualTrigger, // Only fetch when explicitly triggered
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
  return useQuery({
    queryKey: ['chat', 'messages', sessionId, params],
    queryFn: () => chatApiRequest.listMessages(sessionId!, params),
    select: (data) => data.payload.result,
    enabled: !!sessionId
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
