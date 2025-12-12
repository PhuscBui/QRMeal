'use client'

import { useState } from 'react'
import { CheckCircle, XCircle, Package, Eye, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useTranslations } from 'next-intl'

// Mock data
const orders = [
  {
    id: 'ORD-001',
    date: '2024-01-15',
    total: 185000,
    status: 'delivered',
    items: ['Phở Bò Tái', 'Bún Chả Hà Nội']
  },
  {
    id: 'ORD-002',
    date: '2024-01-10',
    total: 125000,
    status: 'processing',
    items: ['Chè Ba Màu', 'Cà phê sữa đá']
  }
]

export default function OrdersPage() {
  const [selectedTab, setSelectedTab] = useState('all')
  const t = useTranslations('accountOrders')
  const tCommon = useTranslations('common')

  const statusConfig = {
    processing: { label: t('processing'), color: 'bg-blue-500', icon: Package },
    delivered: { label: t('delivered'), color: 'bg-green-500', icon: CheckCircle },
    cancelled: { label: tCommon('cancel'), color: 'bg-red-500', icon: XCircle }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN')
  }

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('vi-VN') + 'đ'
  }

  const getStatusInfo = (status: string) => {
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.processing
  }

  return (
    <div className='container mx-auto px-4 py-6 max-w-4xl'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold mb-2'>{t('myOrders')}</h1>
        <p className='text-muted-foreground'>{t('viewHistory')}</p>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className='mb-8'>
        <TabsList className='grid w-full grid-cols-3'>
          <TabsTrigger value='all'>{t('all')}</TabsTrigger>
          <TabsTrigger value='processing'>{t('processing')}</TabsTrigger>
          <TabsTrigger value='delivered'>{t('delivered')}</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className='space-y-6'>
        {orders.map((order) => {
          const statusInfo = getStatusInfo(order.status)
          const StatusIcon = statusInfo.icon

          return (
            <Card key={order.id}>
              <CardHeader>
                <div className='flex items-start justify-between'>
                  <div>
                    <CardTitle>{t('order')} #{order.id}</CardTitle>
                    <CardDescription>
                      {formatDate(order.date)} • {order.items.join(', ')}
                    </CardDescription>
                  </div>
                  <Badge className={`${statusInfo.color} text-white`}>
                    <StatusIcon className='h-3 w-3 mr-1' />
                    {statusInfo.label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-2xl font-bold'>{formatCurrency(order.total)}</p>
                    <p className='text-sm text-muted-foreground'>{t('total')}</p>
                  </div>
                  <div className='flex gap-2'>
                    <Button variant='outline' size='sm'>
                      <Eye className='h-4 w-4 mr-2' />
                      {t('details')}
                    </Button>
                    {order.status === 'delivered' && (
                      <Button variant='outline' size='sm'>
                        <Star className='h-4 w-4 mr-2' />
                        {t('rate')}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
