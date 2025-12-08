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
import { useAccountMe } from '@/queries/useAccount'
import { useGuestMe } from '@/queries/useGuest'
import ChatSuggestions from './chat-suggestions'

interface ChatMessage {
  _id: string
  session_id: string
  sender_type: 'user' | 'staff' | 'bot'
  message: string
  created_at: string | Date
}

// localStorage keys - CHỈ cho anonymous user
const STORAGE_KEYS = {
  ANONYMOUS_ID: 'chat_anonymous_id',
  ANONYMOUS_SESSION_ID: 'chat_anonymous_session_id',
  ANONYMOUS_MESSAGES: 'chat_anonymous_messages',
  LAST_CLEANUP: 'chat_last_cleanup'
}

const MAX_STORED_MESSAGES = 50
const CLEANUP_INTERVAL_DAYS = 7
const MESSAGE_EXPIRY_DAYS = 30
const POLLING_INTERVAL = 3000
const TYPING_TIMEOUT = 3000

// Helper functions for localStorage
const getFromStorage = (key: string) => {
  if (typeof window === 'undefined') return null
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

const setToStorage = (key: string, value: string) => {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, value)
  } catch (error) {
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      console.warn('Storage quota exceeded, cleaning up...')
      cleanupOldMessages()
      try {
        localStorage.setItem(key, value)
      } catch {
        console.error('Failed to save after cleanup')
      }
    }
  }
}

const removeFromStorage = (key: string) => {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.error('Failed to remove from localStorage:', error)
  }
}

// Anonymous user functions
const getAnonymousId = () => {
  let anonymousId = getFromStorage(STORAGE_KEYS.ANONYMOUS_ID)
  if (!anonymousId) {
    anonymousId = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    setToStorage(STORAGE_KEYS.ANONYMOUS_ID, anonymousId)
  }
  return anonymousId
}

const getAnonymousSessionId = () => getFromStorage(STORAGE_KEYS.ANONYMOUS_SESSION_ID)
const saveAnonymousSessionId = (sessionId: string) => setToStorage(STORAGE_KEYS.ANONYMOUS_SESSION_ID, sessionId)

const getAnonymousMessages = (): ChatMessage[] => {
  const stored = getFromStorage(STORAGE_KEYS.ANONYMOUS_MESSAGES)
  if (!stored) return []
  try {
    return JSON.parse(stored)
  } catch {
    return []
  }
}

const setAnonymousMessages = (messages: ChatMessage[]) => {
  const limitedMessages = messages.slice(-MAX_STORED_MESSAGES)
  setToStorage(STORAGE_KEYS.ANONYMOUS_MESSAGES, JSON.stringify(limitedMessages))
}

const clearAnonymousStorage = () => {
  removeFromStorage(STORAGE_KEYS.ANONYMOUS_ID)
  removeFromStorage(STORAGE_KEYS.ANONYMOUS_SESSION_ID)
  removeFromStorage(STORAGE_KEYS.ANONYMOUS_MESSAGES)
}

// Cleanup old messages
const cleanupOldMessages = () => {
  if (typeof window === 'undefined') return

  try {
    const lastCleanup = getFromStorage(STORAGE_KEYS.LAST_CLEANUP)
    const now = Date.now()

    if (lastCleanup && now - parseInt(lastCleanup) < CLEANUP_INTERVAL_DAYS * 24 * 60 * 60 * 1000) {
      return
    }

    const expiryTime = now - MESSAGE_EXPIRY_DAYS * 24 * 60 * 60 * 1000
    const stored = getFromStorage(STORAGE_KEYS.ANONYMOUS_MESSAGES)

    if (stored) {
      try {
        const messages: ChatMessage[] = JSON.parse(stored)
        const recentMessages = messages.filter((msg) => {
          const msgTime = new Date(msg.created_at).getTime()
          return msgTime > expiryTime
        })

        if (recentMessages.length === 0) {
          removeFromStorage(STORAGE_KEYS.ANONYMOUS_MESSAGES)
        } else if (recentMessages.length < messages.length) {
          setToStorage(STORAGE_KEYS.ANONYMOUS_MESSAGES, JSON.stringify(recentMessages))
        }
      } catch (error) {
        console.error('Failed to cleanup messages:', error)
      }
    }

    setToStorage(STORAGE_KEYS.LAST_CLEANUP, now.toString())
  } catch (error) {
    console.error('Failed to cleanup old messages:', error)
  }
}

export default function ChatWidget() {
  const { socket, isAuth, role } = useAppContext()
  const [open, setOpen] = useState(false)
  const [anonymousSessionId, setAnonymousSessionId] = useState<string | null>(null)
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isTyping, setIsTyping] = useState(false)
  const [isGPTTyping, setIsGPTTyping] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [shouldRender, setShouldRender] = useState(false)
  const [isCreatingSession, setIsCreatingSession] = useState(false)
  const [text, setText] = useState('')

  const { data: me } = useAccountMe(isAuth && role === 'Customer')
  const { data: guestMe } = useGuestMe(isAuth && role === 'Guest')

  const bottomRef = useRef<HTMLDivElement | null>(null)
  const messagesContainerRef = useRef<HTMLDivElement | null>(null)
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const gptTypingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isCreatingSessionRef = useRef(false)

  // CHỈ fetch session khi user đã đăng nhập VÀ có accountId
  const guestEnabled = isAuth && role === 'Guest' && !!guestMe?.payload.result._id
  const customerEnabled = isAuth && role === 'Customer' && !!me?.payload.result._id

  const { data: guestSession, refetch: refetchGuestSession } = useMyChatSessionQuery(
    guestEnabled,
    true,
    guestMe?.payload.result._id || undefined
  )
  const { data: customerSession, refetch: refetchCustomerSession } = useMyCustomerChatSessionQuery(
    customerEnabled,
    true,
    me?.payload.result._id || undefined
  )

  const activeSession = role === 'Customer' ? customerSession : role === 'Guest' ? guestSession : null
  const sessionId = activeSession?._id || anonymousSessionId || undefined

  const messagesParams = React.useMemo(() => ({ limit: 50 }), [])

  // CHỈ fetch messages từ server khi có sessionId
  const { data: serverMessages, refetch } = useChatMessagesQuery(sessionId, messagesParams)
  const { mutate: sendMessage } = useSendChatMessageMutation(sessionId)

  // Cleanup khi mount
  useEffect(() => {
    cleanupOldMessages()
  }, [])

  // Load anonymous messages từ localStorage khi chưa đăng nhập
  useEffect(() => {
    if (!isAuth) {
      const storedSessionId = getAnonymousSessionId()
      const storedMessages = getAnonymousMessages()

      if (storedSessionId) {
        setAnonymousSessionId(storedSessionId)
      }
      if (storedMessages.length > 0) {
        setLocalMessages(storedMessages)
      }
    }
  }, [isAuth])

  // Clear anonymous storage khi user đăng nhập
  useEffect(() => {
    if (isAuth && anonymousSessionId) {
      clearAnonymousStorage()
      setAnonymousSessionId(null)
      setLocalMessages([])
    }
  }, [isAuth, anonymousSessionId])

  // Lưu anonymous messages vào localStorage
  useEffect(() => {
    if (!isAuth && localMessages.length > 0) {
      setAnonymousMessages(localMessages)
    }
  }, [localMessages, isAuth])

  // Check if should render
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

  // Load existing anonymous messages from server khi có sessionId
  useEffect(() => {
    const loadExistingMessages = async () => {
      if (!isAuth && anonymousSessionId && localMessages.length === 0) {
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
  }, [anonymousSessionId, isAuth, localMessages.length])

  // Auto scroll to bottom
  useEffect(() => {
    if (!isLoadingMore) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [localMessages, serverMessages, isLoadingMore])

  // Socket listeners cho authenticated users
  useEffect(() => {
    if (!isAuth || !socket || !activeSession) return

    const onIncoming = (message: ChatMessage) => {
      if (message.session_id === activeSession._id) {
        refetch()
        if (!open) {
          setUnreadCount((prev) => prev + 1)
        }
        // Clear GPT typing nếu có bot message
        if (message.sender_type === 'bot') {
          setIsGPTTyping(false)
          if (gptTypingTimeoutRef.current) {
            clearTimeout(gptTypingTimeoutRef.current)
          }
        }
      }
    }

    const onTyping = ({ sessionId, isTyping: typing }: { sessionId: string; isTyping: boolean }) => {
      if (sessionId === activeSession._id) {
        setIsTyping(typing)
        if (typing) {
          if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current)
          }
          typingTimeoutRef.current = setTimeout(() => setIsTyping(false), TYPING_TIMEOUT)
        }
      }
    }

    socket.on('chat:new-message', onIncoming)
    socket.on('chat:typing', onTyping)

    return () => {
      socket.off('chat:new-message', onIncoming)
      socket.off('chat:typing', onTyping)
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [socket, activeSession, open, refetch, isAuth])

  // Polling cho anonymous users
  useEffect(() => {
    if (isAuth || !anonymousSessionId || !open) {
      // Clear polling nếu không cần
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
        pollingIntervalRef.current = null
      }
      return
    }

    const pollMessages = async () => {
      try {
        const response = await chatApiRequest.listMessages(anonymousSessionId, { limit: 50 })
        const newMessages = response.payload.result

        setLocalMessages((prev) => {
          // So sánh messages để tránh update không cần thiết
          if (JSON.stringify(prev.map((m) => m._id)) === JSON.stringify(newMessages.map((m: ChatMessage) => m._id))) {
            return prev
          }

          const newMsgCount = newMessages.filter(
            (nm: ChatMessage) =>
              !prev.some((pm) => pm._id === nm._id) && (nm.sender_type === 'staff' || nm.sender_type === 'bot')
          ).length

          if (newMsgCount > 0 && !open) {
            setUnreadCount((count) => count + newMsgCount)
          }

          // Check có bot message mới không
          const hasNewBotMessage = newMessages.some(
            (nm: ChatMessage) => !prev.some((pm) => pm._id === nm._id) && nm.sender_type === 'bot'
          )
          if (hasNewBotMessage) {
            setIsGPTTyping(false)
            if (gptTypingTimeoutRef.current) {
              clearTimeout(gptTypingTimeoutRef.current)
            }
          }

          return newMessages
        })
      } catch (error) {
        console.error('Failed to poll messages:', error)
      }
    }

    // Poll ngay lập tức
    pollMessages()

    // Set interval
    pollingIntervalRef.current = setInterval(pollMessages, POLLING_INTERVAL)

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
        pollingIntervalRef.current = null
      }
    }
  }, [isAuth, anonymousSessionId, open])

  // Cleanup GPT typing timeout
  useEffect(() => {
    return () => {
      if (gptTypingTimeoutRef.current) {
        clearTimeout(gptTypingTimeoutRef.current)
      }
    }
  }, [])

  // Load more messages
  const loadMoreMessages = useCallback(() => {
    // THÊM KIỂM TRA NGHIÊM NGẶT
    if (!sessionId || typeof sessionId !== 'string' || !/^[a-f\d]{24}$/i.test(sessionId)) {
      console.warn('Invalid sessionId for loadMoreMessages:', sessionId)
      return
    }

    if (isLoadingMore || !hasMore) return

    const currentMessages = isAuth ? serverMessages : localMessages
    if (!currentMessages || currentMessages.length === 0) return

    const oldestMessageId = currentMessages[0]._id

    // Kiểm tra cả oldestMessageId
    if (!oldestMessageId || !/^[a-f\d]{24}$/i.test(oldestMessageId)) {
      return
    }

    const container = messagesContainerRef.current
    const scrollHeightBefore = container?.scrollHeight || 0

    setIsLoadingMore(true)

    chatApiRequest
      .listMessages(sessionId, { limit: 50, before: oldestMessageId })
      .then((response) => {
        const newMessages = response.payload.result || []

        if (newMessages.length < 50) {
          setHasMore(false)
        }

        if (newMessages.length > 0) {
          if (isAuth) {
            void refetch()
          } else {
            setLocalMessages((prev) => {
              const merged = [...newMessages, ...prev]
              const unique = Array.from(new Map(merged.map((m) => [m._id, m])).values())
              return unique
            })
          }

          setTimeout(() => {
            if (container) {
              const diff = container.scrollHeight - scrollHeightBefore
              container.scrollTop += diff
            }
          }, 100)
        }
      })
      .catch((error) => {
        console.error('Load more failed:', error)
        // Có thể là do sessionId không hợp lệ → có thể cần tạo lại session
      })
      .finally(() => {
        setIsLoadingMore(false)
      })
  }, [sessionId, isLoadingMore, hasMore, isAuth, serverMessages, localMessages, refetch])

  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current
    if (!container) return

    if (container.scrollTop === 0 && !isLoadingMore) {
      loadMoreMessages()
    }
  }, [loadMoreMessages, isLoadingMore])

  // Ensure session exists với mutex pattern
  const ensureSession = async () => {
    // Nếu đã có session, return ngay
    if (isAuth && activeSession?._id) {
      return activeSession._id
    }

    if (anonymousSessionId && !isAuth) {
      return anonymousSessionId
    }

    // Kiểm tra mutex
    if (isCreatingSessionRef.current) {
      // Đợi session được tạo xong
      let attempts = 0
      while (isCreatingSessionRef.current && attempts < 50) {
        await new Promise((resolve) => setTimeout(resolve, 100))
        attempts++
      }

      // Kiểm tra lại sau khi đợi
      if (isAuth && activeSession?._id) {
        return activeSession._id
      }
      if (anonymousSessionId && !isAuth) {
        return anonymousSessionId
      }
    }

    // Set mutex
    isCreatingSessionRef.current = true
    setIsCreatingSession(true)

    try {
      if (isAuth && !activeSession) {
        const refetchFn = role === 'Customer' ? refetchCustomerSession : refetchGuestSession
        const result = await refetchFn()

        if (result.data?._id) {
          return result.data._id
        }

        throw new Error('Failed to create authenticated session')
      }

      if (!isAuth) {
        const anonymousId = getAnonymousId()
        const response = await chatApiRequest.createAnonymousSession({ anonymousId })
        if (response.payload.result._id) {
          setAnonymousSessionId(response.payload.result._id)
          saveAnonymousSessionId(response.payload.result._id)
          return response.payload.result._id
        }
        throw new Error('Failed to create anonymous session')
      }
    } catch (error) {
      console.error('Failed to create session:', error)
      throw error
    } finally {
      isCreatingSessionRef.current = false
      setIsCreatingSession(false)
    }

    return null
  }

  // Send message
  const handleSend = async () => {
    const content = text.trim()
    if (!content || isSending || isCreatingSessionRef.current) return

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
        // Authenticated user - use socket or mutation
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
        // Anonymous user
        const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        const tempMessage: ChatMessage = {
          _id: tempId,
          session_id: currentSessionId,
          sender_type: 'user',
          message: content,
          created_at: new Date().toISOString()
        }

        setLocalMessages((prev) => [...prev, tempMessage])

        // Check if should trigger GPT
        const shouldTriggerGPT =
          content.toLowerCase().includes('món') ||
          content.toLowerCase().includes('thực đơn') ||
          content.toLowerCase().includes('menu') ||
          content.toLowerCase().includes('giá') ||
          content.toLowerCase().includes('đặt bàn') ||
          content.toLowerCase().includes('đặt món') ||
          content.toLowerCase().includes('có gì') ||
          content.toLowerCase().includes('ăn gì') ||
          content.toLowerCase().includes('nên ăn') ||
          content.toLowerCase().includes('khuyến nghị') ||
          content.toLowerCase().includes('tư vấn') ||
          content.toLowerCase().includes('giờ mở') ||
          content.toLowerCase().includes('địa chỉ') ||
          content.toLowerCase().includes('số điện thoại') ||
          content.toLowerCase().includes('thông tin')

        if (shouldTriggerGPT) {
          setIsGPTTyping(true)
          if (gptTypingTimeoutRef.current) {
            clearTimeout(gptTypingTimeoutRef.current)
          }
          gptTypingTimeoutRef.current = setTimeout(() => {
            setIsGPTTyping(false)
          }, 15000) // Max 15s
        }

        try {
          const response = await chatApiRequest.sendMessage(currentSessionId, {
            message: content,
            sender: 'user'
          })

          // Replace temp message with real message
          setLocalMessages((prev) => prev.map((m) => (m._id === tempId ? response.payload.result : m)))
        } catch (error) {
          console.error('Failed to send message:', error)
          // Remove temp message on error
          setLocalMessages((prev) => prev.filter((m) => m._id !== tempId))
          setText(content) // Restore text
        }
      }
    } catch (error) {
      console.error('Error in handleSend:', error)
      setText(content) // Restore text
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

  // Hiển thị messages: authenticated users dùng serverMessages, anonymous dùng localMessages
  const displayMessages = isAuth ? serverMessages : localMessages

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
                        : m.sender_type === 'bot'
                        ? 'bg-gradient-to-r from-green-500 to-green-600 text-white rounded-bl-sm'
                        : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-sm border border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    {m.sender_type === 'bot' && (
                      <div className='flex items-center gap-1 mb-1'>
                        <div className='w-2 h-2 bg-green-300 rounded-full animate-pulse'></div>
                        <span className='text-xs text-green-100 font-medium'>AI Assistant</span>
                      </div>
                    )}
                    <div className='text-sm break-words whitespace-pre-wrap'>{m.message}</div>
                    <div
                      className={`text-xs mt-1 ${
                        m.sender_type === 'user'
                          ? 'text-blue-100'
                          : m.sender_type === 'bot'
                          ? 'text-green-100'
                          : 'text-gray-500 dark:text-gray-400'
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
                <div className='mt-3 p-3 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg border border-green-200 dark:border-green-700'>
                  <div className='flex items-center gap-2 mb-2'>
                    <div className='w-2 h-2 bg-green-500 rounded-full animate-pulse'></div>
                    <span className='text-xs font-medium text-green-700 dark:text-green-300'>AI Assistant</span>
                  </div>
                  <p className='text-xs text-green-600 dark:text-green-400'>
                    🤖 Tôi có thể giúp bạn tìm hiểu thực đơn, đặt bàn, tư vấn món ăn và trả lời các câu hỏi về nhà hàng!
                  </p>
                </div>

                <ChatSuggestions onSuggestionClick={setText} />

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

            {isGPTTyping && (
              <div className='flex justify-start animate-in fade-in slide-in-from-bottom-2 duration-300'>
                <div className='bg-gradient-to-r from-green-500 to-green-600 px-4 py-3 rounded-lg rounded-bl-sm shadow-sm'>
                  <div className='flex items-center gap-2'>
                    <div className='w-2 h-2 bg-green-300 rounded-full animate-pulse'></div>
                    <span className='text-xs text-green-100 font-medium'>AI Assistant</span>
                    <div className='flex space-x-1.5 ml-2'>
                      <div className='w-2 h-2 bg-green-300 rounded-full animate-bounce'></div>
                      <div
                        className='w-2 h-2 bg-green-300 rounded-full animate-bounce'
                        style={{ animationDelay: '0.1s' }}
                      ></div>
                      <div
                        className='w-2 h-2 bg-green-300 rounded-full animate-bounce'
                        style={{ animationDelay: '0.2s' }}
                      ></div>
                    </div>
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
