'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  Clock,
  CheckCircle,
  XCircle,
  Package,
  MapPin,
  Star,
  RefreshCw,
  Eye,
  MessageCircle,
  Search,
  CreditCard,
  Truck
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'

// Mock data - sẽ được thay thế bằng API thực tế
const orders = [
  {
    id: 'ORD-001',
    orderNumber: 'QRM-2024-001',
    status: 'processing',
    orderType: 'dine-in',
    createdAt: '2024-01-15T10:30:00Z',
    estimatedTime: '2024-01-15T11:00:00Z',
    total: 185000,
    items: [
      {
        name: 'Phở Bò Tái',
        quantity: 2,
        price: 45000,
        image: '/api/placeholder/60/60',
        notes: 'Ít rau, nhiều thịt'
      },
      {
        name: 'Bún Chả Hà Nội',
        quantity: 1,
        price: 55000,
        image: '/api/placeholder/60/60',
        notes: ''
      },
      {
        name: 'Gỏi Cuốn Tôm Thịt',
        quantity: 1,
        price: 35000,
        image: '/api/placeholder/60/60',
        notes: 'Không tôm'
      }
    ],
    progress: 60,
    notes: 'Bàn số 5, tầng 1',
    paymentMethod: 'cash',
    deliveryAddress: null,
    restaurant: {
      name: 'QRMeal Restaurant',
      address: '123 Đường ABC, Quận 1, TP.HCM',
      phone: '0123 456 789'
    }
  },
  {
    id: 'ORD-002',
    orderNumber: 'QRM-2024-002',
    status: 'delivered',
    orderType: 'delivery',
    createdAt: '2024-01-14T18:45:00Z',
    deliveredAt: '2024-01-14T19:30:00Z',
    total: 125000,
    items: [
      {
        name: 'Chè Ba Màu',
        quantity: 2,
        price: 25000,
        image: '/api/placeholder/60/60',
        notes: ''
      },
      {
        name: 'Cà phê sữa đá',
        quantity: 2,
        price: 15000,
        image: '/api/placeholder/60/60',
        notes: 'Ít đường'
      }
    ],
    progress: 100,
    notes: '',
    paymentMethod: 'card',
    deliveryAddress: '456 Đường XYZ, Quận 2, TP.HCM',
    restaurant: {
      name: 'QRMeal Restaurant',
      address: '123 Đường ABC, Quận 1, TP.HCM',
      phone: '0123 456 789'
    },
    rating: 5,
    review: 'Món ăn rất ngon, giao hàng nhanh!'
  },
  {
    id: 'ORD-003',
    orderNumber: 'QRM-2024-003',
    status: 'cancelled',
    orderType: 'takeaway',
    createdAt: '2024-01-13T12:15:00Z',
    cancelledAt: '2024-01-13T12:45:00Z',
    total: 95000,
    items: [
      {
        name: 'Bún Bò Huế',
        quantity: 1,
        price: 55000,
        image: '/api/placeholder/60/60',
        notes: ''
      },
      {
        name: 'Nước ngọt',
        quantity: 2,
        price: 20000,
        image: '/api/placeholder/60/60',
        notes: ''
      }
    ],
    progress: 0,
    notes: '',
    paymentMethod: 'cash',
    deliveryAddress: null,
    restaurant: {
      name: 'QRMeal Restaurant',
      address: '123 Đường ABC, Quận 1, TP.HCM',
      phone: '0123 456 789'
    },
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
  'dine-in': { label: 'Tại chỗ', icon: MapPin, color: 'bg-blue-100 text-blue-800' },
  takeaway: { label: 'Mang về', icon: Package, color: 'bg-orange-100 text-orange-800' },
  delivery: { label: 'Giao hàng', icon: Truck, color: 'bg-green-100 text-green-800' }
}

const paymentMethodConfig = {
  cash: { label: 'Tiền mặt', icon: CreditCard },
  card: { label: 'Thẻ tín dụng', icon: CreditCard },
  banking: { label: 'Chuyển khoản', icon: CreditCard },
  momo: { label: 'Ví MoMo', icon: CreditCard }
}

export default function OrdersPage() {
  const params = useParams()
  const router = useRouter()
  const orderType = params.type as string

  const [selectedTab, setSelectedTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [reviewText, setReviewText] = useState('')
  const [rating, setRating] = useState(0)
  const [orders, setOrders] = useState<any[]>([])

  // Order type specific configurations
  const orderTypeConfig = {
    'dine-in': {
      title: 'Đơn hàng - Ăn tại quán',
      description: 'Theo dõi đơn hàng tại nhà hàng',
      icon: MapPin,
      color: 'text-blue-600'
    },
    takeaway: {
      title: 'Đơn hàng - Mua mang về',
      description: 'Theo dõi đơn hàng mua mang về',
      icon: Package,
      color: 'text-orange-600'
    },
    delivery: {
      title: 'Đơn hàng - Giao hàng',
      description: 'Theo dõi đơn hàng giao tận nơi',
      icon: Truck,
      color: 'text-green-600'
    }
  }

  const currentConfig = orderTypeConfig[orderType as keyof typeof orderTypeConfig]

  useEffect(() => {
    // Load orders from localStorage (in real app, this would be from API)
    const storedOrders = localStorage.getItem('orders')
    if (storedOrders) {
      const allOrders = JSON.parse(storedOrders)
      // Filter orders by type
      const filteredOrders = allOrders.filter((order: any) => order.orderType === orderType)
      setOrders(filteredOrders)
    }

    // Check if there's a current order to add
    const currentOrder = localStorage.getItem('currentOrder')
    if (currentOrder) {
      const orderData = JSON.parse(currentOrder)
      if (orderData.orderType === orderType) {
        // Add current order to the list
        const newOrder = {
          id: `ORD-${Date.now()}`,
          orderNumber: `QRM-${Date.now()}`,
          status: 'pending',
          ...orderData,
          createdAt: new Date().toISOString()
        }
        setOrders((prev) => [newOrder, ...prev])

        // Store in localStorage
        const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]')
        localStorage.setItem('orders', JSON.stringify([newOrder, ...existingOrders]))

        // Clear current order
        localStorage.removeItem('currentOrder')
      }
    }
  }, [orderType])

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items.some((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesTab = selectedTab === 'all' || order.status === selectedTab
    return matchesSearch && matchesTab
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

  const getPaymentMethodInfo = (paymentMethod: string) => {
    return paymentMethodConfig[paymentMethod as keyof typeof paymentMethodConfig] || paymentMethodConfig['cash']
  }

  const handleViewDetails = (order: any) => {
    setSelectedOrder(order)
    setIsDetailDialogOpen(true)
  }

  const handleSubmitReview = () => {
    // Logic to submit review
    console.log('Submitting review:', { orderId: selectedOrder.id, rating, review: reviewText })
    setIsDetailDialogOpen(false)
    setReviewText('')
    setRating(0)
  }

  const handleCancelOrder = (orderId: string) => {
    // Logic to cancel order
    console.log('Cancelling order:', orderId)
  }

  const handleReorder = (order: any) => {
    // Logic to reorder
    console.log('Reordering:', order)
  }

  return (
    <div className='container mx-auto px-4 py-6'>
      {/* Header */}
      <div className='mb-8'>
        <div className='flex items-center gap-3 mb-4'>
          <div className={`p-2 rounded-lg bg-muted`}>
            <currentConfig.icon className={`h-6 w-6 ${currentConfig.color}`} />
          </div>
          <div>
            <h1 className='text-3xl font-bold'>{currentConfig.title}</h1>
            <p className='text-muted-foreground'>{currentConfig.description}</p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className='flex flex-col md:flex-row gap-4 mb-8'>
        <div className='relative flex-1'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4' />
          <Input
            placeholder='Tìm kiếm đơn hàng...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='pl-10'
          />
        </div>
        <Select>
          <SelectTrigger className='w-48'>
            <SelectValue placeholder='Sắp xếp theo' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='newest'>Mới nhất</SelectItem>
            <SelectItem value='oldest'>Cũ nhất</SelectItem>
            <SelectItem value='price-high'>Giá cao</SelectItem>
            <SelectItem value='price-low'>Giá thấp</SelectItem>
          </SelectContent>
        </Select>
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
              <p className='text-muted-foreground mb-4'>Bạn chưa có đơn hàng nào trong danh mục này</p>
              <Button>Đặt hàng ngay</Button>
            </CardContent>
          </Card>
        ) : (
          filteredOrders.map((order) => {
            const statusInfo = getStatusInfo(order.status)
            const orderTypeInfo = getOrderTypeInfo(order.orderType)
            const paymentInfo = getPaymentMethodInfo(order.paymentMethod)
            const StatusIcon = statusInfo.icon
            const OrderTypeIcon = orderTypeInfo.icon
            const PaymentIcon = paymentInfo.icon

            return (
              <Card key={order.id} className='overflow-hidden hover:shadow-lg transition-shadow'>
                <CardHeader className='pb-4'>
                  <div className='flex items-start justify-between'>
                    <div>
                      <CardTitle className='text-lg'>{order.orderNumber}</CardTitle>
                      <CardDescription className='flex items-center gap-2 mt-1'>
                        <OrderTypeIcon className='h-4 w-4' />
                        {orderTypeInfo.label} • {formatDateTime(order.createdAt)}
                      </CardDescription>
                    </div>
                    <div className='flex items-center gap-2'>
                      <Badge className={orderTypeInfo.color}>{orderTypeInfo.label}</Badge>
                      <Badge className={`${statusInfo.color} text-white`}>
                        <StatusIcon className='h-3 w-3 mr-1' />
                        {statusInfo.label}
                      </Badge>
                    </div>
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
                  <div className='space-y-3'>
                    <h4 className='font-medium text-sm'>Món đã đặt:</h4>
                    <div className='space-y-2'>
                      {(Array.isArray(order.items) ? order.items : []).map(
                        (
                          item: {
                            name: string
                            quantity: number
                            price: number
                            image: string
                            notes?: string
                          },
                          index: number
                        ) => (
                          <div key={index} className='flex items-center gap-3 p-2 bg-muted/50 rounded-lg'>
                            <img src={item.image} alt={item.name} className='w-12 h-12 rounded-lg object-cover' />
                            <div className='flex-1'>
                              <div className='flex items-center justify-between'>
                                <h5 className='font-medium text-sm'>{item.name}</h5>
                                <span className='text-sm font-medium'>
                                  {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                                </span>
                              </div>
                              <p className='text-xs text-muted-foreground'>
                                {item.quantity}x {item.price.toLocaleString('vi-VN')}đ{item.notes && ` • ${item.notes}`}
                              </p>
                            </div>
                          </div>
                        )
                      )}
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

                  {/* Delivery Address */}
                  {order.deliveryAddress && (
                    <div className='bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg'>
                      <div className='flex items-start gap-2'>
                        <MapPin className='h-4 w-4 text-blue-600 mt-0.5' />
                        <div>
                          <p className='text-sm font-medium text-blue-800 dark:text-blue-200'>Địa chỉ giao hàng:</p>
                          <p className='text-sm text-blue-700 dark:text-blue-300'>{order.deliveryAddress}</p>
                        </div>
                      </div>
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
                      {order.review && <p className='text-sm text-green-700 dark:text-green-300'>{order.review}</p>}
                    </div>
                  )}

                  {/* Order Total and Payment */}
                  <div className='flex items-center justify-between pt-2 border-t'>
                    <div>
                      <span className='font-semibold text-lg'>{order.total.toLocaleString('vi-VN')}đ</span>
                      <div className='flex items-center gap-1 text-sm text-muted-foreground'>
                        <PaymentIcon className='h-3 w-3' />
                        {paymentInfo.label}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className='flex flex-wrap gap-2 pt-2'>
                    <Button variant='outline' size='sm' onClick={() => handleViewDetails(order)}>
                      <Eye className='h-4 w-4 mr-2' />
                      Chi tiết
                    </Button>

                    {order.status === 'processing' && (
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => handleCancelOrder(order.id)}
                        className='text-destructive hover:text-destructive'
                      >
                        <XCircle className='h-4 w-4 mr-2' />
                        Hủy đơn
                      </Button>
                    )}

                    {order.status === 'delivered' && !order.rating && (
                      <Button variant='outline' size='sm' onClick={() => handleViewDetails(order)}>
                        <Star className='h-4 w-4 mr-2' />
                        Đánh giá
                      </Button>
                    )}

                    {order.status === 'delivered' && (
                      <Button variant='outline' size='sm' onClick={() => handleReorder(order)}>
                        <RefreshCw className='h-4 w-4 mr-2' />
                        Đặt lại
                      </Button>
                    )}

                    <Button variant='outline' size='sm'>
                      <MessageCircle className='h-4 w-4 mr-2' />
                      Liên hệ
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* Order Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className='max-w-2xl max-h-[80vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>Chi tiết đơn hàng {selectedOrder?.orderNumber}</DialogTitle>
            <DialogDescription>Thông tin chi tiết về đơn hàng của bạn</DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className='space-y-6'>
              {/* Order Status */}
              <div className='flex items-center justify-between p-4 bg-muted rounded-lg'>
                <div>
                  <p className='font-medium'>Trạng thái đơn hàng</p>
                  <p className='text-sm text-muted-foreground'>{getStatusInfo(selectedOrder.status).description}</p>
                </div>
                <Badge className={`${getStatusInfo(selectedOrder.status).color} text-white`}>
                  {getStatusInfo(selectedOrder.status).label}
                </Badge>
              </div>

              {/* Order Items */}
              <div>
                <h4 className='font-medium mb-3'>Món đã đặt</h4>
                <div className='space-y-3'>
                  {(Array.isArray(selectedOrder.items) ? selectedOrder.items : []).map(
                    (
                      item: {
                        name: string
                        quantity: number
                        price: number
                        image: string
                        notes?: string
                      },
                      index: number
                    ) => (
                      <div key={index} className='flex items-center gap-3 p-3 border rounded-lg'>
                        <img src={item.image} alt={item.name} className='w-16 h-16 rounded-lg object-cover' />
                        <div className='flex-1'>
                          <h5 className='font-medium'>{item.name}</h5>
                          <p className='text-sm text-muted-foreground'>
                            {item.quantity}x {item.price.toLocaleString('vi-VN')}đ
                          </p>
                          {item.notes && <p className='text-xs text-muted-foreground italic'>Ghi chú: {item.notes}</p>}
                        </div>
                        <div className='text-right'>
                          <p className='font-medium'>{(item.price * item.quantity).toLocaleString('vi-VN')}đ</p>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Order Summary */}
              <div className='border-t pt-4'>
                <div className='space-y-2'>
                  <div className='flex justify-between'>
                    <span>Tạm tính:</span>
                    <span>{selectedOrder.total.toLocaleString('vi-VN')}đ</span>
                  </div>
                  <div className='flex justify-between font-semibold text-lg'>
                    <span>Tổng cộng:</span>
                    <span>{selectedOrder.total.toLocaleString('vi-VN')}đ</span>
                  </div>
                </div>
              </div>

              {/* Review Form for Delivered Orders */}
              {selectedOrder.status === 'delivered' && !selectedOrder.rating && (
                <div className='border-t pt-4'>
                  <h4 className='font-medium mb-3'>Đánh giá đơn hàng</h4>
                  <div className='space-y-3'>
                    <div>
                      <label className='text-sm font-medium'>Đánh giá:</label>
                      <div className='flex gap-1 mt-1'>
                        {[...Array(5)].map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setRating(i + 1)}
                            className={`h-8 w-8 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
                          >
                            <Star className={`h-6 w-6 ${i < rating ? 'fill-current' : ''}`} />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className='text-sm font-medium'>Nhận xét:</label>
                      <Textarea
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        placeholder='Chia sẻ trải nghiệm của bạn...'
                        rows={3}
                        className='mt-1'
                      />
                    </div>
                    <Button onClick={handleSubmitReview} className='w-full'>
                      Gửi đánh giá
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
