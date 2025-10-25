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

interface ChatMessage {
  _id: string
  session_id: string
  sender_type: 'user' | 'staff' | 'bot'
  message: string
  created_at: string | Date
}

// localStorage keys
const STORAGE_KEYS = {
  ANONYMOUS_ID: 'chat_anonymous_id',
  ANONYMOUS_SESSION_ID: 'chat_anonymous_session_id',
  ANONYMOUS_MESSAGES: 'chat_anonymous_messages',
  GUEST_SESSION_PREFIX: 'chat_guest_session_',
  GUEST_MESSAGES_PREFIX: 'chat_guest_messages_',
  CUSTOMER_SESSION_PREFIX: 'chat_customer_session_',
  CUSTOMER_MESSAGES_PREFIX: 'chat_customer_messages_',
  LAST_CLEANUP: 'chat_last_cleanup'
}

const MAX_STORED_MESSAGES = 50 // Limit to 50 most recent messages
const CLEANUP_INTERVAL_DAYS = 7 // Cleanup every 7 days
const MESSAGE_EXPIRY_DAYS = 30 // Messages older than 30 days are deleted

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
    // If quota exceeded, cleanup and retry
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      console.warn('Storage quota exceeded, cleaning up and retrying...')
      cleanupOldMessages()
      try {
        localStorage.setItem(key, value)
      } catch (retryError) {
        console.error('Failed to save even after cleanup:', retryError)
      }
    } else {
      console.error('Failed to save to localStorage:', error)
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

// Guest user functions
const getGuestSessionId = (guestId: string) => {
  return getFromStorage(`${STORAGE_KEYS.GUEST_SESSION_PREFIX}${guestId}`)
}

const setGuestSessionId = (guestId: string, sessionId: string) => {
  setToStorage(`${STORAGE_KEYS.GUEST_SESSION_PREFIX}${guestId}`, sessionId)
}

const getGuestMessages = (guestId: string): ChatMessage[] => {
  const stored = getFromStorage(`${STORAGE_KEYS.GUEST_MESSAGES_PREFIX}${guestId}`)
  if (!stored) return []
  try {
    return JSON.parse(stored)
  } catch {
    return []
  }
}

const setGuestMessages = (guestId: string, messages: ChatMessage[]) => {
  const limitedMessages = messages.slice(-MAX_STORED_MESSAGES)
  setToStorage(`${STORAGE_KEYS.GUEST_MESSAGES_PREFIX}${guestId}`, JSON.stringify(limitedMessages))
}

// Customer user functions
const getCustomerSessionId = (customerId: string) => {
  return getFromStorage(`${STORAGE_KEYS.CUSTOMER_SESSION_PREFIX}${customerId}`)
}

const setCustomerSessionId = (customerId: string, sessionId: string) => {
  setToStorage(`${STORAGE_KEYS.CUSTOMER_SESSION_PREFIX}${customerId}`, sessionId)
}

const getCustomerMessages = (customerId: string): ChatMessage[] => {
  const stored = getFromStorage(`${STORAGE_KEYS.CUSTOMER_MESSAGES_PREFIX}${customerId}`)
  if (!stored) return []
  try {
    return JSON.parse(stored)
  } catch {
    return []
  }
}

const setCustomerMessages = (customerId: string, messages: ChatMessage[]) => {
  const limitedMessages = messages.slice(-MAX_STORED_MESSAGES)
  setToStorage(`${STORAGE_KEYS.CUSTOMER_MESSAGES_PREFIX}${customerId}`, JSON.stringify(limitedMessages))
}

// Cleanup old messages and check localStorage size
const cleanupOldMessages = () => {
  if (typeof window === 'undefined') return

  try {
    const lastCleanup = getFromStorage(STORAGE_KEYS.LAST_CLEANUP)
    const now = Date.now()

    if (lastCleanup && now - parseInt(lastCleanup) < CLEANUP_INTERVAL_DAYS * 24 * 60 * 60 * 1000) {
      return
    }

    const expiryTime = now - MESSAGE_EXPIRY_DAYS * 24 * 60 * 60 * 1000

    const allKeys = Object.keys(localStorage)

    allKeys.forEach((key) => {
      if (
        key.startsWith(STORAGE_KEYS.GUEST_MESSAGES_PREFIX) ||
        key.startsWith(STORAGE_KEYS.CUSTOMER_MESSAGES_PREFIX) ||
        key === STORAGE_KEYS.ANONYMOUS_MESSAGES
      ) {
        try {
          const stored = localStorage.getItem(key)
          if (!stored) return

          const messages: ChatMessage[] = JSON.parse(stored)
          const recentMessages = messages.filter((msg) => {
            const msgTime = new Date(msg.created_at).getTime()
            return msgTime > expiryTime
          })

          if (recentMessages.length === 0) {
            localStorage.removeItem(key)
          } else if (recentMessages.length < messages.length) {
            localStorage.setItem(key, JSON.stringify(recentMessages))
          }
        } catch (error) {
          console.error('Failed to cleanup messages for key:', key, error)
        }
      }
    })

    setToStorage(STORAGE_KEYS.LAST_CLEANUP, now.toString())
  } catch (error) {
    console.error('Failed to cleanup old messages:', error)
  }
}

const checkStorageQuota = () => {
  if (typeof window === 'undefined') return true

  try {
    const testKey = '__storage_test__'
    localStorage.setItem(testKey, 'test')
    localStorage.removeItem(testKey)
    return true
  } catch (e) {
    console.error('localStorage quota exceeded:', e)
    console.warn('localStorage quota exceeded, cleaning up...')
    cleanupOldMessages()
    return false
  }
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
  const { data: me } = useAccountMe(isAuth && role === 'Customer')
  const { data: guestMe } = useGuestMe(isAuth && role === 'Guest')

  const { data: guestSession, refetch: refetchGuestSession } = useMyChatSessionQuery(
    isAuth && role === 'Guest',
    shouldFetchSession,
    guestMe?.payload.result._id || undefined
  )
  const { data: customerSession, refetch: refetchCustomerSession } = useMyCustomerChatSessionQuery(
    isAuth && role === 'Customer',
    shouldFetchSession,
    me?.payload.result._id || undefined
  )

  const activeSession = role === 'Customer' ? customerSession : role === 'Guest' ? guestSession : null
  const sessionId = activeSession?._id || anonymousSessionId || undefined

  const messagesParams = React.useMemo(() => ({ limit: 50 }), [])
  const { data: messages, refetch } = useChatMessagesQuery(sessionId, messagesParams)

  const { mutate: sendMessage } = useSendChatMessageMutation(sessionId)

  const [text, setText] = useState('')
  const [allMessages, setAllMessages] = useState<ChatMessage[]>([])
  const [isManuallyMerging, setIsManuallyMerging] = useState(false)
  const bottomRef = useRef<HTMLDivElement | null>(null)
  const messagesContainerRef = useRef<HTMLDivElement | null>(null)

  const getAccountId = useCallback(() => {
    if (!isAuth) return null
    if (role === 'Customer') {
      return me?.payload.result._id || null
    } else if (role === 'Guest') {
      return guestMe?.payload.result._id || null
    }
  }, [guestMe?.payload.result._id, isAuth, me?.payload.result._id, role])

  const accountId = getAccountId()

  useEffect(() => {
    cleanupOldMessages()
    checkStorageQuota()
  }, [])

  useEffect(() => {
    if (isManuallyMerging) return
    if (isAuth && messages && messages.length > 0) {
      setAllMessages(messages)
    }
  }, [isAuth, messages, isManuallyMerging])

  useEffect(() => {
    if (isManuallyMerging) return
    if (!isAuth && localMessages.length > 0) {
      setAllMessages(localMessages)
    }
  }, [isAuth, localMessages, isManuallyMerging])

  useEffect(() => {
    if (typeof window === 'undefined') return

    if (isAuth && accountId) {
      if (role === 'Guest') {
        const storedMessages = getGuestMessages(accountId)
        if (storedMessages.length > 0) {
          setAllMessages(storedMessages)
          setLocalMessages(storedMessages)
        }
      } else if (role === 'Customer') {
        const storedMessages = getCustomerMessages(accountId)
        if (storedMessages.length > 0) {
          setAllMessages(storedMessages)
          setLocalMessages(storedMessages)
        }
      }
    } else if (!isAuth) {
      const storedSessionId = getAnonymousSessionId()
      const storedMessages = getAnonymousMessages()

      if (storedSessionId) {
        setAnonymousSessionId(storedSessionId)
      }
      if (storedMessages.length > 0) {
        setAllMessages(storedMessages)
        setLocalMessages(storedMessages)
      }
    }
  }, [isAuth, role, accountId])

  useEffect(() => {
    if (isAuth && anonymousSessionId) {
      clearAnonymousStorage()
      setAnonymousSessionId(null)
      setLocalMessages([])
    }
  }, [isAuth, anonymousSessionId])

  useEffect(() => {
    if (!isAuth) {
      if (localMessages.length > 0) {
        setAnonymousMessages(localMessages)
      }
    } else if (accountId && messages && messages.length > 0) {
      if (role === 'Guest') {
        setGuestMessages(accountId, messages)
      } else if (role === 'Customer') {
        setCustomerMessages(accountId, messages)
      }
    }
  }, [localMessages, messages, isAuth, role, accountId])

  useEffect(() => {
    if (isAuth && accountId && activeSession?._id) {
      if (role === 'Guest') {
        setGuestSessionId(accountId, activeSession._id)
      } else if (role === 'Customer') {
        setCustomerSessionId(accountId, activeSession._id)
      }
    }
  }, [isAuth, accountId, activeSession, role])

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

      if (isAuth && role && (role === 'Customer' || role === 'Guest') && accountId) {
        const storedSessionId = role === 'Guest' ? getGuestSessionId(accountId) : getCustomerSessionId(accountId)

        if (storedSessionId) {
          try {
            // Verify session exists on server
            const response = await chatApiRequest.listMessages(storedSessionId, { limit: 1 })
            if (response.payload.result.length >= 0) {
              // Session is valid, set it as active
              if (role === 'Customer') {
                setCustomerSessionId(accountId, storedSessionId)
              } else {
                setGuestSessionId(accountId, storedSessionId)
              }
              // Trigger fetch to ensure session data is up-to-date
              setShouldFetchSession(true)
              const refetchFn = role === 'Customer' ? refetchCustomerSession : refetchGuestSession
              await refetchFn()
            } else {
              // Clear invalid session
              if (role === 'Customer') {
                removeFromStorage(`${STORAGE_KEYS.CUSTOMER_SESSION_PREFIX}${accountId}`)
                removeFromStorage(`${STORAGE_KEYS.CUSTOMER_MESSAGES_PREFIX}${accountId}`)
              } else {
                removeFromStorage(`${STORAGE_KEYS.GUEST_SESSION_PREFIX}${accountId}`)
                removeFromStorage(`${STORAGE_KEYS.GUEST_MESSAGES_PREFIX}${accountId}`)
              }
              setShouldFetchSession(true)
              const refetchFn = role === 'Customer' ? refetchCustomerSession : refetchGuestSession
              await refetchFn()
            }
          } catch (error) {
            console.error('Stored session invalid, fetching new session:', error)
            // Clear invalid session
            if (role === 'Customer') {
              removeFromStorage(`${STORAGE_KEYS.CUSTOMER_SESSION_PREFIX}${accountId}`)
              removeFromStorage(`${STORAGE_KEYS.CUSTOMER_MESSAGES_PREFIX}${accountId}`)
            } else {
              removeFromStorage(`${STORAGE_KEYS.GUEST_SESSION_PREFIX}${accountId}`)
              removeFromStorage(`${STORAGE_KEYS.GUEST_MESSAGES_PREFIX}${accountId}`)
            }
            setShouldFetchSession(true)
            const refetchFn = role === 'Customer' ? refetchCustomerSession : refetchGuestSession
            await refetchFn()
          }
        } else {
          // No stored session, fetch from server
          setShouldFetchSession(true)
          const refetchFn = role === 'Customer' ? refetchCustomerSession : refetchGuestSession
          await refetchFn()
        }

        setHasInitialized(true)
      } else if (!isAuth) {
        const storedSessionId = getAnonymousSessionId()
        if (storedSessionId) {
          try {
            await chatApiRequest.listMessages(storedSessionId, { limit: 1 })
            setAnonymousSessionId(storedSessionId)
          } catch {
            clearAnonymousStorage()
            setLocalMessages([])
          }
        }
        setHasInitialized(true)
      }
    }

    initializeSession()
  }, [isAuth, role, shouldRender, hasInitialized, accountId, refetchCustomerSession, refetchGuestSession])

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
  }, [allMessages, isLoadingMore])

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
    if (!sessionId || allMessages.length === 0 || isLoadingMore || !hasMore) return

    setIsLoadingMore(true)
    const oldestMessageId = allMessages[0]._id

    const container = messagesContainerRef.current
    const scrollHeightBefore = container?.scrollHeight || 0

    try {
      const response = await chatApiRequest.listMessages(sessionId, { limit: 50, before: oldestMessageId })
      const newMessages = response.payload.result

      if (!newMessages || newMessages.length === 0 || newMessages.length < 50) {
        setHasMore(false)
      }

      if (newMessages.length > 0) {
        setIsManuallyMerging(true)
        if (isAuth) {
          await refetch()
          setAllMessages((prev) => {
            const merged = [...newMessages, ...prev]
            const unique = merged.filter((msg, index, self) => index === self.findIndex((m) => m._id === msg._id))
            return unique
          })
        } else {
          setLocalMessages((prev) => {
            const merged = [...newMessages, ...prev]
            const unique = merged.filter((msg, index, self) => index === self.findIndex((m) => m._id === msg._id))
            return unique
          })
        }

        setIsManuallyMerging(false)
        setTimeout(() => {
          if (container) {
            const scrollHeightAfter = container.scrollHeight
            const scrollDiff = scrollHeightAfter - scrollHeightBefore
            container.scrollTop = scrollDiff
          }
        }, 0)
      }
    } catch (error) {
      console.error('Error loading more messages:', error)
    } finally {
      setIsLoadingMore(false)
    }
  }, [sessionId, allMessages, isLoadingMore, hasMore, refetch, isAuth])

  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current
    if (!container) return

    if (container.scrollTop === 0 && !isLoadingMore) {
      loadMoreMessages()
    }
  }, [loadMoreMessages, isLoadingMore])

  const ensureSession = async () => {
    if (isAuth && activeSession?._id) {
      // Return existing session ID if available
      return activeSession._id
    }

    if (isAuth && !activeSession && !isCreatingSession && accountId) {
      setIsCreatingSession(true)
      try {
        // Check localStorage first
        const storedSessionId = role === 'Customer' ? getCustomerSessionId(accountId) : getGuestSessionId(accountId)
        if (storedSessionId) {
          // Verify stored session
          try {
            await chatApiRequest.listMessages(storedSessionId, { limit: 1 })
            return storedSessionId
          } catch {
            // Clear invalid session
            if (role === 'Customer') {
              removeFromStorage(`${STORAGE_KEYS.CUSTOMER_SESSION_PREFIX}${accountId}`)
              removeFromStorage(`${STORAGE_KEYS.CUSTOMER_MESSAGES_PREFIX}${accountId}`)
            } else {
              removeFromStorage(`${STORAGE_KEYS.GUEST_SESSION_PREFIX}${accountId}`)
              removeFromStorage(`${STORAGE_KEYS.GUEST_MESSAGES_PREFIX}${accountId}`)
            }
          }
        }

        // Fetch or create new session
        setShouldFetchSession(true)
        const refetchFn = role === 'Customer' ? refetchCustomerSession : refetchGuestSession
        const result = await refetchFn()

        if (result.data?._id) {
          // Save new session ID
          if (role === 'Customer') {
            setCustomerSessionId(accountId, result.data._id)
          } else {
            setGuestSessionId(accountId, result.data._id)
          }
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
          saveAnonymousSessionId(response.payload.result._id)
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

  const displayMessages = allMessages

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
