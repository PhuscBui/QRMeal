'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ArrowLeft, MapPin, Package, Truck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TableInfo } from '@/types/common.type'

const orderTypeConfig = {
  'dine-in': {
    title: 'Eat at the restaurant',
    icon: MapPin,
    color: 'bg-blue-500',
    description: 'Enjoy at the restaurant'
  },
  takeaway: {
    title: 'Take-out',
    icon: Package,
    color: 'bg-orange-500',
    description: 'Pick up at the restaurant'
  },
  delivery: {
    title: 'Delivery',
    icon: Truck,
    color: 'bg-green-500',
    description: 'Delivery to your door'
  }
}

export default function OrderTypeLayout({ children }: { children: React.ReactNode }) {
  const params = useParams()
  const router = useRouter()
  const [orderType, setOrderType] = useState<string | null>(null)
  const [tableInfo, setTableInfo] = useState<TableInfo | null>(null)

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

  const backToOrderTypeSelection = () => {
    localStorage.removeItem('tableInfo')
    router.push('/customer/order-type')
  }

  if (!orderType || !orderTypeConfig[orderType as keyof typeof orderTypeConfig]) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <div className='text-center'>
          <h1 className='text-2xl font-bold mb-4'>Invalid order type</h1>
          <Button onClick={() => router.push('/customer/order-type')}>Back to select order type</Button>
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
              <Button variant='ghost' size='icon' onClick={backToOrderTypeSelection}>
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
                {tableInfo.tableNumber} - {tableInfo.location}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className='container mx-auto px-4 py-6'>{children}</div>
    </div>
  )
}
