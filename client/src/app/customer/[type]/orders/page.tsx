/* eslint-disable @next/next/no-img-element */
'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  XCircle,
  Package,
  MapPin,
  Star,
  RefreshCw,
  Eye,
  MessageCircle,
  Search,
  CreditCard,
  Truck,
  Calendar
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { OrderStatus } from '@/constants/type'
import { GetOrderDetailResType, PayOrdersResType, UpdateOrderResType } from '@/schemaValidations/order.schema'
import { useGetOrderListQuery, usePayOrderMutation } from '@/queries/useOrder'
import { useAccountMe } from '@/queries/useAccount'
import { toast } from 'sonner'
import { useAppContext } from '@/components/app-provider'
import { formatDateForDisplay, getOrderStatus, getTodayDate } from '@/lib/utils'
import { useGetLoyaltyQuery } from '@/queries/useLoyalty'
import { usePromotionListQuery } from '@/queries/usePromotion'
import { useCustomerUsedPromotionMutation, useGetCustomerPromotionQuery } from '@/queries/useCustomerPromotion'
import { calculateFinalAmount, calculateTotalDiscount } from '@/lib/promotion-utils'
import { PromotionResType } from '@/schemaValidations/promotion.schema'
import { useCreateRevenueMutation } from '@/queries/useRevenue'
import {
  OrderGroupForPayment,
  orderTypeConfig,
  paymentMethodConfig,
  PaymentOrders,
  statusConfig
} from '@/app/customer/[type]/orders/type'
import { useGetDishReviewsByMeQuery } from '@/queries/useDishReview'
import DishReviewForm from '@/components/dish-review-form'
import ExistingReview from '@/components/existing-review'

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
  const [isPayDialogOpen, setIsPayDialogOpen] = useState(false)
  const [ordersToPay, setOrdersToPay] = useState<PaymentOrders | null>(null)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('cash')
  const [sortBy, setSortBy] = useState('newest')
  const { data: dishReviewByUser } = useGetDishReviewsByMeQuery(Boolean(user))
  const [reviewingDish, setReviewingDish] = useState<{ id: string; name: string } | null>(null)

  // Date filter states - default to today
  const [fromDate, setFromDate] = useState(getTodayDate())
  const [toDate, setToDate] = useState(getTodayDate())
  const [dateFilterPreset, setDateFilterPreset] = useState('today')

  const { socket } = useAppContext()
  const { data } = useGetLoyaltyQuery({ customerId: user?._id as string, enabled: Boolean(user) })
  const promotionListQuery = usePromotionListQuery()
  const promotions = useMemo(() => promotionListQuery.data?.payload.result ?? [], [promotionListQuery.data])
  const { data: customerPromotionsQuery } = useGetCustomerPromotionQuery({
    enabled: Boolean(user),
    customerId: user?._id as string
  })

  const createRevenueMutation = useCreateRevenueMutation()

  const loyaltyPoints = data?.payload.result.loyalty_points || 0
  const userVisits = data?.payload.result.visit_count || 0

  // Get used promotions from customer promotions
  const usedPromotions = useMemo(() => {
    const result = customerPromotionsQuery?.payload.result
    return Array.isArray(result) ? result.filter((promo) => promo.used === true) : []
  }, [customerPromotionsQuery])

  // Get unused promotions from customer promotions
  const customerPromotions = useMemo(() => {
    const result = customerPromotionsQuery?.payload.result
    return Array.isArray(result) ? result.filter((promo) => promo.used === false) : []
  }, [customerPromotionsQuery])

  // Get available promotions (unused ones)
  const usePromotions = useMemo(() => {
    type CustomerPromotionType = { promotion_id: string } | string
    const customerPromotionIds = Array.isArray(customerPromotions)
      ? (customerPromotions as CustomerPromotionType[]).map((promo) =>
          typeof promo === 'string' ? promo : promo.promotion_id
        )
      : []
    return promotions.filter((promotion) => customerPromotionIds.includes(promotion._id))
  }, [promotions, customerPromotions])

  const useCustomerUsedPromotion = useCustomerUsedPromotionMutation()

  // Enhanced promotion mapping functions
  type CustomerPromotionType = { promotion_id: string; order_group_ids?: string[]; used?: boolean } | string
  const getPromotionsForOrderGroup = (
    orderGroupId: string,
    usedPromotions: CustomerPromotionType[],
    allPromotions: PromotionResType['result'][]
  ): PromotionResType['result'][] => {
    const relevantUsedPromotions = usedPromotions.filter(
      (usedPromo) =>
        typeof usedPromo === 'object' &&
        'order_group_ids' in usedPromo &&
        Array.isArray(usedPromo.order_group_ids) &&
        usedPromo.order_group_ids.includes(orderGroupId)
    )

    const promotionIds = relevantUsedPromotions.map((usedPromo) =>
      typeof usedPromo === 'string' ? usedPromo : usedPromo.promotion_id
    )

    return allPromotions.filter((promotion) => promotionIds.includes(promotion._id))
  }

  const calculateDiscountForSpecificOrderGroup = (
    orderGroup: GetOrderDetailResType['result'],
    orderPromotions: PromotionResType['result'][]
  ): { discount: number; appliedPromotions: string[] } => {
    if (orderPromotions.length === 0) {
      return { discount: 0, appliedPromotions: [] }
    }

    const orderTotal = calculateTotal(orderGroup.orders)
    const dishItems = orderGroup.orders.map((order) => ({
      id: order.dish_snapshot._id,
      price: order.dish_snapshot.price
    }))

    const discountResult = calculateTotalDiscount(
      orderPromotions,
      orderTotal,
      loyaltyPoints,
      dishItems,
      userVisits,
      orderType
    )

    return {
      discount: discountResult.discount,
      appliedPromotions: orderPromotions.map((promo) => promo._id)
    }
  }

  // Update query params to include date filters
  const queryParams = useMemo(
    () => ({
      order_type: orderType,
      customer_id: user?._id,
      fromDate: new Date(fromDate + 'T00:00:00'),
      toDate: new Date(toDate + 'T23:59:59')
    }),
    [orderType, user?._id, fromDate, toDate]
  )

  const { data: ordersResponse, isLoading, refetch } = useGetOrderListQuery(queryParams)

  // Get orders from API response
  const orderGroups = useMemo(() => ordersResponse?.payload?.result || [], [ordersResponse])

  const unpaidOrders = useMemo(
    () => orderGroups.filter((order) => order.status !== OrderStatus.Paid && order.status !== OrderStatus.Cancelled),
    [orderGroups]
  )

  // Function to calculate total for orders
  const calculateTotal = (orders: GetOrderDetailResType['result']['orders']) => {
    return orders.reduce((total, order) => {
      return total + order.dish_snapshot.price * order.quantity
    }, 0)
  }

  // Enhanced functions for paid orders using specific order promotions
  const calculateDiscountForPaidOrder = (
    orderGroup: GetOrderDetailResType['result']
  ): { discount: number; appliedPromotions: string[] } => {
    // Get promotions specifically used for this order group
    const orderPromotions = getPromotionsForOrderGroup(orderGroup._id, usedPromotions, promotions)

    return calculateDiscountForSpecificOrderGroup(orderGroup, orderPromotions)
  }

  const calculateFinalAmountForPaidOrder = (orderGroup: GetOrderDetailResType['result']) => {
    const originalTotal = calculateTotal(orderGroup.orders)
    const { discount } = calculateDiscountForPaidOrder(orderGroup)
    return Math.max(0, originalTotal - discount)
  }

  // Functions for unpaid orders (using available promotions)
  const calculateTotalAmount = (
    price: number,
    promotion: PromotionResType['result'][],
    dishItems: {
      id: string
      price: number
    }[]
  ) => {
    return {
      finalAmount: calculateFinalAmount(price, promotion, loyaltyPoints, dishItems, userVisits, orderType),
      promotionApplies: promotion.map((promo) => promo._id)
    }
  }

  const calculateTotalDiscountValue = (
    price: number,
    promotion: PromotionResType['result'][],
    dishItems: {
      id: string
      price: number
    }[]
  ) => {
    return calculateTotalDiscount(promotion, price, loyaltyPoints, dishItems, userVisits, orderType)
  }

  // Date preset handler
  const handleDatePreset = (preset: string) => {
    setDateFilterPreset(preset)
    const today = new Date()

    switch (preset) {
      case 'today':
        setFromDate(getTodayDate())
        setToDate(getTodayDate())
        break
      case 'yesterday':
        const yesterday = new Date(today)
        yesterday.setDate(today.getDate() - 1)
        const yesterdayStr = yesterday.toISOString().split('T')[0]
        setFromDate(yesterdayStr)
        setToDate(yesterdayStr)
        break
      case 'last7days':
        const last7Days = new Date(today)
        last7Days.setDate(today.getDate() - 6)
        setFromDate(last7Days.toISOString().split('T')[0])
        setToDate(getTodayDate())
        break
      case 'last30days':
        const last30Days = new Date(today)
        last30Days.setDate(today.getDate() - 29)
        setFromDate(last30Days.toISOString().split('T')[0])
        setToDate(getTodayDate())
        break
      case 'thisMonth':
        const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1)
        setFromDate(thisMonthStart.toISOString().split('T')[0])
        setToDate(getTodayDate())
        break
      case 'custom':
        // Keep current dates for custom selection
        break
    }
  }

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

  // Helper function to get all order groups from PaymentOrders
  const getAllOrderGroups = (paymentOrders: PaymentOrders): OrderGroupForPayment[] => {
    if (Array.isArray(paymentOrders)) {
      return paymentOrders
    }
    return [paymentOrders]
  }

  // Helper function to calculate total for multiple orders
  const calculateTotalForOrders = (paymentOrders: PaymentOrders): number => {
    const orderGroups = getAllOrderGroups(paymentOrders)
    return orderGroups.reduce((total, orderGroup) => total + calculateTotal(orderGroup.orders), 0)
  }

  // Helper function to calculate discount for multiple orders
  const calculateTotalDiscountForOrders = (paymentOrders: PaymentOrders): number => {
    const orderGroups = getAllOrderGroups(paymentOrders)
    return orderGroups.reduce((total, orderGroup) => {
      const orderTotal = calculateTotal(orderGroup.orders)
      const dishItems = orderGroup.orders.map((order) => ({
        id: order.dish_snapshot._id,
        price: order.dish_snapshot.price
      }))
      return total + calculateTotalDiscountValue(orderTotal, usePromotions, dishItems).discount
    }, 0)
  }

  // Helper function to calculate final amount for multiple orders
  const calculateFinalAmountForOrders = (
    paymentOrders: PaymentOrders
  ): { finalAmount: number; promotionApplies: string[] } => {
    const orderGroups = getAllOrderGroups(paymentOrders)

    // Initialize accumulator with proper structure
    const initialValue = { finalAmount: 0, promotionApplies: [] as string[] }

    return orderGroups.reduce((total, orderGroup) => {
      const orderTotal = calculateTotal(orderGroup.orders)
      const dishItems = orderGroup.orders.map((order) => ({
        id: order.dish_snapshot._id,
        price: order.dish_snapshot.price
      }))

      const orderResult = calculateTotalAmount(orderTotal, usePromotions, dishItems)

      return {
        finalAmount: total.finalAmount + orderResult.finalAmount.finalAmount,
        promotionApplies: [...total.promotionApplies, ...orderResult.promotionApplies]
      }
    }, initialValue)
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
    return { name: 'Customer', phone: '' }
  }

  const handleViewDetails = (orderGroup: GetOrderDetailResType['result']) => {
    setSelectedOrderGroup(orderGroup)
    setIsDetailDialogOpen(true)
  }

  console.log('dishReviewByUser', dishReviewByUser)

  const hasUserReview = (dishId: string) => {
    const hasReview =
      dishReviewByUser?.payload.result.reviews.some((review) => {
        return review.dish_id === dishId
      }) ?? false
    return hasReview
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

  // Updated to handle both single and multiple orders
  const openPayDialog = (orders: PaymentOrders) => {
    setOrdersToPay(orders)
    setSelectedPaymentMethod('cash')
    setIsPayDialogOpen(true)
  }

  // Updated to handle payment for multiple orders
  const confirmPay = async () => {
    if (!ordersToPay) return

    try {
      const result = await payOrder({
        is_customer: true,
        customer_id: user?._id
      })

      // Create revenue record
      const { finalAmount, promotionApplies } = calculateFinalAmountForOrders(ordersToPay)
      await createRevenueMutation.mutateAsync({
        total_amount: finalAmount,
        customer_id: user?._id as string
      })

      await Promise.all(
        promotionApplies.map((promo) =>
          useCustomerUsedPromotion.mutateAsync({
            customer_id: user?._id as string,
            promotion_id: promo,
            order_group_ids: getAllOrderGroups(ordersToPay).map((order) => order._id)
          })
        )
      )

      const orderCount = Array.isArray(ordersToPay) ? ordersToPay.length : 1
      toast.success(result.payload.message || `Successfully paid for ${orderCount} order${orderCount > 1 ? 's' : ''}!`)

      setIsPayDialogOpen(false)
      setOrdersToPay(null)
      refetch()
    } catch (error) {
      toast.error('Payment failed. Please try again.')
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
        description: `The item ${name} (SL: ${quantity}) has just been updated with the status "${getOrderStatus(
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
    setOrdersToPay(null)
  }

  if (isLoading || isUserLoading) {
    return (
      <div className='container mx-auto px-4 py-6'>
        <div className='flex items-center justify-center h-64'>
          <div className='text-center'>
            <RefreshCw className='h-8 w-8 animate-spin mx-auto mb-4' />
            <p>Loading orders...</p>
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

      {/* Date Filter Section */}
      <Card className='mb-6'>
        <CardHeader>
          <CardTitle className='text-lg flex items-center gap-2'>
            <Calendar className='h-5 w-5' />
            Filter by Date
          </CardTitle>
          <CardDescription>
            Currently showing orders from {formatDateForDisplay(fromDate)}
            {fromDate !== toDate && ` to ${formatDateForDisplay(toDate)}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {/* Date Presets */}
            <div className='flex flex-wrap gap-2'>
              {[
                { value: 'today', label: 'Today' },
                { value: 'yesterday', label: 'Yesterday' },
                { value: 'last7days', label: 'Last 7 Days' },
                { value: 'last30days', label: 'Last 30 Days' },
                { value: 'thisMonth', label: 'This Month' },
                { value: 'custom', label: 'Custom Range' }
              ].map((preset) => (
                <Button
                  key={preset.value}
                  variant={dateFilterPreset === preset.value ? 'default' : 'outline'}
                  size='sm'
                  onClick={() => handleDatePreset(preset.value)}
                >
                  {preset.label}
                </Button>
              ))}
            </div>

            {/* Custom Date Range */}
            {dateFilterPreset === 'custom' && (
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <label className='text-sm font-medium'>From Date</label>
                  <Input type='date' value={fromDate} onChange={(e) => setFromDate(e.target.value)} max={toDate} />
                </div>
                <div className='space-y-2'>
                  <label className='text-sm font-medium'>To Date</label>
                  <Input
                    type='date'
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    min={fromDate}
                    max={getTodayDate()}
                  />
                </div>
              </div>
            )}

            {/* Quick Stats */}
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t'>
              <div className='text-center'>
                <div className='text-2xl font-bold text-primary'>{filteredOrderGroups.length}</div>
                <div className='text-xs text-muted-foreground'>Total Orders</div>
              </div>
              <div className='text-center'>
                <div className='text-2xl font-bold text-green-600'>
                  {filteredOrderGroups.filter((order) => order.status === OrderStatus.Delivered).length}
                </div>
                <div className='text-xs text-muted-foreground'>Delivered</div>
              </div>
              <div className='text-center'>
                <div className='text-2xl font-bold text-yellow-600'>
                  {filteredOrderGroups.filter((order) => order.status === OrderStatus.Pending).length}
                </div>
                <div className='text-xs text-muted-foreground'>Pending</div>
              </div>
              <div className='text-center'>
                <div className='text-2xl font-bold text-purple-600'>
                  {filteredOrderGroups
                    .reduce((total, orderGroup) => {
                      // Apply different calculation based on payment status
                      if (orderGroup.status === OrderStatus.Paid) {
                        return (
                          total + calculateFinalAmountForPaidOrder({ ...orderGroup, table: orderGroup.table ?? null })
                        )
                      } else {
                        return total + calculateTotal(orderGroup.orders)
                      }
                    }, 0)
                    .toLocaleString('vi-VN')}
                  đ
                </div>
                <div className='text-xs text-muted-foreground'>Total Value</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Promotions & Bulk Payment Section */}
      {usePromotions.length > 0 && (
        <Card className='mb-8 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200 dark:border-purple-800'>
          <CardHeader>
            <CardTitle className='text-lg flex items-center gap-2'>
              <Star className='h-5 w-5 text-purple-600' />
              Available Promotions
            </CardTitle>
            <CardDescription>
              You have {usePromotions.length} available promotion(s) for upcoming orders
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              {usePromotions.map((promotion) => (
                <div
                  key={promotion._id}
                  className='flex items-center justify-between p-3 bg-white dark:bg-gray-900 rounded-lg border border-purple-200 dark:border-purple-800'
                >
                  <div className='flex items-center gap-3'>
                    <div className='w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center'>
                      <Star className='h-5 w-5 text-purple-600' />
                    </div>
                    <div>
                      <h4 className='font-medium text-sm'>{promotion.name}</h4>
                      <p className='text-xs text-muted-foreground'>{promotion.description}</p>
                    </div>
                  </div>
                  <Badge
                    variant='secondary'
                    className='bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                  >
                    {promotion.discount_type === 'percentage'
                      ? `${promotion.discount_value ?? 0}% OFF`
                      : `${(promotion.discount_value ?? 0).toLocaleString('vi-VN')}đ OFF`}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filters */}
      <div className='flex flex-col md:flex-row gap-4 mb-8'>
        <div className='relative flex-1'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4' />
          <Input
            placeholder='Search for orders...'
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
          <TabsTrigger value='all'>All</TabsTrigger>
          <TabsTrigger value={OrderStatus.Pending}>Waiting for confirmation</TabsTrigger>
          <TabsTrigger value={OrderStatus.Processing}>Processing</TabsTrigger>
          <TabsTrigger value={OrderStatus.Delivered}>Delivered</TabsTrigger>
          <TabsTrigger value={OrderStatus.Cancelled}>Cancelled</TabsTrigger>
          <TabsTrigger value={OrderStatus.Paid}>Paid</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Orders List */}
      <div className='space-y-6'>
        {filteredOrderGroups.length === 0 ? (
          <Card>
            <CardContent className='text-center py-12'>
              <Package className='h-12 w-12 mx-auto text-muted-foreground mb-4' />
              <h3 className='text-lg font-medium mb-2'>No orders found</h3>
              <p className='text-muted-foreground mb-4'>
                {searchQuery ? 'No matching orders found' : 'You have no orders in this category'}
              </p>
              <Button onClick={() => router.push('/menu')}>Order now</Button>
            </CardContent>
          </Card>
        ) : (
          filteredOrderGroups.map((orderGroup) => {
            const statusInfo = getStatusInfo(orderGroup.status)
            const orderTypeInfo = getOrderTypeInfo(orderGroup.order_type)
            const customerInfo = getCustomerInfo({ ...orderGroup, table: orderGroup.table ?? null })

            // Get promotions for this specific order
            const orderPromotions = getPromotionsForOrderGroup(orderGroup._id, usedPromotions, promotions)

            // Calculate different totals based on order status
            const originalTotal = calculateTotal(orderGroup.orders)
            let displayTotal = originalTotal
            let discount = 0

            if (orderGroup.status === OrderStatus.Paid && orderPromotions.length > 0) {
              const discountResult = calculateDiscountForSpecificOrderGroup(
                { ...orderGroup, table: orderGroup.table ?? null },
                orderPromotions
              )
              discount = discountResult.discount
              displayTotal = Math.max(0, originalTotal - discount)
            }

            const orderNumber = generateOrderNumber(orderGroup._id)
            const StatusIcon = statusInfo.icon
            const OrderTypeIcon = orderTypeInfo.icon

            return (
              <Card key={orderGroup._id} className='overflow-hidden hover:shadow-lg transition-shadow'>
                <CardHeader className='pb-4'>
                  <div className='flex items-start justify-between'>
                    <div className='space-y-2'>
                      <CardTitle className='text-lg'>{orderNumber}</CardTitle>
                      <div className='flex items-center gap-2 flex-wrap'>
                        <Badge className={orderTypeInfo.color}>{orderTypeInfo.label}</Badge>
                        <Badge className={`${statusInfo.color} text-white`}>
                          <StatusIcon className='h-3 w-3 mr-1' />
                          {statusInfo.label}
                        </Badge>

                        {/* Show promotions used for this order */}
                        {orderPromotions.length > 0 && (
                          <div className='flex gap-1 flex-wrap'>
                            {orderPromotions.map((promo) => (
                              <Badge
                                key={promo._id}
                                variant='secondary'
                                className='bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              >
                                {promo.name}
                              </Badge>
                            ))}
                          </div>
                        )}
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
                    <h4 className='font-medium text-sm'>Ordered items ({orderGroup.orders.length} items):</h4>
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
                          and {orderGroup.orders.length - 3} other items...
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Enhanced promotion display section */}
                  {orderPromotions.length > 0 && (
                    <div className='bg-green-50 dark:bg-green-950/20 p-3 rounded-lg border border-green-200'>
                      <div className='flex items-start gap-2 mb-2'>
                        <Star className='h-4 w-4 text-green-600 mt-0.5' />
                        <div className='flex-1'>
                          <p className='font-medium text-sm text-green-800 dark:text-green-200'>Applied Promotions</p>
                          <div className='space-y-1 mt-1'>
                            {orderPromotions.map((promo) => (
                              <div key={promo._id} className='text-xs text-green-700 dark:text-green-300'>
                                • {promo.name} -{' '}
                                {promo.discount_type === 'percentage'
                                  ? `${promo.discount_value}% OFF`
                                  : `${promo.discount_value?.toLocaleString('vi-VN')}đ OFF`}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

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
                            Deliver to: {orderGroup.delivery.receiver_name}
                          </p>
                          <p className='text-sm text-green-700 dark:text-green-300'>{orderGroup.delivery.address}</p>
                          <p className='text-xs text-green-600 dark:text-green-400'>
                            Phone: {orderGroup.delivery.receiver_phone}
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
                            Customer: {orderGroup.takeaway_info.customer_name}
                          </p>
                          <p className='text-xs text-orange-600 dark:text-orange-400'>
                            Phone: {orderGroup.takeaway_info.customer_phone}
                          </p>
                          {orderGroup.takeaway_info.pickup_time && (
                            <p className='text-xs text-orange-600 dark:text-orange-400'>
                              Pickup time: {formatDateTime(orderGroup.takeaway_info.pickup_time)}
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
                        <span className='font-medium'>Note:</span>{' '}
                        {orderGroup.delivery?.notes || orderGroup.takeaway_info?.notes}
                      </p>
                    </div>
                  )}

                  {/* Enhanced order total display */}
                  <div className='flex items-center justify-between pt-2 border-t'>
                    <div>
                      {orderGroup.status === OrderStatus.Paid && discount > 0 ? (
                        <div className='space-y-1'>
                          <div className='text-sm text-muted-foreground line-through'>
                            Original: {originalTotal.toLocaleString('vi-VN')}đ
                          </div>
                          <div className='font-semibold text-lg text-green-600'>
                            Final: {displayTotal.toLocaleString('vi-VN')}đ
                          </div>
                          <div className='text-xs text-green-600'>
                            Saved: {discount.toLocaleString('vi-VN')}đ
                            {orderPromotions.length > 0 && (
                              <span className='ml-1'>({orderPromotions.map((p) => p.name).join(', ')})</span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div>
                          <span className='font-semibold text-lg'>{displayTotal.toLocaleString('vi-VN')}đ</span>
                          <div className='text-sm text-muted-foreground'>
                            {orderGroup.status === OrderStatus.Paid ? (
                              <span className='text-green-600'>Paid</span>
                            ) : (
                              <span className='text-yellow-600'>Unpaid</span>
                            )}
                          </div>
                        </div>
                      )}
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
                      Details
                    </Button>

                    {orderGroup.status === OrderStatus.Pending && (
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => handleCancelOrder(orderGroup._id)}
                        className='text-destructive hover:text-destructive'
                      >
                        <XCircle className='h-4 w-4 mr-2' />
                        Cancel
                      </Button>
                    )}

                    {orderGroup.status === OrderStatus.Delivered && (
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => handleViewDetails({ ...orderGroup, table: orderGroup.table ?? null })}
                      >
                        <Star className='h-4 w-4 mr-2' />
                        Rate
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
                        Reorder
                      </Button>
                    )}

                    {orderGroup.status !== OrderStatus.Paid && orderGroup.status !== OrderStatus.Cancelled && (
                      <Button
                        size='sm'
                        onClick={() => openPayDialog({ ...orderGroup, table: orderGroup.table ?? null })}
                      >
                        <CreditCard className='h-4 w-4 mr-2' />
                        Payment
                      </Button>
                    )}

                    <Button variant='outline' size='sm'>
                      <MessageCircle className='h-4 w-4 mr-2' />
                      Contact Support
                    </Button>

                    {orderGroup.order_type === 'delivery' && (
                      <Button
                        variant='outline'
                        onClick={() => router.push(`/customer/delivery/orders/tracking/${orderGroup._id}`)}
                      >
                        <Truck className='h-4 w-4 mr-2' />
                        Track Delivery
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* Bulk Payment Section - Only for unpaid orders */}
      {unpaidOrders.length > 0 && (
        <Card className='mt-8 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 border-green-200 dark:border-green-800'>
          <CardHeader>
            <CardTitle className='text-lg flex items-center gap-2'>
              <CreditCard className='h-5 w-5 text-green-600' />
              Bulk Payment
            </CardTitle>
            <CardDescription>Pay for all unpaid orders at once</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {/* Payment Summary */}
              <div className='bg-white dark:bg-gray-900 p-4 rounded-lg border border-green-200 dark:border-green-800'>
                <div className='flex justify-between items-center mb-3'>
                  <span className='text-sm font-medium'>Unpaid Orders:</span>
                  <span className='text-sm'>{unpaidOrders.length} orders</span>
                </div>
                <div className='flex justify-between items-center mb-3'>
                  <span className='text-sm font-medium'>Subtotal:</span>
                  <span className='text-sm'>
                    {unpaidOrders
                      .reduce((total, orderGroup) => total + calculateTotal(orderGroup.orders), 0)
                      .toLocaleString('vi-VN')}
                    đ
                  </span>
                </div>
                {orderType === 'delivery' && (
                  <div className='flex justify-between items-center mb-3'>
                    <span className='text-sm font-medium'>Delivery Fee:</span>
                    <span className='text-sm'>{(15000).toLocaleString('vi-VN')}đ</span>
                  </div>
                )}

                {usePromotions.length > 0 && (
                  <div className='flex justify-between items-center mb-3 text-green-600'>
                    <span className='text-sm font-medium'>Total Discount:</span>
                    <span className='text-sm'>
                      -{calculateTotalDiscountForOrders(unpaidOrders as PaymentOrders).toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                )}
                <div className='border-t pt-3'>
                  <div className='flex justify-between items-center'>
                    <span className='font-semibold'>Final Total:</span>
                    <span className='font-semibold text-lg text-green-600'>
                      {calculateFinalAmountForOrders(unpaidOrders as PaymentOrders).finalAmount.toLocaleString('vi-VN')}
                      đ
                    </span>
                  </div>
                </div>
              </div>

              {/* Bulk Payment Button */}
              <Button
                size='lg'
                className='w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700'
                disabled={isProcessing}
                onClick={() => {
                  if (unpaidOrders.length > 0) {
                    openPayDialog(unpaidOrders as PaymentOrders)
                  }
                }}
              >
                {isProcessing ? (
                  <>
                    <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2' />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className='h-5 w-5 mr-2' />
                    Pay All Orders ({unpaidOrders.length})
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Order Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className='max-w-2xl max-h-[80vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>
              Order Details {selectedOrderGroup ? generateOrderNumber(selectedOrderGroup._id) : ''}
            </DialogTitle>
            <DialogDescription>Information about your order</DialogDescription>
          </DialogHeader>

          {selectedOrderGroup && (
            <div className='space-y-6'>
              {/* Order Status */}
              <div className='flex items-center justify-between p-4 bg-muted rounded-lg'>
                <div>
                  <p className='font-medium'>Order Status</p>
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
                  <p className='font-medium text-sm'>Customer</p>
                  <p className='text-sm'>{selectedOrderGroup ? getCustomerInfo(selectedOrderGroup).name : ''}</p>
                  <p className='text-xs text-muted-foreground'>
                    {selectedOrderGroup ? getCustomerInfo(selectedOrderGroup).phone : ''}
                  </p>
                </div>
                <div>
                  <p className='font-medium text-sm'>Order Type</p>
                  <p className='text-sm'>
                    {selectedOrderGroup ? getOrderTypeInfo(selectedOrderGroup.order_type).label : ''}
                  </p>
                  <p className='text-xs text-muted-foreground'>
                    {selectedOrderGroup ? formatDateTime(selectedOrderGroup.created_at) : ''}
                  </p>
                </div>
              </div>

              {/* Enhanced promotion details section */}
              {selectedOrderGroup &&
                (() => {
                  const orderPromotions = getPromotionsForOrderGroup(selectedOrderGroup._id, usedPromotions, promotions)

                  return orderPromotions.length > 0 ? (
                    <div className='bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border border-green-200'>
                      <h4 className='font-medium text-sm text-green-800 dark:text-green-200 mb-3'>
                        Applied Promotions
                      </h4>
                      <div className='space-y-3'>
                        {orderPromotions.map((promo) => (
                          <div key={promo._id} className='flex items-start justify-between'>
                            <div>
                              <p className='font-medium text-sm text-green-700 dark:text-green-300'>{promo.name}</p>
                              <p className='text-xs text-green-600 dark:text-green-400'>{promo.description}</p>
                            </div>
                            <Badge className='bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'>
                              {promo.discount_type === 'percentage'
                                ? `${promo.discount_value}% OFF`
                                : `${promo.discount_value?.toLocaleString('vi-VN')}đ OFF`}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null
                })()}

              {/* Table Info for dine-in */}
              {selectedOrderGroup.order_type === 'dine-in' && selectedOrderGroup.table && (
                <div className='bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg'>
                  <p className='font-medium text-sm text-blue-800 dark:text-blue-200'>Table Information</p>
                  <p className='text-sm text-blue-700 dark:text-blue-300'>
                    Table No. {selectedOrderGroup.table.number} ({selectedOrderGroup.table.capacity} seats)
                  </p>
                </div>
              )}

              {/* Delivery Info */}
              {selectedOrderGroup.order_type === 'delivery' && selectedOrderGroup.delivery && (
                <div className='bg-green-50 dark:bg-green-950/20 p-3 rounded-lg'>
                  <p className='font-medium text-sm text-green-800 dark:text-green-200'>Delivery Information</p>
                  <div className='text-sm text-green-700 dark:text-green-300 space-y-1'>
                    <p>
                      <span className='font-medium'>Recipient:</span> {selectedOrderGroup.delivery.receiver_name}
                    </p>
                    <p>
                      <span className='font-medium'>Phone Number:</span> {selectedOrderGroup.delivery.receiver_phone}
                    </p>
                    <p>
                      <span className='font-medium'>Address:</span> {selectedOrderGroup.delivery.address}
                    </p>
                    {selectedOrderGroup.delivery.notes && (
                      <p>
                        <span className='font-medium'>Notes:</span> {selectedOrderGroup.delivery.notes}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Takeaway Info */}
              {selectedOrderGroup.order_type === 'takeaway' && selectedOrderGroup.takeaway_info && (
                <div className='bg-orange-50 dark:bg-orange-950/20 p-3 rounded-lg'>
                  <p className='font-medium text-sm text-orange-800 dark:text-orange-200'>Takeaway Information</p>
                  <div className='text-sm text-orange-700 dark:text-orange-300 space-y-1'>
                    <p>
                      <span className='font-medium'>Customer:</span> {selectedOrderGroup.takeaway_info.customer_name}
                    </p>
                    <p>
                      <span className='font-medium'>Phone Number:</span>{' '}
                      {selectedOrderGroup.takeaway_info.customer_phone}
                    </p>
                    {selectedOrderGroup.takeaway_info.pickup_time && (
                      <p>
                        <span className='font-medium'>Pickup Time:</span>{' '}
                        {formatDateTime(selectedOrderGroup.takeaway_info.pickup_time)}
                      </p>
                    )}
                    {selectedOrderGroup.takeaway_info.notes && (
                      <p>
                        <span className='font-medium'>Notes:</span> {selectedOrderGroup.takeaway_info.notes}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Order Items */}
              <div>
                <h4 className='font-medium mb-3'>Ordered Items ({selectedOrderGroup.orders.length} items)</h4>
                <div className='space-y-3'>
                  {selectedOrderGroup.orders.map((order) => (
                    <div key={order._id}>
                      {' '}
                      <div className='flex items-center gap-3 p-3 border rounded-lg'>
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
                          <div className='mt-2 flex items-center gap-2 justify-end'>
                            <Badge
                              variant='outline'
                              className={`text-xs ${getStatusInfo(order.status).color} text-white border-0`}
                            >
                              {getStatusInfo(order.status).label}
                            </Badge>

                            {order.status === OrderStatus.Paid &&
                              order.dish_snapshot.dish_id &&
                              !hasUserReview(order.dish_snapshot.dish_id) && (
                                <Button
                                  size='sm'
                                  variant='outline'
                                  onClick={() =>
                                    setReviewingDish({
                                      id: order.dish_snapshot.dish_id ?? '',
                                      name: order.dish_snapshot.name
                                    })
                                  }
                                  className='text-xs px-2 py-1 h-auto'
                                >
                                  <Star size={12} className='mr-1' />
                                  Rate
                                </Button>
                              )}
                          </div>
                        </div>
                      </div>
                      {order.status === OrderStatus.Paid && (
                        <ExistingReview dishId={order.dish_snapshot.dish_id ?? ''} userId={user?._id} />
                      )}
                    </div>
                  ))}
                </div>
                {reviewingDish && (
                  <DishReviewForm
                    dishId={reviewingDish.id}
                    dishName={reviewingDish.name}
                    onClose={() => setReviewingDish(null)}
                  />
                )}
              </div>

              {/* Enhanced order summary */}
              <div className='border-t pt-4'>
                <div className='space-y-2'>
                  <div className='flex justify-between'>
                    <span>Subtotal:</span>
                    <span>{calculateTotal(selectedOrderGroup.orders).toLocaleString('vi-VN')}đ</span>
                  </div>

                  {/* Show specific discount for this order */}
                  {selectedOrderGroup.status === OrderStatus.Paid &&
                    (() => {
                      const orderPromotions = getPromotionsForOrderGroup(
                        selectedOrderGroup._id,
                        usedPromotions,
                        promotions
                      )

                      if (orderPromotions.length > 0) {
                        const discountResult = calculateDiscountForSpecificOrderGroup(
                          selectedOrderGroup,
                          orderPromotions
                        )
                        return discountResult.discount > 0 ? (
                          <>
                            <div className='flex justify-between text-green-600'>
                              <span>Applied Discount:</span>
                              <span>-{discountResult.discount.toLocaleString('vi-VN')}đ</span>
                            </div>
                            <div className='text-xs text-muted-foreground'>
                              From: {orderPromotions.map((promo) => promo.name).join(', ')}
                            </div>
                          </>
                        ) : null
                      }
                      return null
                    })()}

                  <div className='flex justify-between'>
                    <span>Shipping fee:</span>
                    <span>{selectedOrderGroup.order_type === 'delivery' ? '15,000đ' : '0đ'}</span>
                  </div>

                  <div className='flex justify-between font-semibold text-lg border-t pt-2'>
                    <span>Total:</span>
                    <span>
                      {(() => {
                        const originalTotal = calculateTotal(selectedOrderGroup.orders)
                        const shippingFee = selectedOrderGroup.order_type === 'delivery' ? 15000 : 0

                        if (selectedOrderGroup.status === OrderStatus.Paid) {
                          const orderPromotions = getPromotionsForOrderGroup(
                            selectedOrderGroup._id,
                            usedPromotions,
                            promotions
                          )

                          if (orderPromotions.length > 0) {
                            const discountResult = calculateDiscountForSpecificOrderGroup(
                              selectedOrderGroup,
                              orderPromotions
                            )
                            return (originalTotal - discountResult.discount + shippingFee).toLocaleString('vi-VN')
                          }
                        }
                        return (originalTotal + shippingFee).toLocaleString('vi-VN')
                      })()}
                      đ
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className='flex gap-2 pt-4 border-t'>
                <Button variant='outline' onClick={handleClose} className='flex-1'>
                  Close
                </Button>
                {selectedOrderGroup.status !== OrderStatus.Delivered &&
                  selectedOrderGroup.status !== OrderStatus.Cancelled && (
                    <Button variant='outline' className='flex-1'>
                      Print Invoice
                    </Button>
                  )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Pay Dialog - Updated for multiple orders */}
      <Dialog open={isPayDialogOpen} onOpenChange={setIsPayDialogOpen}>
        <DialogContent className='max-w-md'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <CreditCard className='h-5 w-5' />
              {ordersToPay && Array.isArray(ordersToPay) ? 'Bulk Payment' : 'Order Payment'}
            </DialogTitle>
            <DialogDescription>
              {ordersToPay && Array.isArray(ordersToPay)
                ? `Paying for ${ordersToPay.length} orders`
                : ordersToPay && generateOrderNumber((ordersToPay as OrderGroupForPayment)._id)}
            </DialogDescription>
          </DialogHeader>

          {ordersToPay && (
            <div className='space-y-6'>
              {/* Order Summary - Updated for multiple orders */}
              <div className='bg-muted p-4 rounded-lg space-y-3'>
                <h4 className='font-medium text-sm'>
                  {Array.isArray(ordersToPay) ? `Payment Details (${ordersToPay.length} orders)` : 'Payment Details'}
                </h4>

                <div className='space-y-2 text-sm'>
                  <div className='flex justify-between'>
                    <span>
                      Subtotal (
                      {Array.isArray(ordersToPay)
                        ? ordersToPay.reduce((total, order) => total + order.orders.length, 0)
                        : (ordersToPay as OrderGroupForPayment).orders.length}{' '}
                      items):
                    </span>
                    <span>{calculateTotalForOrders(ordersToPay).toLocaleString('vi-VN')}đ</span>
                  </div>

                  {/* Shipping fee for delivery orders */}
                  {Array.isArray(ordersToPay)
                    ? ordersToPay.some((order) => order.order_type === 'delivery') && (
                        <div className='flex justify-between'>
                          <span>Shipping Fee:</span>
                          <span>
                            {(
                              ordersToPay.filter((order) => order.order_type === 'delivery').length * 15000
                            ).toLocaleString('vi-VN')}
                            đ
                          </span>
                        </div>
                      )
                    : (ordersToPay as OrderGroupForPayment).order_type === 'delivery' && (
                        <div className='flex justify-between'>
                          <span>Shipping Fee:</span>
                          <span>15,000đ</span>
                        </div>
                      )}

                  {usePromotions.length > 0 && (
                    <div className='flex justify-between text-green-600'>
                      <span>Discount:</span>
                      <span>-{calculateTotalDiscountForOrders(ordersToPay).toLocaleString('vi-VN')}đ</span>
                    </div>
                  )}

                  <div className='border-t pt-2 mt-2'>
                    <div className='flex justify-between items-center font-semibold text-base'>
                      <span>Total:</span>
                      <span className='text-lg text-primary'>
                        {calculateFinalAmountForOrders(ordersToPay).finalAmount.toLocaleString('vi-VN')}đ
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Available Promotions Info */}
              {usePromotions.length > 0 && (
                <div className='bg-purple-50 dark:bg-purple-950/20 p-3 rounded-lg'>
                  <p className='font-medium text-sm text-purple-800 dark:text-purple-200 mb-2'>
                    Promotions to be Applied:
                  </p>
                  <div className='space-y-1'>
                    {usePromotions.map((promotion) => (
                      <div key={promotion._id} className='text-xs text-purple-700 dark:text-purple-300'>
                        • {promotion.name} (
                        {promotion.discount_type === 'percentage'
                          ? `${promotion.discount_value}%`
                          : `${promotion.discount_value?.toLocaleString('vi-VN')}đ`}{' '}
                        OFF)
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Payment Methods */}
              <div>
                <h4 className='font-medium text-sm mb-3'>Select Payment Method</h4>
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
              {selectedPaymentMethod === 'banking' && ordersToPay && (
                <div className='bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg text-sm'>
                  <p className='font-medium text-blue-800 dark:text-blue-200 mb-2'>Transfer Information:</p>
                  <div className='text-blue-700 dark:text-blue-300 space-y-1'>
                    <p>• Bank: Vietcombank</p>
                    <p>• Account Number: 1234567890</p>
                    <p>• Account Name: RESTAURANT ABC</p>
                    <p>
                      • Content:{' '}
                      {Array.isArray(ordersToPay)
                        ? `BULK-${ordersToPay.length}-ORDERS`
                        : generateOrderNumber((ordersToPay as OrderGroupForPayment)._id)}
                    </p>
                  </div>
                </div>
              )}

              {selectedPaymentMethod === 'momo' && ordersToPay && (
                <div className='bg-pink-50 dark:bg-pink-950/20 p-3 rounded-lg text-sm'>
                  <p className='font-medium text-pink-800 dark:text-pink-200 mb-1'>MoMo Payment:</p>
                  <p className='text-pink-700 dark:text-pink-300'>
                    Scan the QR code or transfer to the number: 0123456789
                  </p>
                  {Array.isArray(ordersToPay) && (
                    <p className='text-xs text-pink-600 dark:text-pink-400 mt-1'>
                      Bulk payment for {ordersToPay.length} orders
                    </p>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className='flex gap-3'>
                <Button variant='outline' onClick={handleClose} className='flex-1' disabled={isProcessing}>
                  Cancel
                </Button>
                <Button onClick={confirmPay} className='flex-1' disabled={isProcessing}>
                  {isProcessing ? (
                    <>
                      <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2' />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className='h-4 w-4 mr-2' />
                      {Array.isArray(ordersToPay) ? `Pay ${ordersToPay.length} Orders` : 'Confirm Payment'}
                    </>
                  )}
                </Button>
              </div>

              {/* Security Notice */}
              <div className='text-xs text-muted-foreground text-center border-t pt-3'>
                🔒 Payment information is secured and encrypted
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
