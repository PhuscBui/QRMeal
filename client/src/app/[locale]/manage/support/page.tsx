'use client'
import { useEffect, useState, useRef, useCallback } from 'react'
import { useAppContext } from '@/components/app-provider'
import { useListChatSessionsQuery, useChatMessagesQuery, useEndSessionMutation } from '@/queries/useChat'
import chatApiRequest from '@/apiRequests/chat'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  MessageCircle,
  Send,
  User,
  Clock,
  MessageSquare,
  X,
  Search,
  CheckCircle2,
  Loader2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'

interface ChatMessage {
  _id: string
  session_id: string
  sender_type: 'user' | 'staff' | 'bot'
  message: string
  created_at: string | Date
}

interface ChatSession {
  _id: string
  start_time: string | Date
  end_time?: string | Date
  guest_id?: string
  customer_id?: string
  anonymous_id?: string
  user_info?: {
    name?: string
    email?: string
    phone?: string
  }
}

interface SessionsData {
  data: ChatSession[]
  total: number
  page: number
  limit: number
}

export default function ManageChatPage() {
  const t = useTranslations('support')
  const { socket } = useAppContext()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [sessionsPerPage] = useState(20)

  const { data: sessionsData, refetch } = useListChatSessionsQuery({
    limit: sessionsPerPage,
    page: currentPage
  })

  useEffect(() => {
    const onNew = () => refetch()
    socket?.on('chat:new-message', onNew)
    return () => {
      socket?.off('chat:new-message', onNew)
    }
  }, [socket, refetch])

  const sessions = (sessionsData as SessionsData | undefined)?.data || []
  const totalSessions = (sessionsData as SessionsData | undefined)?.total || 0
  const totalPages = Math.ceil(totalSessions / sessionsPerPage)

  const activeSessions = sessions.filter((s) => !s.end_time)
  const closedSessions = sessions.filter((s) => s.end_time)

  const filteredActiveSessions = activeSessions.filter((s) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      s._id.toLowerCase().includes(query) ||
      s.anonymous_id?.toLowerCase().includes(query) ||
      s.user_info?.name?.toLowerCase().includes(query) ||
      s.user_info?.email?.toLowerCase().includes(query)
    )
  })

  const filteredClosedSessions = closedSessions.filter((s) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      s._id.toLowerCase().includes(query) ||
      s.anonymous_id?.toLowerCase().includes(query) ||
      s.user_info?.name?.toLowerCase().includes(query) ||
      s.user_info?.email?.toLowerCase().includes(query)
    )
  })

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage)
      setSelectedSessionId(null)
    }
  }

  const selectedSession = sessions.find((s) => s._id === selectedSessionId)

  return (
    <div className='flex flex-col h-screen w-full p-4 lg:p-6'>
      <div className='mb-2 flex-shrink-0'>
        <h1 className='text-2xl lg:text-3xl font-bold text-balance bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2'>
          {t('title')}
        </h1>
        <p className='text-sm lg:text-base text-muted-foreground'>{t('subtitle')}</p>
      </div>

      <div className='grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-3 mb-3 lg:mb-4 flex-shrink-0'>
        <Card className='border shadow-sm hover:shadow-md transition-all duration-300 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20'>
          <CardHeader className='pb-2'>
            <CardTitle className='text-xl font-medium flex items-center gap-1.5 text-blue-700 dark:text-blue-300'>
              <div className='p-1.5 bg-blue-600 rounded-lg shadow-sm'>
                <MessageCircle className='h-4 w-4 text-white' />
              </div>
              {t('totalSessions')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-blue-900 dark:text-blue-100'>{totalSessions}</div>
          </CardContent>
        </Card>

        <Card className='border shadow-sm hover:shadow-md transition-all duration-300 bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/30 dark:to-green-900/20'>
          <CardHeader className='pb-2'>
            <CardTitle className='text-xl font-medium flex items-center gap-1.5 text-green-700 dark:text-green-300'>
              <div className='p-1.5 bg-green-600 rounded-lg shadow-sm'>
                <MessageSquare className='h-4 w-4 text-white' />
              </div>
              {t('active')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-green-900 dark:text-green-100'>{activeSessions.length}</div>
          </CardContent>
        </Card>

        <Card className='border shadow-sm hover:shadow-md transition-all duration-300 bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-950/30 dark:to-slate-900/20'>
          <CardHeader className='pb-2'>
            <CardTitle className='text-xl font-medium flex items-center gap-1.5 text-slate-700 dark:text-slate-300'>
              <div className='p-1.5 bg-slate-600 rounded-lg shadow-sm'>
                <CheckCircle2 className='h-4 w-4 text-white' />
              </div>
              {t('closed')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-slate-900 dark:text-slate-100'>{closedSessions.length}</div>
          </CardContent>
        </Card>

        <Card className='border shadow-sm hover:shadow-md transition-all duration-300 bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/30 dark:to-purple-900/20'>
          <CardHeader className='pb-2'>
            <CardTitle className='text-xl font-medium flex items-center gap-1.5 text-purple-700 dark:text-purple-300'>
              <div className='p-1.5 bg-purple-600 rounded-lg shadow-sm'>
                <User className='h-4 w-4 text-white' />
              </div>
              {t('anonymous')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-purple-900 dark:text-purple-100'>
              {sessions.filter((s) => s.anonymous_id).length}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className='grid grid-cols-12 gap-4 lg:gap-6 flex-1 min-h-0'>
        {/* Left: Session List */}
        <div className='col-span-12 lg:col-span-4 flex flex-col min-h-0 bg-background rounded-lg border shadow-sm p-3 lg:p-4'>
          <div className='mb-4 flex-shrink-0'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('searchPlaceholder')}
                className='pl-10 h-11 border-2 focus-visible:ring-2 focus-visible:ring-blue-500'
              />
            </div>
          </div>

          <Tabs defaultValue='active' className='flex-1 flex flex-col min-h-0'>
            <TabsList className='grid w-full grid-cols-2 h-11 bg-muted/50 flex-shrink-0'>
              <TabsTrigger value='active' className='data-[state=active]:bg-background data-[state=active]:shadow-sm'>
                Hoạt động ({filteredActiveSessions.length})
              </TabsTrigger>
              <TabsTrigger value='closed' className='data-[state=active]:bg-background data-[state=active]:shadow-sm'>
                Đã đóng ({filteredClosedSessions.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value='active' className='flex-1 overflow-y-auto mt-4 space-y-3 pr-2 min-h-0'>
              {filteredActiveSessions.map((session) => (
                <SessionListItem
                  key={session._id}
                  session={session}
                  isSelected={selectedSessionId === session._id}
                  onClick={() => setSelectedSessionId(session._id)}
                />
              ))}
              {filteredActiveSessions.length === 0 && (
                <div className='text-center text-muted-foreground py-12'>
                  <div className='bg-muted/30 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4'>
                    <MessageCircle className='h-8 w-8 opacity-50' />
                  </div>
                  <p className='text-sm font-medium'>{t('noActiveSessions')}</p>
                  <p className='text-xs mt-1'>{t('noActiveSessionsDesc')}</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value='closed' className='flex-1 overflow-y-auto mt-4 space-y-3 pr-2 min-h-0'>
              {filteredClosedSessions.map((session) => (
                <SessionListItem
                  key={session._id}
                  session={session}
                  isSelected={selectedSessionId === session._id}
                  onClick={() => setSelectedSessionId(session._id)}
                />
              ))}
              {filteredClosedSessions.length === 0 && (
                <div className='text-center text-muted-foreground py-12'>
                  <div className='bg-muted/30 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4'>
                    <CheckCircle2 className='h-8 w-8 opacity-50' />
                  </div>
                  <p className='text-sm font-medium'>{t('noClosedSessions')}</p>
                  <p className='text-xs mt-1'>{t('noClosedSessionsDesc')}</p>
                </div>
              )}
            </TabsContent>
          </Tabs>

          {totalPages > 1 && (
            <div className='mt-4 flex items-center justify-center gap-3 flex-shrink-0'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className='h-9'
              >
                <ChevronLeft className='h-4 w-4' />
              </Button>
              <span className='text-sm font-medium min-w-[60px] text-center'>
                {currentPage} / {totalPages}
              </span>
              <Button
                variant='outline'
                size='sm'
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className='h-9'
              >
                <ChevronRight className='h-4 w-4' />
              </Button>
            </div>
          )}
        </div>

        <div className='col-span-12 lg:col-span-8 min-h-0'>
          {selectedSession ? (
            <ChatDetail session={selectedSession} />
          ) : (
            <Card className='h-full flex items-center justify-center border shadow-sm bg-gradient-to-br from-muted/20 to-background'>
              <div className='text-center text-muted-foreground p-8'>
                <div className='bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-950/50 dark:to-indigo-950/50 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6 shadow-lg'>
                  <MessageCircle className='h-12 w-12 text-blue-600 dark:text-blue-400' />
                </div>
                <h3 className='text-xl font-semibold mb-2 text-foreground'>{t('selectSession')}</h3>
                <p className='text-sm text-muted-foreground max-w-sm mx-auto'>
                  {t('selectSessionDesc')}
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

function SessionListItem({
  session,
  isSelected,
  onClick
}: {
  session: ChatSession
  isSelected: boolean
  onClick: () => void
}) {
  const t = useTranslations('support')
  
  const getUserInfo = () => {
    if (session.customer_id || session.guest_id) {
      return {
        name: session.user_info?.name || session.user_info?.email || t('user'),
        label: session.customer_id ? t('customer') : t('guest'),
        color: session.customer_id
          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
          : 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300'
      }
    }
    return {
      name: `${t('anonymous')} #${session.anonymous_id?.slice(-6)}`,
      label: t('anonymous'),
      color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300'
    }
  }

  const userInfo = getUserInfo()

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] border-2',
        isSelected && 'ring-2 ring-blue-500 bg-blue-50/50 dark:bg-blue-950/30 border-blue-300 dark:border-blue-700',
        !isSelected && 'hover:border-blue-200 dark:hover:border-blue-800',
        session.end_time && 'opacity-70'
      )}
      onClick={onClick}
    >
      <CardContent className='pl-4'>
        <div className='flex items-start justify-between mb-3'>
          <div className='flex-1'>
            <div className='flex items-center gap-2 mb-2'>
              <Badge className={cn('text-xs font-medium', userInfo.color)}>{userInfo.label}</Badge>
              {!session.end_time && (
                <div className='relative flex h-3 w-3'>
                  <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75'></span>
                  <span className='relative inline-flex rounded-full h-3 w-3 bg-green-500'></span>
                </div>
              )}
            </div>
            <p className='font-semibold text-sm truncate mb-1'>{userInfo.name}</p>
            {session.user_info?.email && (
              <p className='text-xs text-muted-foreground truncate'>{session.user_info.email}</p>
            )}
          </div>
        </div>
        <div className='flex items-center gap-1.5 text-xs text-muted-foreground'>
          <Clock className='h-3.5 w-3.5' />
          {new Date(session.start_time).toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      </CardContent>
    </Card>
  )
}

function ChatDetail({ session }: { session: ChatSession }) {
  const t = useTranslations('support')
  const { socket } = useAppContext()
  const [allMessages, setAllMessages] = useState<ChatMessage[]>([])
  const [hasMoreMessages, setHasMoreMessages] = useState(true)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true)

  const { data: messages, refetch } = useChatMessagesQuery(session._id, { limit: 50 })
  const { mutate: endSession } = useEndSessionMutation()
  const [text, setText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const bottomRef = useRef<HTMLDivElement | null>(null)
  const messagesContainerRef = useRef<HTMLDivElement | null>(null)
  const isClosed = !!session.end_time

  useEffect(() => {
    if (messages) {
      setAllMessages(messages)
      setShouldAutoScroll(true)
    }
  }, [messages])

  useEffect(() => {
    const onNewMessage = (message: ChatMessage) => {
      if (message.session_id === session._id) {
        refetch()
      }
    }

    const onTyping = ({ sessionId, isTyping: typing }: { sessionId: string; isTyping: boolean }) => {
      if (sessionId === session._id) {
        setIsTyping(typing)
      }
    }

    socket?.on('chat:new-message', onNewMessage)
    socket?.on('chat:typing', onTyping)

    return () => {
      socket?.off('chat:new-message', onNewMessage)
      socket?.off('chat:typing', onTyping)
    }
  }, [socket, session._id, refetch])

  useEffect(() => {
    if (shouldAutoScroll) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [allMessages, shouldAutoScroll])

  const loadMoreMessages = useCallback(async () => {
    if (!hasMoreMessages || isLoadingMessages || allMessages.length === 0) return

    setIsLoadingMessages(true)
    const oldestMessageId = allMessages[0]._id

    try {
      const response = await chatApiRequest.listMessages(session._id, {
        limit: 50,
        before: oldestMessageId
      })
      const newMessages = response.payload.result

      if (newMessages.length === 0 || newMessages.length < 50) {
        setHasMoreMessages(false)
      }

      if (newMessages.length > 0) {
        setAllMessages((prev) => [...newMessages, ...prev])
      }
    } catch (error) {
      console.error('Error loading more messages:', error)
    } finally {
      setIsLoadingMessages(false)
    }
  }, [session._id, allMessages, hasMoreMessages, isLoadingMessages])

  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current
    if (!container) return

    if (container.scrollTop === 0 && !isLoadingMessages) {
      loadMoreMessages()
    }

    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100
    setShouldAutoScroll(isNearBottom)
  }, [isLoadingMessages, loadMoreMessages])

  const send = () => {
    const content = text.trim()
    if (!content || isClosed) return

    socket?.emit('chat:send', { sessionId: session._id, message: content, sender: 'staff' })
    setText('')
    setShouldAutoScroll(true)
  }

  const handleEndSession = () => {
    if (confirm(t('confirmEndSession'))) {
      endSession(session._id)
    }
  }

  const getUserInfo = () => {
    if (session.customer_id || session.guest_id) {
      return session.user_info?.name || session.user_info?.email || t('user')
    }
    return `${t('anonymous')} #${session.anonymous_id?.slice(-6)}`
  }

  return (
    <Card className='h-full flex flex-col shadow-lg border-2'>
      <CardHeader className='pb-4 border-b bg-gradient-to-r from-background to-muted/20 flex-shrink-0'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className='w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold'>
              {getUserInfo().charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className='font-semibold text-lg'>{getUserInfo()}</h3>
              {session.user_info?.email && <p className='text-sm text-muted-foreground'>{session.user_info.email}</p>}
            </div>
          </div>
          <div className='flex items-center gap-3'>
            <Badge
              variant={isClosed ? 'secondary' : 'default'}
              className={cn('font-medium', !isClosed && 'bg-green-600 hover:bg-green-700')}
            >
              {isClosed ? t('closed') : t('active')}
            </Badge>
            {!isClosed && (
              <Button onClick={handleEndSession} variant='destructive' size='sm' className='gap-1.5'>
                <X className='h-4 w-4' />
                {t('endSession')}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className='flex-1 overflow-hidden p-0 flex flex-col min-h-0'>
        <div
          ref={messagesContainerRef}
          onScroll={handleScroll}
          className='flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-muted/20 to-background'
        >
          {isLoadingMessages && (
            <div className='flex justify-center py-3'>
              <div className='bg-background rounded-full p-2 shadow-sm'>
                <Loader2 className='h-5 w-5 animate-spin text-blue-600' />
              </div>
            </div>
          )}

          {allMessages.map((m: ChatMessage) => (
            <div
              key={m._id}
              className={cn(
                'flex animate-in fade-in slide-in-from-bottom-2 duration-300',
                m.sender_type === 'staff' ? 'justify-end' : 'justify-start'
              )}
            >
              <div
                className={cn(
                  'max-w-[75%] rounded-2xl px-4 py-3 shadow-sm',
                  m.sender_type === 'staff'
                    ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-br-sm'
                    : 'bg-background border-2 border-muted rounded-bl-sm'
                )}
              >
                <div className='break-words text-sm leading-relaxed'>{m.message}</div>
                <div
                  className={cn(
                    'text-xs mt-1.5 flex items-center gap-1',
                    m.sender_type === 'staff' ? 'text-blue-100' : 'text-muted-foreground'
                  )}
                >
                  <Clock className='h-3 w-3' />
                  {new Date(m.created_at).toLocaleTimeString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className='flex justify-start animate-in fade-in slide-in-from-bottom-2'>
              <div className='bg-background border-2 border-muted rounded-2xl rounded-bl-sm px-5 py-3 shadow-sm'>
                <div className='flex space-x-1.5'>
                  <div className='w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce' />
                  <div
                    className='w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce'
                    style={{ animationDelay: '0.1s' }}
                  />
                  <div
                    className='w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce'
                    style={{ animationDelay: '0.2s' }}
                  />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {!isClosed && (
          <div className='p-4 border-t bg-muted/20 flex-shrink-0'>
            <div className='flex gap-3'>
              <Input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={t('enterMessage')}
                className='h-11 border-2 focus-visible:ring-2 focus-visible:ring-blue-500'
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    send()
                  }
                }}
              />
              <Button
                onClick={send}
                disabled={!text.trim()}
                className='h-11 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
              >
                <Send className='h-4 w-4' />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
