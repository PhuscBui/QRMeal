'use client'
import { useEffect, useState, useRef } from 'react'
import { useAppContext } from '@/components/app-provider'
import { useListChatSessionsQuery, useChatMessagesQuery } from '@/queries/useChat'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { MessageCircle, Send, User, Clock, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'

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
}

interface SessionsData {
  data: ChatSession[]
  total: number
  page: number
  limit: number
}

export default function ManageChatPage() {
  const { socket } = useAppContext()
  const [selectedSession, setSelectedSession] = useState<string | null>(null)
  const { data: sessionsData, refetch } = useListChatSessionsQuery({ limit: 50, page: 1 })

  useEffect(() => {
    const onNew = () => refetch()
    socket?.on('chat:new-message', onNew)
    return () => {
      socket?.off('chat:new-message', onNew)
    }
  }, [socket, refetch])

  const sessions = (sessionsData as SessionsData | undefined)?.data || []
  const activeSessions = sessions.filter((s) => !s.end_time)
  const closedSessions = sessions.filter((s) => s.end_time)

  return (
    <div className='container mx-auto p-4 max-w-7xl'>
      <div className='mb-6'>
        <h1 className='text-3xl font-bold text-gray-900 dark:text-white mb-2'>Hộp thư hỗ trợ</h1>
        <p className='text-gray-600 dark:text-gray-400'>Quản lý và trả lời các tin nhắn từ khách hàng</p>
      </div>

      {/* Statistics */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='text-sm font-medium flex items-center gap-2'>
              <MessageCircle className='h-4 w-4 text-blue-600' />
              Tổng phiên chat
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{sessions.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='text-sm font-medium flex items-center gap-2'>
              <MessageSquare className='h-4 w-4 text-green-600' />
              Đang hoạt động
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-green-600'>{activeSessions.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='text-sm font-medium flex items-center gap-2'>
              <Clock className='h-4 w-4 text-gray-600' />
              Đã đóng
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-gray-600'>{closedSessions.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Sessions Grid */}
      <div className='space-y-4'>
        {activeSessions.length > 0 && (
          <div>
            <h2 className='text-lg font-semibold mb-3 flex items-center gap-2'>
              <div className='w-2 h-2 bg-green-500 rounded-full animate-pulse' />
              Phiên đang hoạt động ({activeSessions.length})
            </h2>
            <div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4'>
              {activeSessions.map((session) => (
                <SessionCard
                  key={session._id}
                  session={session}
                  isSelected={selectedSession === session._id}
                  onSelect={() => setSelectedSession(session._id)}
                />
              ))}
            </div>
          </div>
        )}

        {closedSessions.length > 0 && (
          <div>
            <h2 className='text-lg font-semibold mb-3 text-gray-600 dark:text-gray-400'>
              Phiên đã đóng ({closedSessions.length})
            </h2>
            <div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4'>
              {closedSessions.map((session) => (
                <SessionCard
                  key={session._id}
                  session={session}
                  isSelected={selectedSession === session._id}
                  onSelect={() => setSelectedSession(session._id)}
                />
              ))}
            </div>
          </div>
        )}

        {sessions.length === 0 && (
          <Card className='p-12'>
            <div className='text-center text-gray-500 dark:text-gray-400'>
              <MessageCircle className='h-12 w-12 mx-auto mb-4 opacity-50' />
              <p className='text-lg font-medium mb-2'>Chưa có phiên chat nào</p>
              <p className='text-sm'>Các phiên chat từ khách hàng sẽ xuất hiện ở đây</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}

function SessionCard({
  session,
  isSelected,
  onSelect
}: {
  session: ChatSession
  isSelected: boolean
  onSelect: () => void
}) {
  const { socket } = useAppContext()
  const { data: messages, refetch } = useChatMessagesQuery(session._id, { limit: 50 })
  const [text, setText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const bottomRef = useRef<HTMLDivElement | null>(null)
  const isClosed = !!session.end_time

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
    if (isSelected) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isSelected])

  const send = () => {
    const content = text.trim()
    if (!content || isClosed) return

    socket?.emit('chat:send', { sessionId: session._id, message: content, sender: 'staff' })
    setText('')
  }

  const lastMessage = messages && messages.length > 0 ? messages[messages.length - 1] : null
  const unreadCount = messages?.filter((m) => m.sender_type === 'user').length || 0

  const getUserType = () => {
    if (session.customer_id) return 'Khách hàng'
    if (session.guest_id) return 'Khách'
    if (session.anonymous_id) return 'Ẩn danh'
    return 'Không xác định'
  }

  return (
    <Card
      className={cn(
        'transition-all hover:shadow-lg cursor-pointer',
        isSelected && 'ring-2 ring-blue-600',
        isClosed && 'opacity-60'
      )}
      onClick={onSelect}
    >
      <CardHeader className='pb-3'>
        <div className='flex items-start justify-between'>
          <div className='flex items-center gap-2'>
            <User className='h-4 w-4 text-gray-500' />
            <CardTitle className='text-sm font-medium'>{getUserType()}</CardTitle>
          </div>
          <Badge variant={isClosed ? 'secondary' : 'default'} className='text-xs'>
            {isClosed ? 'Đã đóng' : 'Đang hoạt động'}
          </Badge>
        </div>
        <div className='flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-1'>
          <Clock className='h-3 w-3' />
          {new Date(session.start_time).toLocaleString('vi-VN')}
        </div>
      </CardHeader>

      <CardContent className='space-y-3'>
        {/* Messages */}
        <ScrollArea className='h-48 rounded-md border border-gray-200 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-900'>
          <div className='space-y-2'>
            {messages && messages.length > 0 ? (
              messages.map((m: ChatMessage) => (
                <div key={m._id} className={cn('flex', m.sender_type === 'staff' ? 'justify-end' : 'justify-start')}>
                  <div
                    className={cn(
                      'max-w-[80%] rounded-lg px-3 py-2 text-sm',
                      m.sender_type === 'staff'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                    )}
                  >
                    <div className='break-words'>{m.message}</div>
                    <div
                      className={cn(
                        'text-xs mt-1',
                        m.sender_type === 'staff' ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                      )}
                    >
                      {new Date(m.created_at).toLocaleTimeString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className='text-center text-gray-400 text-sm py-4'>Chưa có tin nhắn</div>
            )}

            {isTyping && (
              <div className='flex justify-start'>
                <div className='bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2'>
                  <div className='flex space-x-1'>
                    <div className='w-2 h-2 bg-gray-400 rounded-full animate-bounce' />
                    <div
                      className='w-2 h-2 bg-gray-400 rounded-full animate-bounce'
                      style={{ animationDelay: '0.1s' }}
                    />
                    <div
                      className='w-2 h-2 bg-gray-400 rounded-full animate-bounce'
                      style={{ animationDelay: '0.2s' }}
                    />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </ScrollArea>

        {/* Input */}
        {!isClosed && (
          <div className='flex gap-2'>
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder='Nhập tin nhắn...'
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  send()
                }
              }}
              className='flex-1'
              disabled={isClosed}
            />
            <Button onClick={send} disabled={!text.trim() || isClosed} size='icon'>
              <Send className='h-4 w-4' />
            </Button>
          </div>
        )}

        {isClosed && (
          <div className='text-center text-sm text-gray-500 dark:text-gray-400 py-2'>Phiên chat đã kết thúc</div>
        )}

        {lastMessage && (
          <div className='text-xs text-gray-500 dark:text-gray-400 truncate'>Tin nhắn cuối: {lastMessage.message}</div>
        )}
      </CardContent>
    </Card>
  )
}
