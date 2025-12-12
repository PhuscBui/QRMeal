import Layout from '@/app/[locale]/(public)/layout'
import ChatWidget from '@/components/chat-widget'

import React from 'react'

export default function GuestLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div>
      <Layout>
        {' '}
        {children} <ChatWidget />{' '}
      </Layout>
    </div>
  )
}

