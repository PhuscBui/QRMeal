'use client'

import { useState } from 'react'
import { Clock, Users, MapPin, Edit, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Mock data
const reservations = [
  {
    id: 'RES-001',
    date: '2024-01-20',
    time: '19:00',
    partySize: 4,
    status: 'confirmed',
    tableNumber: 'A5',
    specialRequests: 'Bàn gần cửa sổ, không khói thuốc'
  },
  {
    id: 'RES-002',
    date: '2024-01-18',
    time: '12:30',
    partySize: 2,
    status: 'pending',
    tableNumber: null,
    specialRequests: ''
  }
]

const statusConfig = {
  confirmed: { label: 'Đã xác nhận', color: 'bg-green-500', icon: CheckCircle },
  pending: { label: 'Chờ xác nhận', color: 'bg-yellow-500', icon: Clock },
  cancelled: { label: 'Đã hủy', color: 'bg-red-500', icon: XCircle }
}

export default function ReservationsPage() {
  const [selectedTab, setSelectedTab] = useState('upcoming')

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const getStatusInfo = (status: string) => {
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
  }

  return (
    <div className='container mx-auto px-4 py-6 max-w-4xl'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold mb-2'>Đặt bàn của tôi</h1>
        <p className='text-muted-foreground'>Quản lý các lần đặt bàn</p>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className='mb-8'>
        <TabsList className='grid w-full grid-cols-3'>
          <TabsTrigger value='upcoming'>Sắp tới</TabsTrigger>
          <TabsTrigger value='past'>Đã qua</TabsTrigger>
          <TabsTrigger value='cancelled'>Đã hủy</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className='space-y-6'>
        {reservations.map((reservation) => {
          const statusInfo = getStatusInfo(reservation.status)
          const StatusIcon = statusInfo.icon

          return (
            <Card key={reservation.id}>
              <CardHeader>
                <div className='flex items-start justify-between'>
                  <div>
                    <CardTitle>Đặt bàn #{reservation.id}</CardTitle>
                    <CardDescription>
                      {formatDate(reservation.date)} • {reservation.time}
                    </CardDescription>
                  </div>
                  <Badge className={`${statusInfo.color} text-white`}>
                    <StatusIcon className='h-3 w-3 mr-1' />
                    {statusInfo.label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  <div className='grid md:grid-cols-2 gap-4'>
                    <div className='flex items-center gap-3'>
                      <Users className='h-5 w-5 text-muted-foreground' />
                      <div>
                        <p className='font-medium'>{reservation.partySize} người</p>
                        <p className='text-sm text-muted-foreground'>Số lượng khách</p>
                      </div>
                    </div>
                    {reservation.tableNumber && (
                      <div className='flex items-center gap-3'>
                        <MapPin className='h-5 w-5 text-muted-foreground' />
                        <div>
                          <p className='font-medium'>Bàn {reservation.tableNumber}</p>
                          <p className='text-sm text-muted-foreground'>Vị trí bàn</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {reservation.specialRequests && (
                    <div className='bg-muted p-3 rounded-lg'>
                      <p className='text-sm'>
                        <span className='font-medium'>Yêu cầu đặc biệt:</span> {reservation.specialRequests}
                      </p>
                    </div>
                  )}

                  <div className='flex gap-2'>
                    {reservation.status === 'pending' && (
                      <>
                        <Button variant='outline' size='sm'>
                          <Edit className='h-4 w-4 mr-2' />
                          Chỉnh sửa
                        </Button>
                        <Button variant='outline' size='sm' className='text-destructive'>
                          <XCircle className='h-4 w-4 mr-2' />
                          Hủy
                        </Button>
                      </>
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
