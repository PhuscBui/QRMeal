'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ArrowLeft, MapPin, Package, Truck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const orderTypeConfig = {
  'dine-in': {
    title: 'Ăn tại quán',
    icon: MapPin,
    color: 'bg-blue-500',
    description: 'Thưởng thức tại nhà hàng'
  },
  'takeaway': {
    title: 'Mua mang về',
    icon: Package,
    color: 'bg-orange-500',
    description: 'Đến lấy tại nhà hàng'
  },
  'delivery': {
    title: 'Giao hàng',
    icon: Truck,
    color: 'bg-green-500',
    description: 'Giao tận nơi'
  }
}

export default function OrderTypeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const params = useParams()
  const router = useRouter()
  const [orderType, setOrderType] = useState<string | null>(null)
  const [tableInfo, setTableInfo] = useState<any>(null)

  useEffect(() => {
    const type = params.type as string
    setOrderType(type)

    // Load table info for dine-in orders
    if (type === 'dine-in') {
      const storedTableInfo = localStorage.getItem('tableInfo')
      if (storedTableInfo) {
        setTableInfo(JSON.parse(storedTableInfo))
      }
    }
  }, [params.type])

  if (!orderType || !orderTypeConfig[orderType as keyof typeof orderTypeConfig]) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <div className='text-center'>
          <h1 className='text-2xl font-bold mb-4'>Loại đơn hàng không hợp lệ</h1>
          <Button onClick={() => router.push('/customer/order-type')}>
            Quay lại chọn loại đơn hàng
          </Button>
        </div>
      </div>
    )
  }

  const config = orderTypeConfig[orderType as keyof typeof orderTypeConfig]
  const Icon = config.icon

  return (
    <div className='min-h-screen bg-background'>
      {/* Header */}
      <div className='sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b'>
        <div className='container mx-auto px-4 py-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-4'>
              <Button variant='ghost' size='icon' onClick={() => router.back()}>
                <ArrowLeft className='h-4 w-4' />
              </Button>
              
              <div className='flex items-center gap-3'>
                <div className={`w-10 h-10 rounded-full ${config.color} flex items-center justify-center`}>
                  <Icon className='h-5 w-5 text-white' />
                </div>
                <div>
                  <h1 className='text-xl font-bold'>{config.title}</h1>
                  <p className='text-sm text-muted-foreground'>{config.description}</p>
                </div>
              </div>
            </div>

            {/* Table Info for Dine-in */}
            {orderType === 'dine-in' && tableInfo && (
              <Badge variant='secondary' className='text-sm'>
                {tableInfo.tableNumber} - {tableInfo.floor}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className='container mx-auto px-4 py-6'>
        {children}
      </div>
    </div>
  )
}
