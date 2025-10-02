'use client'
import { usePathname } from 'next/navigation'
import ChatWidget from './chat-widget'

export default function ChatWidgetWrapper() {
  const pathname = usePathname()

  // Hide on manage routes and api routes
  if (pathname?.startsWith('/manage') || pathname?.startsWith('/api')) {
    return null
  }

  return <ChatWidget />
}
