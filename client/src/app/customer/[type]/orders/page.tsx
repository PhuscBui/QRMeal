/* eslint-disable @next/next/no-img-element */
'use client'

import { useEffect, useState } from 'react'
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { OrderStatus } from '@/constants/type'
import { GetOrderDetailResType, PayOrdersResType, UpdateOrderResType } from '@/schemaValidations/order.schema'
import { useGetOrderListQuery, usePayOrderMutation } from '@/queries/useOrder'
import { useAccountMe } from '@/queries/useAccount'
import { toast } from 'sonner'
import { useAppContext } from '@/components/app-provider'
import { getVietnameseOrderStatus } from '@/lib/utils'

const statusConfig = {
  [OrderStatus.Pending]: {
    label: 'Waiting for confirmation',
    color: 'bg-yellow-500',
    icon: Clock,
    description: 'Order is waiting for confirmation'
  },
  [OrderStatus.Processing]: {
    label: 'Processing',
    color: 'bg-blue-500',
    icon: Package,
    description: 'Order is being processed'
  },

  [OrderStatus.Delivered]: {
    label: 'Delivered',
    color: 'bg-green-500',
    icon: CheckCircle,
    description: 'Order has been successfully delivered'
  },
  [OrderStatus.Cancelled]: {
    label: 'Cancelled',
    color: 'bg-red-500',
    icon: XCircle,
    description: 'Order has been cancel'
  },
  [OrderStatus.Paid]: {
    label: 'Paid',
    color: 'bg-purple-500',
    icon: CheckCircle,
    description: 'Order paid'
  }
}

const orderTypeConfig = {
  'dine-in': { label: 'In-place', icon: MapPin, color: 'bg-blue-100 text-blue-800' },
  takeaway: { label: 'Take home', icon: Package, color: 'bg-orange-100 text-orange-800' },
  delivery: { label: 'Delivery', icon: Truck, color: 'bg-green-100 text-green-800' }
}

const paymentMethodConfig = {
  cash: { label: 'Cash', icon: CreditCard },
  card: { label: 'Credit Card', icon: CreditCard },
  banking: { label: 'Bank Transfer', icon: CreditCard },
  momo: { label: 'MoMo Wallet', icon: CreditCard }
}

export default function OrdersPage() {
  const params = useParams()
  const router = useRouter()
  const orderType = params.type as 'dine-in' | 'delivery' | 'takeaway'
  const { data: userData, isLoading: isUserLoading } = useAccountMe()
  const user = userData?.payload.result
  const { mutateAsync: payOrder, isPending: isProcessing } = usePayOrderMutation()

  const [selectedTab, setSelectedTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedOrderGroup, setSelectedOrderGroup] = useState<GetOrderDetailResType['result'] | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [reviewText, setReviewText] = useState('')
  const [rating, setRating] = useState(0)
  const [isPayDialogOpen, setIsPayDialogOpen] = useState(false)
  const [orderGroupToPay, setOrderGroupToPay] = useState<GetOrderDetailResType['result'] | null>(null)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('cash')
  const [sortBy, setSortBy] = useState('newest')
  const { socket } = useAppContext()

  const {
    data: ordersResponse,
    isLoading,
    refetch
  } = useGetOrderListQuery({
    order_type: orderType,
    customer_id: user?._id
  })

  // Order type specific configurations (UI)
  const orderTypeUiConfig = {
    'dine-in': {
      title: 'Orders - In-House',
      description: 'Track Orders at Restaurant',
      icon: MapPin,
      color: 'text-blue-600'
    },
    takeaway: {
      title: 'Orders - Takeaway',
      description: 'Track Takeaway Orders',
      icon: Package,
      color: 'text-orange-600'
    },
    delivery: {
      title: 'Orders - Delivery',
      description: 'Track Delivery Orders',
      icon: Truck,
      color: 'text-green-600'
    }
  }

  const currentConfig = orderTypeUiConfig[orderType]

  // Get orders from API response
  const orderGroups = ordersResponse?.payload?.result || []

  const calculateTotal = (orders: GetOrderDetailResType['result']['orders']) => {
    return orders.reduce((total, order) => {
      return total + order.dish_snapshot.price * order.quantity
    }, 0)
  }

  // Filter and sort order groups
  const filteredOrderGroups = orderGroups
    .filter((orderGroup) => {
      const customerName = orderGroup.customer?.name || orderGroup.guest?.name || ''
      const orderItems = orderGroup.orders.map((order) => order.dish_snapshot.name).join(' ')

      const matchesSearch =
        customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        orderItems.toLowerCase().includes(searchQuery.toLowerCase()) ||
        orderGroup._id.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesTab = selectedTab === 'all' || orderGroup.status === selectedTab
      return matchesSearch && matchesTab
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        case 'price-high':
          return calculateTotal(b.orders) - calculateTotal(a.orders)
        case 'price-low':
          return calculateTotal(a.orders) - calculateTotal(b.orders)
        default:
          return 0
      }
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

  const getStatusInfo = (status: keyof typeof OrderStatus) => {
    return statusConfig[status] || statusConfig[OrderStatus.Pending]
  }

  const getOrderTypeInfo = (orderType: string) => {
    return orderTypeConfig[orderType as keyof typeof orderTypeConfig] || orderTypeConfig['dine-in']
  }

  const generateOrderNumber = (orderGroupId: string) => {
    return `QRM-${orderGroupId.slice(-8).toUpperCase()}`
  }

  const getCustomerInfo = (orderGroup: GetOrderDetailResType['result']) => {
    if (orderGroup.customer) {
      return {
        name: orderGroup.customer.name,
        phone: orderGroup.customer.phone
      }
    }
    if (orderGroup.guest) {
      return {
        name: orderGroup.guest.name,
        phone: orderGroup.guest.phone
      }
    }
    if (orderGroup.takeaway_info) {
      return {
        name: orderGroup.takeaway_info.customer_name,
        phone: orderGroup.takeaway_info.customer_phone
      }
    }
    return { name: 'Khách hàng', phone: '' }
  }

  const handleViewDetails = (orderGroup: GetOrderDetailResType['result']) => {
    setSelectedOrderGroup(orderGroup)
    setIsDetailDialogOpen(true)
  }

  const handleSubmitReview = () => {
    if (!selectedOrderGroup) return
    console.log('Submitting review:', {
      orderGroupId: selectedOrderGroup._id,
      rating,
      review: reviewText
    })
    setIsDetailDialogOpen(false)
    setReviewText('')
    setRating(0)
  }

  const handleCancelOrder = (orderGroupId: string) => {
    console.log('Cancelling order group:', orderGroupId)
  }

  const handleReorder = (orderGroup: GetOrderDetailResType['result']) => {
    console.log('Reordering:', orderGroup)
    // Redirect to menu with pre-selected items
    const items = orderGroup.orders.map((order) => ({
      dish_id: order.dish_snapshot._id,
      quantity: order.quantity
    }))

    // Store in localStorage for cart restoration
    localStorage.setItem('reorderItems', JSON.stringify(items))
    router.push('/menu')
  }

  const openPayDialog = (orderGroup: GetOrderDetailResType['result']) => {
    setOrderGroupToPay(orderGroup)
    setSelectedPaymentMethod('cash')
    setIsPayDialogOpen(true)
  }

  const confirmPay = async () => {
    if (!orderGroupToPay) return
    console.log('Processing payment for order group:', orderGroupToPay._id)
    // Call API to process payment
    try {
      const result = await payOrder({ is_customer: true, customer_id: user?._id })
      toast.success(result.payload.message)
      setIsPayDialogOpen(false)
      setOrderGroupToPay(null)
      refetch()
    } catch (error) {
      toast.error('Payment failed')
      console.error('Payment error:', error)
    }
  }

  useEffect(() => {
    if (socket?.connected) {
      onConnect()
    }

    function onConnect() {
      console.log(socket?.id)
    }

    function onDisconnect() {
      console.log('disconnect')
    }

    function onUpdateOrder(data: UpdateOrderResType['result']) {
      const {
        dish_snapshot: { name },
        quantity
      } = data
      toast('Success', {
        description: `The item ${name} (SL: ${quantity}) has just been updated with the status "${getVietnameseOrderStatus(
          data.status
        )}"`
      })
      refetch()
    }

    function onPayment(data: PayOrdersResType['result']) {
      if (data.length > 0) {
        const orderGroup = data[0]
        const guestInfo = orderGroup.guest
        const totalOrders = data.reduce((sum, group) => sum + group.orders.length, 0)

        toast.success('Thanh toán thành công!', {
          description: `${guestInfo?.name} tại bàn ${guestInfo?.table_number} đã thanh toán ${totalOrders} món ăn. Bạn có thể đánh giá món ăn ngay bây giờ!`
        })
      }
      refetch()
    }

    socket?.on('update-order', onUpdateOrder)
    socket?.on('payment', onPayment)
    socket?.on('connect', onConnect)
    socket?.on('disconnect', onDisconnect)

    return () => {
      socket?.off('connect', onConnect)
      socket?.off('disconnect', onDisconnect)
      socket?.off('update-order', onUpdateOrder)
      socket?.off('payment', onPayment)
    }
  }, [refetch, socket])

  function handleClose() {
    setIsDetailDialogOpen(false)
    setIsPayDialogOpen(false)
  }

  if (isLoading || isUserLoading) {
    return (
      <div className='container mx-auto px-4 py-6'>
        <div className='flex items-center justify-center h-64'>
          <div className='text-center'>
            <RefreshCw className='h-8 w-8 animate-spin mx-auto mb-4' />
            <p>Đang tải đơn hàng...</p>
          </div>
        </div>
      </div>
    )
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
        <Select value={sortBy} onValueChange={setSortBy}>
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
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className='mb-14'>
        <TabsList className='grid w-full grid-cols-2 md:grid-cols-5'>
          <TabsTrigger value='all'>Tất cả</TabsTrigger>
          <TabsTrigger value={OrderStatus.Pending}>Chờ xác nhận</TabsTrigger>
          <TabsTrigger value={OrderStatus.Processing}>Đang xử lý</TabsTrigger>
          <TabsTrigger value={OrderStatus.Delivered}>Đã giao</TabsTrigger>
          <TabsTrigger value={OrderStatus.Cancelled}>Đã hủy</TabsTrigger>
          <TabsTrigger value={OrderStatus.Paid}>Đã thanh toán</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Orders List */}
      <div className=' space-y-6'>
        {filteredOrderGroups.length === 0 ? (
          <Card>
            <CardContent className='text-center py-12'>
              <Package className='h-12 w-12 mx-auto text-muted-foreground mb-4' />
              <h3 className='text-lg font-medium mb-2'>Chưa có đơn hàng nào</h3>
              <p className='text-muted-foreground mb-4'>
                {searchQuery ? 'Không tìm thấy đơn hàng phù hợp' : 'Bạn chưa có đơn hàng nào trong danh mục này'}
              </p>
              <Button onClick={() => router.push('/menu')}>Đặt hàng ngay</Button>
            </CardContent>
          </Card>
        ) : (
          filteredOrderGroups.map((orderGroup) => {
            const statusInfo = getStatusInfo(orderGroup.status)
            const orderTypeInfo = getOrderTypeInfo(orderGroup.order_type)
            const customerInfo = getCustomerInfo({ ...orderGroup, table: orderGroup.table ?? null })
            const total = calculateTotal(orderGroup.orders)
            const orderNumber = generateOrderNumber(orderGroup._id)
            const StatusIcon = statusInfo.icon
            const OrderTypeIcon = orderTypeInfo.icon

            return (
              <Card key={orderGroup._id} className='overflow-hidden hover:shadow-lg transition-shadow'>
                <CardHeader className='pb-4'>
                  <div className='flex items-start justify-between'>
                    <div className='space-y-2'>
                      <CardTitle className='text-lg'>{orderNumber}</CardTitle>
                      <div className='flex items-center gap-2'>
                        <Badge className={orderTypeInfo.color}>{orderTypeInfo.label}</Badge>
                        <Badge className={`${statusInfo.color} text-white`}>
                          <StatusIcon className='h-3 w-3 mr-1' />
                          {statusInfo.label}
                        </Badge>
                      </div>
                      <CardDescription className='flex items-center gap-2 mt-1'>
                        <OrderTypeIcon className='h-4 w-4' />
                        {orderTypeInfo.label} • {formatDateTime(orderGroup.created_at)}
                        {customerInfo.name && ` • ${customerInfo.name}`}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className='space-y-4'>
                  {/* Order Items */}
                  <div className='space-y-3'>
                    <h4 className='font-medium text-sm'>Món đã đặt ({orderGroup.orders.length} món):</h4>
                    <div className='space-y-2'>
                      {orderGroup.orders.slice(0, 3).map((order) => (
                        <div key={order._id} className='flex items-center gap-3 p-2 bg-muted/50 rounded-lg'>
                          <img
                            src={order.dish_snapshot.image}
                            alt={order.dish_snapshot.name}
                            className='w-12 h-12 rounded-lg object-cover'
                          />
                          <div className='flex-1'>
                            <div className='flex items-center justify-between'>
                              <h5 className='font-medium text-sm'>{order.dish_snapshot.name}</h5>
                              <span className='text-sm font-medium'>
                                {(order.dish_snapshot.price * order.quantity).toLocaleString('vi-VN')}đ
                              </span>
                            </div>
                            <p className='text-xs text-muted-foreground'>
                              {order.quantity}x {order.dish_snapshot.price.toLocaleString('vi-VN')}đ
                            </p>
                          </div>
                        </div>
                      ))}

                      {orderGroup.orders.length > 3 && (
                        <div className='text-center text-sm text-muted-foreground py-2'>
                          và {orderGroup.orders.length - 3} món khác...
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Table Info for dine-in */}
                  {orderGroup.order_type === 'dine-in' && orderGroup.table && (
                    <div className='bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg'>
                      <div className='flex items-center gap-2'>
                        <MapPin className='h-4 w-4 text-blue-600' />
                        <span className='font-medium text-sm text-blue-800 dark:text-blue-200'>
                          Bàn số {orderGroup.table.number} ({orderGroup.table.capacity} chỗ)
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Delivery Address */}
                  {orderGroup.order_type === 'delivery' && orderGroup.delivery && (
                    <div className='bg-green-50 dark:bg-green-950/20 p-3 rounded-lg'>
                      <div className='flex items-start gap-2'>
                        <Truck className='h-4 w-4 text-green-600 mt-0.5' />
                        <div>
                          <p className='text-sm font-medium text-green-800 dark:text-green-200'>
                            Giao đến: {orderGroup.delivery.receiver_name}
                          </p>
                          <p className='text-sm text-green-700 dark:text-green-300'>{orderGroup.delivery.address}</p>
                          <p className='text-xs text-green-600 dark:text-green-400'>
                            SĐT: {orderGroup.delivery.receiver_phone}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Takeaway Info */}
                  {orderGroup.order_type === 'takeaway' && orderGroup.takeaway_info && (
                    <div className='bg-orange-50 dark:bg-orange-950/20 p-3 rounded-lg'>
                      <div className='flex items-start gap-2'>
                        <Package className='h-4 w-4 text-orange-600 mt-0.5' />
                        <div>
                          <p className='text-sm font-medium text-orange-800 dark:text-orange-200'>
                            Khách hàng: {orderGroup.takeaway_info.customer_name}
                          </p>
                          <p className='text-xs text-orange-600 dark:text-orange-400'>
                            SĐT: {orderGroup.takeaway_info.customer_phone}
                          </p>
                          {orderGroup.takeaway_info.pickup_time && (
                            <p className='text-xs text-orange-600 dark:text-orange-400'>
                              Thời gian lấy: {formatDateTime(orderGroup.takeaway_info.pickup_time)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Order Notes */}
                  {(orderGroup.delivery?.notes || orderGroup.takeaway_info?.notes) && (
                    <div className='bg-muted p-3 rounded-lg'>
                      <p className='text-sm'>
                        <span className='font-medium'>Ghi chú:</span>{' '}
                        {orderGroup.delivery?.notes || orderGroup.takeaway_info?.notes}
                      </p>
                    </div>
                  )}

                  {/* Order Total */}
                  <div className='flex items-center justify-between pt-2 border-t'>
                    <div>
                      <span className='font-semibold text-lg'>{total.toLocaleString('vi-VN')}đ</span>
                      <div className='text-sm text-muted-foreground'>
                        {orderGroup.status === OrderStatus.Paid ? (
                          <span className='text-green-600'>Đã thanh toán</span>
                        ) : (
                          <span className='text-yellow-600'>Chưa thanh toán</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className='flex flex-wrap gap-2 pt-2'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => handleViewDetails({ ...orderGroup, table: orderGroup.table ?? null })}
                    >
                      <Eye className='h-4 w-4 mr-2' />
                      Chi tiết
                    </Button>

                    {orderGroup.status === OrderStatus.Pending && (
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => handleCancelOrder(orderGroup._id)}
                        className='text-destructive hover:text-destructive'
                      >
                        <XCircle className='h-4 w-4 mr-2' />
                        Hủy đơn
                      </Button>
                    )}

                    {orderGroup.status === OrderStatus.Delivered && (
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => handleViewDetails({ ...orderGroup, table: orderGroup.table ?? null })}
                      >
                        <Star className='h-4 w-4 mr-2' />
                        Đánh giá
                      </Button>
                    )}

                    {[OrderStatus.Delivered, OrderStatus.Cancelled].includes(
                      orderGroup.status as 'Delivered' | 'Cancelled'
                    ) && (
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => handleReorder({ ...orderGroup, table: orderGroup.table ?? null })}
                      >
                        <RefreshCw className='h-4 w-4 mr-2' />
                        Đặt lại
                      </Button>
                    )}

                    {orderGroup.status !== OrderStatus.Paid && orderGroup.status !== OrderStatus.Cancelled && (
                      <Button
                        size='sm'
                        onClick={() => openPayDialog({ ...orderGroup, table: orderGroup.table ?? null })}
                      >
                        <CreditCard className='h-4 w-4 mr-2' />
                        Thanh toán
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
            <DialogTitle>
              Chi tiết đơn hàng {selectedOrderGroup ? generateOrderNumber(selectedOrderGroup._id) : ''}
            </DialogTitle>
            <DialogDescription>Thông tin chi tiết về đơn hàng của bạn</DialogDescription>
          </DialogHeader>

          {selectedOrderGroup && (
            <div className='space-y-6'>
              {/* Order Status */}
              <div className='flex items-center justify-between p-4 bg-muted rounded-lg'>
                <div>
                  <p className='font-medium'>Trạng thái đơn hàng</p>
                  <p className='text-sm text-muted-foreground'>
                    {selectedOrderGroup ? getStatusInfo(selectedOrderGroup.status).description : ''}
                  </p>
                </div>
                {selectedOrderGroup && (
                  <Badge className={`${getStatusInfo(selectedOrderGroup.status).color} text-white`}>
                    {getStatusInfo(selectedOrderGroup.status).label}
                  </Badge>
                )}
              </div>

              {/* Customer Info */}
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <p className='font-medium text-sm'>Khách hàng</p>
                  <p className='text-sm'>{selectedOrderGroup ? getCustomerInfo(selectedOrderGroup).name : ''}</p>
                  <p className='text-xs text-muted-foreground'>
                    {selectedOrderGroup ? getCustomerInfo(selectedOrderGroup).phone : ''}
                  </p>
                </div>
                <div>
                  <p className='font-medium text-sm'>Loại đơn hàng</p>
                  <p className='text-sm'>
                    {selectedOrderGroup ? getOrderTypeInfo(selectedOrderGroup.order_type).label : ''}
                  </p>
                  <p className='text-xs text-muted-foreground'>
                    {selectedOrderGroup ? formatDateTime(selectedOrderGroup.created_at) : ''}
                  </p>
                </div>
              </div>

              {/* Table Info for dine-in */}
              {selectedOrderGroup.order_type === 'dine-in' && selectedOrderGroup.table && (
                <div className='bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg'>
                  <p className='font-medium text-sm text-blue-800 dark:text-blue-200'>Thông tin bàn</p>
                  <p className='text-sm text-blue-700 dark:text-blue-300'>
                    Bàn số {selectedOrderGroup.table.number} ({selectedOrderGroup.table.capacity} chỗ ngồi)
                  </p>
                </div>
              )}

              {/* Delivery Info */}
              {selectedOrderGroup.order_type === 'delivery' && selectedOrderGroup.delivery && (
                <div className='bg-green-50 dark:bg-green-950/20 p-3 rounded-lg'>
                  <p className='font-medium text-sm text-green-800 dark:text-green-200'>Thông tin giao hàng</p>
                  <div className='text-sm text-green-700 dark:text-green-300 space-y-1'>
                    <p>
                      <span className='font-medium'>Người nhận:</span> {selectedOrderGroup.delivery.receiver_name}
                    </p>
                    <p>
                      <span className='font-medium'>Số điện thoại:</span> {selectedOrderGroup.delivery.receiver_phone}
                    </p>
                    <p>
                      <span className='font-medium'>Địa chỉ:</span> {selectedOrderGroup.delivery.address}
                    </p>
                    {selectedOrderGroup.delivery.notes && (
                      <p>
                        <span className='font-medium'>Ghi chú:</span> {selectedOrderGroup.delivery.notes}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Takeaway Info */}
              {selectedOrderGroup.order_type === 'takeaway' && selectedOrderGroup.takeaway_info && (
                <div className='bg-orange-50 dark:bg-orange-950/20 p-3 rounded-lg'>
                  <p className='font-medium text-sm text-orange-800 dark:text-orange-200'>Thông tin mang về</p>
                  <div className='text-sm text-orange-700 dark:text-orange-300 space-y-1'>
                    <p>
                      <span className='font-medium'>Khách hàng:</span> {selectedOrderGroup.takeaway_info.customer_name}
                    </p>
                    <p>
                      <span className='font-medium'>Số điện thoại:</span>{' '}
                      {selectedOrderGroup.takeaway_info.customer_phone}
                    </p>
                    {selectedOrderGroup.takeaway_info.pickup_time && (
                      <p>
                        <span className='font-medium'>Thời gian lấy:</span>{' '}
                        {formatDateTime(selectedOrderGroup.takeaway_info.pickup_time)}
                      </p>
                    )}
                    {selectedOrderGroup.takeaway_info.notes && (
                      <p>
                        <span className='font-medium'>Ghi chú:</span> {selectedOrderGroup.takeaway_info.notes}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Order Items */}
              <div>
                <h4 className='font-medium mb-3'>Món đã đặt ({selectedOrderGroup.orders.length} món)</h4>
                <div className='space-y-3'>
                  {selectedOrderGroup.orders.map((order) => (
                    <div key={order._id} className='flex items-center gap-3 p-3 border rounded-lg'>
                      <img
                        src={order.dish_snapshot.image}
                        alt={order.dish_snapshot.name}
                        className='w-16 h-16 rounded-lg object-cover'
                      />
                      <div className='flex-1'>
                        <h5 className='font-medium'>{order.dish_snapshot.name}</h5>
                        <p className='text-sm text-muted-foreground'>
                          {order.quantity}x {order.dish_snapshot.price.toLocaleString('vi-VN')}đ
                        </p>
                        {order.dish_snapshot.description && (
                          <p className='text-xs text-muted-foreground'>{order.dish_snapshot.description}</p>
                        )}
                      </div>
                      <div className='text-right'>
                        <p className='font-medium'>
                          {(order.dish_snapshot.price * order.quantity).toLocaleString('vi-VN')}đ
                        </p>
                        <Badge
                          variant='outline'
                          className={`text-xs ${getStatusInfo(order.status).color} text-white border-0`}
                        >
                          {getStatusInfo(order.status).label}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className='border-t pt-4'>
                <div className='space-y-2'>
                  <div className='flex justify-between'>
                    <span>Tạm tính:</span>
                    <span>{calculateTotal(selectedOrderGroup.orders).toLocaleString('vi-VN')}đ</span>
                  </div>
                  <div className='flex justify-between'>
                    <span>Phí vận chuyển:</span>
                    <span>0đ</span>
                  </div>
                  <div className='flex justify-between font-semibold text-lg border-t pt-2'>
                    <span>Tổng cộng:</span>
                    <span>{calculateTotal(selectedOrderGroup.orders).toLocaleString('vi-VN')}đ</span>
                  </div>
                </div>
              </div>

              {/* Review Form for Delivered Orders */}
              {selectedOrderGroup.status === OrderStatus.Delivered && (
                <div className='border-t pt-4'>
                  <h4 className='font-medium mb-3'>Đánh giá đơn hàng</h4>
                  <div className='space-y-3'>
                    <div>
                      <label className='text-sm font-medium'>Đánh giá của bạn:</label>
                      <div className='flex gap-1 mt-1'>
                        {[...Array(5)].map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setRating(i + 1)}
                            className={`h-8 w-8 transition-colors ${
                              i < rating ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-200'
                            }`}
                          >
                            <Star className={`h-6 w-6 ${i < rating ? 'fill-current' : ''}`} />
                          </button>
                        ))}
                      </div>
                      {rating > 0 && <p className='text-xs text-muted-foreground mt-1'>Bạn đã đánh giá {rating} sao</p>}
                    </div>
                    <div>
                      <label className='text-sm font-medium'>Nhận xét:</label>
                      <Textarea
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        placeholder='Chia sẻ trải nghiệm của bạn về món ăn, dịch vụ...'
                        rows={3}
                        className='mt-1'
                      />
                    </div>
                    <Button onClick={handleSubmitReview} className='w-full' disabled={rating === 0}>
                      {rating === 0 ? 'Vui lòng chọn số sao' : 'Gửi đánh giá'}
                    </Button>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className='flex gap-2 pt-4 border-t'>
                <Button variant='outline' onClick={handleClose} className='flex-1'>
                  Đóng
                </Button>
                {selectedOrderGroup.status !== OrderStatus.Delivered &&
                  selectedOrderGroup.status !== OrderStatus.Cancelled && (
                    <Button variant='outline' className='flex-1'>
                      In hóa đơn
                    </Button>
                  )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Pay Dialog */}
      <Dialog open={isPayDialogOpen} onOpenChange={setIsPayDialogOpen}>
        <DialogContent className='max-w-md'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <CreditCard className='h-5 w-5' />
              Thanh toán đơn hàng
            </DialogTitle>
            <DialogDescription>
              Đơn hàng: {selectedOrderGroup ? generateOrderNumber(selectedOrderGroup._id) : ''}
            </DialogDescription>
          </DialogHeader>

          {orderGroupToPay && (
            <div className='space-y-6'>
              {/* Order Summary */}
              <div className='bg-muted p-4 rounded-lg space-y-3'>
                <h4 className='font-medium text-sm'>Chi tiết thanh toán</h4>

                <div className='space-y-2 text-sm'>
                  <div className='flex justify-between'>
                    <span>Tạm tính ({orderGroupToPay.orders.length} món):</span>
                    <span>
                      {orderGroupToPay ? calculateTotal(orderGroupToPay.orders).toLocaleString('vi-VN') : '0'}đ
                    </span>
                  </div>

                  <div className='flex justify-between'>
                    <span>Phí giao hàng:</span>
                    <span>15.000 đ</span>
                  </div>

                  <div className='flex justify-between'>
                    <span>Phí dịch vụ (5%):</span>
                    <span>
                      {orderGroupToPay ? (calculateTotal(orderGroupToPay.orders) * 0.05).toLocaleString('vi-VN') : '0'}đ
                    </span>
                  </div>

                  <div className='flex justify-between text-green-600'>
                    <span>Giảm giá:</span>
                    <span>-0 đ</span>
                  </div>

                  <div className='border-t pt-2 mt-2'>
                    <div className='flex justify-between items-center font-semibold text-base'>
                      <span>Tổng cộng:</span>
                      <span className='text-lg text-primary'>
                        {orderGroupToPay
                          ? (calculateTotal(orderGroupToPay.orders) * 1.05 + 15000).toLocaleString('vi-VN')
                          : '0'}
                        đ
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div>
                <h4 className='font-medium text-sm mb-3'>Chọn phương thức thanh toán</h4>
                <RadioGroup
                  value={selectedPaymentMethod}
                  onValueChange={setSelectedPaymentMethod}
                  disabled={isProcessing}
                >
                  {Object.entries(paymentMethodConfig).map(([key, info]) => {
                    const IconComp = info.icon
                    return (
                      <label
                        key={key}
                        className={`flex items-start space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedPaymentMethod === key ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                        } 
                      ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <RadioGroupItem value={key} className='mt-1' />
                        <div className='flex items-start gap-3 flex-1'>
                          <IconComp className='h-5 w-5 mt-0.5 text-muted-foreground' />
                          <div className='space-y-1'>
                            <p className='font-medium text-sm'>{info.label}</p>
                          </div>
                        </div>
                      </label>
                    )
                  })}
                </RadioGroup>
              </div>

              {/* Special Instructions for certain payment methods */}
              {selectedPaymentMethod === 'banking' && (
                <div className='bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg text-sm'>
                  <p className='font-medium text-blue-800 dark:text-blue-200 mb-2'>Thông tin chuyển khoản:</p>
                  <div className='text-blue-700 dark:text-blue-300 space-y-1'>
                    <p>• Ngân hàng: Vietcombank</p>
                    <p>• Số TK: 1234567890</p>
                    <p>• Tên TK: RESTAURANT ABC</p>
                    <p>• Nội dung: {generateOrderNumber(orderGroupToPay._id)}</p>
                  </div>
                </div>
              )}

              {selectedPaymentMethod === 'momo' && (
                <div className='bg-pink-50 dark:bg-pink-950/20 p-3 rounded-lg text-sm'>
                  <p className='font-medium text-pink-800 dark:text-pink-200 mb-1'>Thanh toán MoMo:</p>
                  <p className='text-pink-700 dark:text-pink-300'>Quét mã QR hoặc chuyển khoản đến số: 0123456789</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className='flex gap-3'>
                <Button variant='outline' onClick={handleClose} className='flex-1' disabled={isProcessing}>
                  Hủy
                </Button>
                <Button onClick={confirmPay} className='flex-1' disabled={isProcessing}>
                  {isProcessing ? (
                    <>
                      <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2' />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <CreditCard className='h-4 w-4 mr-2' />
                      Xác nhận thanh toán
                    </>
                  )}
                </Button>
              </div>

              {/* Security Notice */}
              <div className='text-xs text-muted-foreground text-center border-t pt-3'>
                🔒 Thông tin thanh toán được bảo mật và mã hóa
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
