'use client'

import { useState } from 'react'
import { 
  MapPin, 
  Clock, 
  CheckCircle, 
  Package, 
  ChefHat,
  Truck,
  Phone,
  MessageCircle,
  RefreshCw,
  Star
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'

// Mock data for order tracking
const orderTracking = {
  id: 'ORD-001',
  orderNumber: 'QRM-2024-001',
  status: 'processing',
  estimatedTime: '2024-01-15T11:00:00Z',
  currentStep: 2,
  totalSteps: 4,
  steps: [
    {
      id: 1,
      title: 'Đơn hàng đã được xác nhận',
      description: 'Nhà hàng đã xác nhận đơn hàng của bạn',
      status: 'completed',
      timestamp: '2024-01-15T10:30:00Z',
      icon: CheckCircle
    },
    {
      id: 2,
      title: 'Đang chuẩn bị món ăn',
      description: 'Đầu bếp đang chế biến món ăn của bạn',
      status: 'current',
      timestamp: '2024-01-15T10:35:00Z',
      icon: ChefHat
    },
    {
      id: 3,
      title: 'Sẵn sàng giao hàng',
      description: 'Món ăn đã sẵn sàng để giao',
      status: 'pending',
      timestamp: null,
      icon: Package
    },
    {
      id: 4,
      title: 'Đã giao hàng',
      description: 'Đơn hàng đã được giao thành công',
      status: 'pending',
      timestamp: null,
      icon: Truck
    }
  ],
  orderDetails: {
    total: 185000,
    items: [
      { name: 'Phở Bò Tái', quantity: 2, price: 45000 },
      { name: 'Bún Chả Hà Nội', quantity: 1, price: 55000 },
      { name: 'Gỏi Cuốn Tôm Thịt', quantity: 1, price: 35000 }
    ],
    orderType: 'delivery',
    deliveryAddress: '456 Đường XYZ, Quận 2, TP.HCM',
    estimatedDelivery: '2024-01-15T11:00:00Z',
    notes: 'Giao hàng trước 11h'
  },
  restaurant: {
    name: 'QRMeal Restaurant',
    address: '123 Đường ABC, Quận 1, TP.HCM',
    phone: '0123 456 789',
    rating: 4.8,
    deliveryTime: '25-35 phút'
  },
  delivery: {
    driver: {
      name: 'Nguyễn Văn A',
      phone: '0987 654 321',
      rating: 4.9,
      avatar: '/api/placeholder/40/40'
    },
    vehicle: 'Xe máy - Honda Wave',
    estimatedArrival: '2024-01-15T11:00:00Z',
    currentLocation: 'Đang di chuyển từ nhà hàng',
    trackingUrl: 'https://maps.google.com/...'
  }
}

export default function OrderTrackingPage() {
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = () => {
    setIsRefreshing(true)
    // Simulate API call
    setTimeout(() => {
      setIsRefreshing(false)
    }, 2000)
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getEstimatedTime = () => {
    const now = new Date()
    const estimated = new Date(orderTracking.estimatedTime)
    const diff = Math.max(0, Math.ceil((estimated.getTime() - now.getTime()) / (1000 * 60)))
    return diff
  }

  const getStepStatus = (step: any) => {
    if (step.status === 'completed') return 'completed'
    if (step.status === 'current') return 'current'
    return 'pending'
  }

  const getStepIcon = (step: any) => {
    const Icon = step.icon
    const status = getStepStatus(step)
    
    if (status === 'completed') {
      return <Icon className='h-5 w-5 text-green-500' />
    } else if (status === 'current') {
      return <Icon className='h-5 w-5 text-blue-500' />
    } else {
      return <Icon className='h-5 w-5 text-gray-300' />
    }
  }

  return (
    <div className='container mx-auto px-4 py-6 max-w-4xl'>
      {/* Header */}
      <div className='mb-8'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold mb-2'>Theo dõi đơn hàng</h1>
            <p className='text-muted-foreground'>Đơn hàng #{orderTracking.orderNumber}</p>
          </div>
          <Button 
            variant='outline' 
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Làm mới
          </Button>
        </div>
      </div>

      <div className='grid lg:grid-cols-3 gap-8'>
        {/* Main Tracking */}
        <div className='lg:col-span-2 space-y-6'>
          {/* Order Status */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Package className='h-5 w-5' />
                Trạng thái đơn hàng
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <span className='font-medium'>Tiến độ</span>
                  <span className='text-sm text-muted-foreground'>
                    {orderTracking.currentStep}/{orderTracking.totalSteps} bước
                  </span>
                </div>
                <Progress 
                  value={(orderTracking.currentStep / orderTracking.totalSteps) * 100} 
                  className='h-2'
                />
                <div className='text-center'>
                  <p className='text-2xl font-bold text-primary'>
                    {getEstimatedTime()} phút
                  </p>
                  <p className='text-sm text-muted-foreground'>
                    Thời gian dự kiến còn lại
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tracking Steps */}
          <Card>
            <CardHeader>
              <CardTitle>Chi tiết tiến độ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-6'>
                {orderTracking.steps.map((step, index) => (
                  <div key={step.id} className='flex items-start gap-4'>
                    <div className='flex-shrink-0'>
                      {getStepIcon(step)}
                    </div>
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-center justify-between'>
                        <h4 className={`font-medium ${
                          getStepStatus(step) === 'current' ? 'text-blue-600' : 
                          getStepStatus(step) === 'completed' ? 'text-green-600' : 
                          'text-muted-foreground'
                        }`}>
                          {step.title}
                        </h4>
                        {step.timestamp && (
                          <span className='text-sm text-muted-foreground'>
                            {formatTime(step.timestamp)}
                          </span>
                        )}
                      </div>
                      <p className='text-sm text-muted-foreground mt-1'>
                        {step.description}
                      </p>
                      {getStepStatus(step) === 'current' && (
                        <div className='mt-2'>
                          <div className='flex items-center gap-2 text-sm text-blue-600'>
                            <div className='w-2 h-2 bg-blue-500 rounded-full animate-pulse' />
                            Đang xử lý...
                          </div>
                        </div>
                      )}
                    </div>
                    {index < orderTracking.steps.length - 1 && (
                      <div className='absolute left-6 top-8 w-px h-8 bg-border' />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Order Details */}
          <Card>
            <CardHeader>
              <CardTitle>Chi tiết đơn hàng</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {orderTracking.orderDetails.items.map((item, index) => (
                  <div key={index} className='flex items-center justify-between py-2'>
                    <div>
                      <p className='font-medium'>{item.name}</p>
                      <p className='text-sm text-muted-foreground'>
                        {item.quantity}x {item.price.toLocaleString('vi-VN')}đ
                      </p>
                    </div>
                    <p className='font-medium'>
                      {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                    </p>
                  </div>
                ))}
                <Separator />
                <div className='flex items-center justify-between text-lg font-semibold'>
                  <span>Tổng cộng:</span>
                  <span>{orderTracking.orderDetails.total.toLocaleString('vi-VN')}đ</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className='space-y-6'>
          {/* Restaurant Info */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <MapPin className='h-5 w-5' />
                Nhà hàng
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div>
                <h4 className='font-medium'>{orderTracking.restaurant.name}</h4>
                <p className='text-sm text-muted-foreground'>
                  {orderTracking.restaurant.address}
                </p>
              </div>
              <div className='flex items-center gap-2'>
                <Star className='h-4 w-4 fill-yellow-400 text-yellow-400' />
                <span className='text-sm font-medium'>{orderTracking.restaurant.rating}</span>
                <span className='text-sm text-muted-foreground'>
                  ({orderTracking.restaurant.deliveryTime})
                </span>
              </div>
              <Button variant='outline' size='sm' className='w-full'>
                <Phone className='h-4 w-4 mr-2' />
                Gọi nhà hàng
              </Button>
            </CardContent>
          </Card>

          {/* Delivery Info */}
          {orderTracking.orderDetails.orderType === 'delivery' && (
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Truck className='h-5 w-5' />
                  Giao hàng
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='flex items-center gap-3'>
                  <img
                    src={orderTracking.delivery.driver.avatar}
                    alt={orderTracking.delivery.driver.name}
                    className='w-10 h-10 rounded-full'
                  />
                  <div>
                    <p className='font-medium'>{orderTracking.delivery.driver.name}</p>
                    <div className='flex items-center gap-1'>
                      <Star className='h-3 w-3 fill-yellow-400 text-yellow-400' />
                      <span className='text-sm text-muted-foreground'>
                        {orderTracking.delivery.driver.rating}
                      </span>
                    </div>
                  </div>
                </div>
                <div className='space-y-2'>
                  <p className='text-sm'>
                    <span className='font-medium'>Phương tiện:</span> {orderTracking.delivery.vehicle}
                  </p>
                  <p className='text-sm'>
                    <span className='font-medium'>Vị trí hiện tại:</span> {orderTracking.delivery.currentLocation}
                  </p>
                </div>
                <div className='space-y-2'>
                  <Button variant='outline' size='sm' className='w-full'>
                    <Phone className='h-4 w-4 mr-2' />
                    Gọi tài xế
                  </Button>
                  <Button variant='outline' size='sm' className='w-full'>
                    <MessageCircle className='h-4 w-4 mr-2' />
                    Nhắn tin
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Delivery Address */}
          <Card>
            <CardHeader>
              <CardTitle>Địa chỉ giao hàng</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-2'>
                <p className='text-sm'>{orderTracking.orderDetails.deliveryAddress}</p>
                <p className='text-sm text-muted-foreground'>
                  Dự kiến giao: {formatTime(orderTracking.orderDetails.estimatedDelivery)}
                </p>
                {orderTracking.orderDetails.notes && (
                  <p className='text-sm text-muted-foreground italic'>
                    Ghi chú: {orderTracking.orderDetails.notes}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Thao tác nhanh</CardTitle>
            </CardHeader>
            <CardContent className='space-y-2'>
              <Button variant='outline' size='sm' className='w-full'>
                <MessageCircle className='h-4 w-4 mr-2' />
                Liên hệ hỗ trợ
              </Button>
              <Button variant='outline' size='sm' className='w-full'>
                <RefreshCw className='h-4 w-4 mr-2' />
                Đặt lại
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
