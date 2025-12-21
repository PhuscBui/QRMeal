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
    staleTime: 0, // Always consider data stale to allow refetch
    gcTime: Infinity,
    refetchOnMount: true,
    refetchOnWindowFocus: true
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
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: Infinity,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    // Fetch immediately when enabled
    refetchOnReconnect: true
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
    staleTime: 30000, // Consider data fresh for 30 seconds
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    refetchOnMount: 'always', // Always refetch when component mounts
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    // Ensure query fetches immediately when enabled changes from false to true
    networkMode: 'online'
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
