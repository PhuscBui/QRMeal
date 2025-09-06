'use client'

import { useState } from 'react'
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Package, 
  MapPin,
  Phone,
  Star,
  RefreshCw,
  Eye,
  MessageCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'

// Mock data - sẽ được thay thế bằng API thực tế
const orders = [
  {
    id: 'ORD-001',
    status: 'processing',
    orderType: 'dine-in',
    createdAt: '2024-01-15T10:30:00Z',
    estimatedTime: '2024-01-15T11:00:00Z',
    total: 185000,
    items: [
      { name: 'Phở Bò Tái', quantity: 2, price: 45000 },
      { name: 'Bún Chả Hà Nội', quantity: 1, price: 55000 },
      { name: 'Gỏi Cuốn Tôm Thịt', quantity: 1, price: 35000 }
    ],
    progress: 60,
    notes: 'Ít rau, nhiều thịt'
  },
  {
    id: 'ORD-002',
    status: 'delivered',
    orderType: 'delivery',
    createdAt: '2024-01-14T18:45:00Z',
    deliveredAt: '2024-01-14T19:30:00Z',
    total: 125000,
    items: [
      { name: 'Chè Ba Màu', quantity: 2, price: 25000 },
      { name: 'Cà phê sữa đá', quantity: 2, price: 15000 },
      { name: 'Bánh mì pate', quantity: 1, price: 25000 }
    ],
    progress: 100,
    rating: 5,
    review: 'Món ăn rất ngon, giao hàng nhanh!'
  },
  {
    id: 'ORD-003',
    status: 'cancelled',
    orderType: 'takeaway',
    createdAt: '2024-01-13T12:15:00Z',
    cancelledAt: '2024-01-13T12:45:00Z',
    total: 95000,
    items: [
      { name: 'Bún Bò Huế', quantity: 1, price: 55000 },
      { name: 'Nước ngọt', quantity: 2, price: 20000 }
    ],
    progress: 0,
    cancelReason: 'Khách hàng hủy'
  }
]

const statusConfig = {
  pending: {
    label: 'Chờ xác nhận',
    color: 'bg-yellow-500',
    icon: Clock,
    description: 'Đơn hàng đang chờ xác nhận'
  },
  processing: {
    label: 'Đang chế biến',
    color: 'bg-blue-500',
    icon: Package,
    description: 'Đơn hàng đang được chế biến'
  },
  delivered: {
    label: 'Đã giao',
    color: 'bg-green-500',
    icon: CheckCircle,
    description: 'Đơn hàng đã được giao thành công'
  },
  cancelled: {
    label: 'Đã hủy',
    color: 'bg-red-500',
    icon: XCircle,
    description: 'Đơn hàng đã bị hủy'
  }
}

const orderTypeConfig = {
  'dine-in': { label: 'Tại chỗ', icon: MapPin },
  'takeaway': { label: 'Mang về', icon: Package },
  'delivery': { label: 'Giao hàng', icon: MapPin }
}

export default function OrdersPage() {
  const [selectedTab, setSelectedTab] = useState('all')

  const filteredOrders = orders.filter(order => {
    if (selectedTab === 'all') return true
    return order.status === selectedTab
  })

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusInfo = (status: string) => {
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
  }

  const getOrderTypeInfo = (orderType: string) => {
    return orderTypeConfig[orderType as keyof typeof orderTypeConfig] || orderTypeConfig['dine-in']
  }

  return (
    <div className='container mx-auto px-4 py-6'>
      {/* Header */}
      <div className='mb-8'>
        <h1 className='text-3xl font-bold mb-2'>Đơn hàng của tôi</h1>
        <p className='text-muted-foreground'>Theo dõi và quản lý đơn hàng</p>
      </div>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className='mb-8'>
        <TabsList className='grid w-full grid-cols-2 md:grid-cols-4'>
          <TabsTrigger value='all'>Tất cả</TabsTrigger>
          <TabsTrigger value='processing'>Đang xử lý</TabsTrigger>
          <TabsTrigger value='delivered'>Đã giao</TabsTrigger>
          <TabsTrigger value='cancelled'>Đã hủy</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Orders List */}
      <div className='space-y-6'>
        {filteredOrders.length === 0 ? (
          <Card>
            <CardContent className='text-center py-12'>
              <Package className='h-12 w-12 mx-auto text-muted-foreground mb-4' />
              <h3 className='text-lg font-medium mb-2'>Chưa có đơn hàng nào</h3>
              <p className='text-muted-foreground mb-4'>
                Bạn chưa có đơn hàng nào trong danh mục này
              </p>
              <Button>Đặt hàng ngay</Button>
            </CardContent>
          </Card>
        ) : (
          filteredOrders.map((order) => {
            const statusInfo = getStatusInfo(order.status)
            const orderTypeInfo = getOrderTypeInfo(order.orderType)
            const StatusIcon = statusInfo.icon
            const OrderTypeIcon = orderTypeInfo.icon

            return (
              <Card key={order.id} className='overflow-hidden'>
                <CardHeader className='pb-4'>
                  <div className='flex items-start justify-between'>
                    <div>
                      <CardTitle className='text-lg'>Đơn hàng #{order.id}</CardTitle>
                      <CardDescription className='flex items-center gap-2 mt-1'>
                        <OrderTypeIcon className='h-4 w-4' />
                        {orderTypeInfo.label} • {formatDateTime(order.createdAt)}
                      </CardDescription>
                    </div>
                    <Badge className={`${statusInfo.color} text-white`}>
                      <StatusIcon className='h-3 w-3 mr-1' />
                      {statusInfo.label}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className='space-y-4'>
                  {/* Progress Bar */}
                  {order.status === 'processing' && (
                    <div className='space-y-2'>
                      <div className='flex justify-between text-sm'>
                        <span>Tiến độ đơn hàng</span>
                        <span>{order.progress}%</span>
                      </div>
                      <Progress value={order.progress} className='h-2' />
                    </div>
                  )}

                  {/* Order Items */}
                  <div className='space-y-2'>
                    <h4 className='font-medium text-sm'>Món đã đặt:</h4>
                    <div className='space-y-1'>
                      {order.items.map((item, index) => (
                        <div key={index} className='flex justify-between text-sm'>
                          <span className='flex-1'>
                            {item.quantity}x {item.name}
                          </span>
                          <span className='font-medium'>
                            {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Notes */}
                  {order.notes && (
                    <div className='bg-muted p-3 rounded-lg'>
                      <p className='text-sm'>
                        <span className='font-medium'>Ghi chú:</span> {order.notes}
                      </p>
                    </div>
                  )}

                  {/* Cancel Reason */}
                  {order.status === 'cancelled' && order.cancelReason && (
                    <div className='bg-red-50 dark:bg-red-950/20 p-3 rounded-lg'>
                      <p className='text-sm text-red-700 dark:text-red-300'>
                        <span className='font-medium'>Lý do hủy:</span> {order.cancelReason}
                      </p>
                    </div>
                  )}

                  {/* Review Section */}
                  {order.status === 'delivered' && order.rating && (
                    <div className='bg-green-50 dark:bg-green-950/20 p-3 rounded-lg'>
                      <div className='flex items-center gap-2 mb-2'>
                        <span className='font-medium text-sm'>Đánh giá của bạn:</span>
                        <div className='flex items-center gap-1'>
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < order.rating! ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      {order.review && (
                        <p className='text-sm text-green-700 dark:text-green-300'>{order.review}</p>
                      )}
                    </div>
                  )}

                  {/* Order Total */}
                  <div className='flex justify-between items-center pt-2 border-t'>
                    <span className='font-semibold'>Tổng cộng:</span>
                    <span className='text-lg font-bold text-primary'>
                      {order.total.toLocaleString('vi-VN')}đ
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className='flex gap-2 pt-2'>
                    <Button variant='outline' size='sm' className='flex-1'>
                      <Eye className='h-4 w-4 mr-2' />
                      Chi tiết
                    </Button>
                    
                    {order.status === 'processing' && (
                      <Button variant='outline' size='sm' className='flex-1'>
                        <RefreshCw className='h-4 w-4 mr-2' />
                        Cập nhật
                      </Button>
                    )}
                    
                    {order.status === 'delivered' && !order.rating && (
                      <Button variant='outline' size='sm' className='flex-1'>
                        <Star className='h-4 w-4 mr-2' />
                        Đánh giá
                      </Button>
                    )}
                    
                    {order.status === 'delivered' && (
                      <Button variant='outline' size='sm' className='flex-1'>
                        <MessageCircle className='h-4 w-4 mr-2' />
                        Liên hệ
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* Quick Actions */}
      <Card className='mt-8'>
        <CardHeader>
          <CardTitle>Thao tác nhanh</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            <Button variant='outline' className='h-20 flex-col gap-2'>
              <Package className='h-6 w-6' />
              <span className='text-sm'>Đặt lại</span>
            </Button>
            <Button variant='outline' className='h-20 flex-col gap-2'>
              <Phone className='h-6 w-6' />
              <span className='text-sm'>Liên hệ</span>
            </Button>
            <Button variant='outline' className='h-20 flex-col gap-2'>
              <Star className='h-6 w-6' />
              <span className='text-sm'>Đánh giá</span>
            </Button>
            <Button variant='outline' className='h-20 flex-col gap-2'>
              <MessageCircle className='h-6 w-6' />
              <span className='text-sm'>Hỗ trợ</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
