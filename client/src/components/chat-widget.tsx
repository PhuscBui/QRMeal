'use client'
import React, { useEffect, useRef, useState, useCallback } from 'react'
import { useAppContext } from '@/components/app-provider'
import {
  useMyChatSessionQuery,
  useMyCustomerChatSessionQuery,
  useSendChatMessageMutation,
  useChatMessagesQuery
} from '@/queries/useChat'
import chatApiRequest from '@/apiRequests/chat'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MessageCircle, X, Send, Loader2 } from 'lucide-react'

interface ChatMessage {
  _id: string
  session_id: string
  sender_type: 'user' | 'staff' | 'bot'
  message: string
  created_at: string | Date
}

let anonymousIdMemory: string | null = null

const getAnonymousId = () => {
  if (anonymousIdMemory) return anonymousIdMemory
  anonymousIdMemory = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  return anonymousIdMemory
}

export default function ChatWidget() {
  const { socket, isAuth, role } = useAppContext()
  const [open, setOpen] = useState(false)
  const [anonymousSessionId, setAnonymousSessionId] = useState<string | null>(null)
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isTyping, setIsTyping] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [shouldRender, setShouldRender] = useState(false)
  const [isCreatingSession, setIsCreatingSession] = useState(false)
  const [shouldFetchSession, setShouldFetchSession] = useState(false)
  const [hasInitialized, setHasInitialized] = useState(false)

  const { data: guestSession, refetch: refetchGuestSession } = useMyChatSessionQuery(
    isAuth && role === 'Guest',
    shouldFetchSession
  )
  const { data: customerSession, refetch: refetchCustomerSession } = useMyCustomerChatSessionQuery(
    isAuth && role === 'Customer',
    shouldFetchSession
  )

  const activeSession = role === 'Customer' ? customerSession : role === 'Guest' ? guestSession : null
  const sessionId = activeSession?._id || anonymousSessionId || undefined

  const { data: messages, refetch } = useChatMessagesQuery(sessionId, { limit: 50 })
  const { mutate: sendMessage } = useSendChatMessageMutation(sessionId)

  const [text, setText] = useState('')
  const bottomRef = useRef<HTMLDivElement | null>(null)
  const messagesContainerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isManagePage = window.location.pathname.startsWith('/manage')
      if (isManagePage) {
        setShouldRender(false)
        return
      }
    }

    if (!isAuth) {
      setShouldRender(true)
    } else if (role) {
      setShouldRender(role === 'Customer' || role === 'Guest')
    }
  }, [isAuth, role])

  useEffect(() => {
    const initializeSession = async () => {
      if (hasInitialized || !shouldRender) return

      if (isAuth && role && (role === 'Customer' || role === 'Guest')) {
        setShouldFetchSession(true)
        const refetchFn = role === 'Customer' ? refetchCustomerSession : refetchGuestSession
        await refetchFn()
        setHasInitialized(true)
      } else if (!isAuth) {
        setHasInitialized(true)
      }
    }

    initializeSession()
  }, [isAuth, role, shouldRender, hasInitialized, refetchCustomerSession, refetchGuestSession])

  useEffect(() => {
    const loadExistingMessages = async () => {
      if (anonymousSessionId && localMessages.length === 0) {
        try {
          const response = await chatApiRequest.listMessages(anonymousSessionId, { limit: 50 })
          if (response.payload.result.length > 0) {
            setLocalMessages(response.payload.result)
          }
        } catch (error) {
          console.error('Failed to load messages:', error)
        }
      }
    }
    loadExistingMessages()
  }, [anonymousSessionId, localMessages.length])

  useEffect(() => {
    if (activeSession && messages && messages.length > 0) {
      return
    }

    if (activeSession && (!messages || messages.length === 0)) {
      refetch()
    }
  }, [activeSession, messages, refetch])

  useEffect(() => {
    if (!isLoadingMore) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, localMessages, isLoadingMore])

  useEffect(() => {
    if (!isAuth || !socket || !activeSession) return

    const onIncoming = (message: ChatMessage) => {
      if (message.session_id === activeSession._id) {
        refetch()
        if (!open) {
          setUnreadCount((prev) => prev + 1)
        }
      }
    }

    const onTyping = ({ sessionId, isTyping: typing }: { sessionId: string; isTyping: boolean }) => {
      if (sessionId === activeSession._id) {
        setIsTyping(typing)
        if (typing) {
          setTimeout(() => setIsTyping(false), 3000)
        }
      }
    }

    socket.on('chat:new-message', onIncoming)
    socket.on('chat:typing', onTyping)

    return () => {
      socket.off('chat:new-message', onIncoming)
      socket.off('chat:typing', onTyping)
    }
  }, [socket, activeSession, open, refetch, isAuth])

  useEffect(() => {
    if (isAuth || !anonymousSessionId || !open) return

    const pollMessages = async () => {
      try {
        const response = await chatApiRequest.listMessages(anonymousSessionId, { limit: 50 })
        const newMessages = response.payload.result

        setLocalMessages((prev) => {
          if (JSON.stringify(prev) !== JSON.stringify(newMessages)) {
            const newMsgCount = newMessages.filter(
              (nm: ChatMessage) => !prev.some((pm) => pm._id === nm._id) && nm.sender_type === 'staff'
            ).length

            if (newMsgCount > 0 && !open) {
              setUnreadCount((count) => count + newMsgCount)
            }

            return newMessages
          }
          return prev
        })
      } catch (error) {
        console.error('Failed to poll messages:', error)
      }
    }

    const interval = setInterval(pollMessages, 3000)
    pollMessages()

    return () => clearInterval(interval)
  }, [isAuth, anonymousSessionId, open])

  const loadMoreMessages = useCallback(async () => {
    if (!sessionId || !messages || messages.length === 0 || isLoadingMore || !hasMore) return

    setIsLoadingMore(true)
    const oldestMessageId = messages[0]._id

    try {
      const response = await chatApiRequest.listMessages(sessionId, { limit: 50, before: oldestMessageId })
      const newMessages = response.payload.result

      if (!newMessages || newMessages.length === 0 || newMessages.length < 50) {
        setHasMore(false)
      }

      await refetch()
    } catch (error) {
      console.error('Error loading more messages:', error)
    } finally {
      setIsLoadingMore(false)
    }
  }, [sessionId, messages, isLoadingMore, hasMore, refetch])

  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current
    if (!container) return

    if (container.scrollTop === 0 && !isLoadingMore) {
      loadMoreMessages()
    }
  }, [loadMoreMessages, isLoadingMore])

  const ensureSession = async () => {
    if (isAuth && activeSession) {
      return activeSession._id
    }

    if (isAuth && !activeSession && !isCreatingSession) {
      setIsCreatingSession(true)
      try {
        setShouldFetchSession(true)

        const refetchFn = role === 'Customer' ? refetchCustomerSession : refetchGuestSession
        const result = await refetchFn()

        if (result.data?._id) {
          return result.data._id
        }

        throw new Error('Failed to create session')
      } catch (error) {
        console.error('Failed to create session:', error)
        throw error
      } finally {
        setIsCreatingSession(false)
      }
    }

    if (!anonymousSessionId && !isCreatingSession) {
      setIsCreatingSession(true)
      try {
        const anonymousId = getAnonymousId()
        const response = await chatApiRequest.createAnonymousSession({ anonymousId })
        if (response.payload.result._id) {
          setAnonymousSessionId(response.payload.result._id)
          return response.payload.result._id
        }
      } catch (error) {
        console.error('Failed to create anonymous session:', error)
        throw error
      } finally {
        setIsCreatingSession(false)
      }
    }

    return anonymousSessionId
  }

  const handleSend = async () => {
    const content = text.trim()
    if (!content || isSending || isCreatingSession) return

    setIsSending(true)
    setText('')

    try {
      const currentSessionId = await ensureSession()

      if (!currentSessionId) {
        console.error('Failed to get session ID')
        setText(content)
        return
      }

      if (isAuth && activeSession) {
        if (socket) {
          socket.emit('chat:send', {
            sessionId: activeSession._id,
            message: content,
            sender: 'user'
          })
        } else {
          sendMessage(content)
        }
      } else {
        const tempMessage: ChatMessage = {
          _id: `temp_${Date.now()}`,
          session_id: currentSessionId,
          sender_type: 'user',
          message: content,
          created_at: new Date().toISOString()
        }

        setLocalMessages((prev) => [...prev, tempMessage])

        try {
          const response = await chatApiRequest.sendMessage(currentSessionId, {
            message: content,
            sender: 'user'
          })

          setLocalMessages((prev) => prev.map((m) => (m._id === tempMessage._id ? response.payload.result : m)))
        } catch (error) {
          console.error('Failed to send message:', error)
          setLocalMessages((prev) => prev.filter((m) => m._id !== tempMessage._id))
          setText(content)
        }
      }
    } catch (error) {
      console.error('Error in handleSend:', error)
      setText(content)
    } finally {
      setIsSending(false)
    }
  }

  const handleTyping = (typing: boolean) => {
    if (socket && sessionId && isAuth) {
      socket.emit('chat:typing', { sessionId, isTyping: typing })
    }
  }

  const toggle = () => {
    const willOpen = !open
    setOpen(willOpen)
    if (willOpen) {
      setUnreadCount(0)
    }
  }

  if (!shouldRender) {
    return null
  }

  const displayMessages = isAuth && activeSession ? messages : localMessages

  return (
    <div className='fixed bottom-4 right-4 z-50'>
      {!open && (
        <div className='relative'>
          <Button
            onClick={toggle}
            className='rounded-full h-14 w-14 bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-transform hover:scale-110'
            size='icon'
          >
            <MessageCircle className='h-6 w-6' />
          </Button>
          {unreadCount > 0 && (
            <div className='absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold animate-pulse'>
              {unreadCount > 9 ? '9+' : unreadCount}
            </div>
          )}
        </div>
      )}

      {open && (
        <div className='w-80 h-[500px] bg-white dark:bg-neutral-900 rounded-lg shadow-2xl flex flex-col border border-gray-200 dark:border-gray-700 animate-in slide-in-from-bottom-5 duration-300'>
          <div className='p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20'>
            <div className='flex items-center gap-2'>
              <div className='relative'>
                <MessageCircle className='h-5 w-5 text-blue-600' />
                <div className='absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 bg-green-500 rounded-full border-2 border-white dark:border-neutral-900'></div>
              </div>
              <div>
                <div className='font-semibold text-gray-900 dark:text-white text-sm'>Hỗ trợ khách hàng</div>
                <div className='text-xs text-gray-500 dark:text-gray-400'>{isAuth ? 'Đang online' : 'Chat nhanh'}</div>
              </div>
            </div>
            <Button
              variant='ghost'
              size='icon'
              onClick={toggle}
              className='h-8 w-8 hover:bg-red-100 dark:hover:bg-red-900/20'
            >
              <X className='h-4 w-4' />
            </Button>
          </div>

          <div
            ref={messagesContainerRef}
            onScroll={handleScroll}
            className='flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-neutral-950'
          >
            {isLoadingMore && (
              <div className='flex justify-center py-2'>
                <Loader2 className='h-5 w-5 animate-spin text-blue-600' />
              </div>
            )}

            {displayMessages && displayMessages.length > 0 ? (
              displayMessages.map((m: ChatMessage) => (
                <div
                  key={m._id}
                  className={`flex ${
                    m.sender_type === 'user' ? 'justify-end' : 'justify-start'
                  } animate-in fade-in slide-in-from-bottom-2 duration-300`}
                >
                  <div
                    className={`max-w-[85%] px-3 py-2 rounded-lg shadow-sm ${
                      m.sender_type === 'user'
                        ? 'bg-blue-600 text-white rounded-br-sm'
                        : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-sm border border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <div className='text-sm break-words'>{m.message}</div>
                    <div
                      className={`text-xs mt-1 ${
                        m.sender_type === 'user' ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      {new Date(m.created_at || Date.now()).toLocaleTimeString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className='text-center text-gray-500 dark:text-gray-400 text-sm py-12'>
                <div className='bg-white dark:bg-gray-800 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-sm'>
                  <MessageCircle className='h-8 w-8 text-blue-600 opacity-50' />
                </div>
                <p className='font-medium'>Chào mừng bạn đến với QRMeal!</p>
                <p className='text-xs mt-1'>Chúng tôi sẵn sàng hỗ trợ bạn 24/7</p>
                {!isAuth && (
                  <p className='text-xs mt-3 text-blue-600 dark:text-blue-400'>
                    💡 Bạn có thể chat ngay mà không cần đăng nhập
                  </p>
                )}
              </div>
            )}

            {isTyping && (
              <div className='flex justify-start animate-in fade-in slide-in-from-bottom-2 duration-300'>
                <div className='bg-white dark:bg-gray-800 px-4 py-3 rounded-lg rounded-bl-sm border border-gray-200 dark:border-gray-700 shadow-sm'>
                  <div className='flex space-x-1.5'>
                    <div className='w-2 h-2 bg-gray-400 rounded-full animate-bounce'></div>
                    <div
                      className='w-2 h-2 bg-gray-400 rounded-full animate-bounce'
                      style={{ animationDelay: '0.1s' }}
                    ></div>
                    <div
                      className='w-2 h-2 bg-gray-400 rounded-full animate-bounce'
                      style={{ animationDelay: '0.2s' }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className='p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50'>
            <div className='flex gap-2'>
              <Input
                value={text}
                onChange={(e) => {
                  setText(e.target.value)
                  handleTyping(e.target.value.length > 0)
                }}
                onBlur={() => handleTyping(false)}
                placeholder='Nhập tin nhắn...'
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleTyping(false)
                    handleSend()
                  }
                }}
                className='flex-1'
                disabled={isSending || isCreatingSession}
              />
              <Button
                onClick={handleSend}
                disabled={!text.trim() || isSending || isCreatingSession}
                className='bg-blue-600 hover:bg-blue-700 disabled:opacity-50'
                size='icon'
              >
                {isSending || isCreatingSession ? (
                  <Loader2 className='h-4 w-4 animate-spin' />
                ) : (
                  <Send className='h-4 w-4' />
                )}
              </Button>
            </div>
            {!isAuth && (
              <p className='text-xs text-gray-500 dark:text-gray-400 mt-2 text-center'>
                <a href='/login' className='text-blue-600 hover:underline font-medium'>
                  Đăng nhập
                </a>{' '}
                để có trải nghiệm chat tốt hơn
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
