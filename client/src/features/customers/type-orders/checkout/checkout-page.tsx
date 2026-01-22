/* eslint-disable @next/next/no-img-element */
'use client'

import { useState, useEffect, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Clock, User, ShoppingCart, Plus, Minus, Trash2, MapPin, Package, Truck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useDishListQuery } from '@/queries/useDish'
import { TableInfo } from '@/types/common.type'
import { useAccountMe } from '@/queries/useAccount'
import { toast } from 'sonner'
import { useCreateOrderMutation } from '@/queries/useOrder'
import { CreateOrderGroupBodyType } from '@/schemaValidations/order.schema'
import { useTranslations } from 'next-intl'
import dynamic from 'next/dynamic'

// Dynamic import để tránh lỗi SSR với Leaflet
const MapPicker = dynamic(() => import('@/components/map-picker'), {
  ssr: false,
  loading: () => <div className='h-[400px] w-full bg-muted animate-pulse rounded-lg' />
})

// Define cart item type
interface CartItem {
  id: string
  name: string
  price: number
  image: string
  quantity: number
  notes?: string
  dishId: string
}

// Payment methods moved to orders page (final step)

export default function CheckoutPage() {
  const { data } = useDishListQuery()
  const { data: accountData } = useAccountMe()
  const dishes = useMemo(() => data?.payload.result || [], [data])
  const createOrder = useCreateOrderMutation()
  const user = accountData?.payload.result || null
  const params = useParams()
  const router = useRouter()
  const orderType = params.type as string
  const t = useTranslations('customerCheckout')
  const tCommon = useTranslations('common')

  const orderTypes = [
    { id: 'dine-in', name: t('onSite'), description: t('dineIn'), icon: MapPin },
    { id: 'takeaway', name: t('takeaway'), description: t('pickUp'), icon: Package },
    { id: 'delivery', name: t('delivery'), description: t('delivery'), icon: Truck }
  ]

  const [customerInfo, setCustomerInfo] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    address: '',
    notes: ''
  })
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number
    lng: number
  } | null>(null)

  useEffect(() => {
    if (user) {
      setCustomerInfo((prev) => ({
        ...prev,
        name: user.name || '',
        phone: user.phone || '',
        email: user.email || ''
      }))
    }
  }, [user])

  const [deliveryTime, setDeliveryTime] = useState('asap')
  const [customTime, setCustomTime] = useState<string | null>(null)
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [tableInfo, setTableInfo] = useState<TableInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Helper: convert deliveryTime (string) -> ISO string
  const getDeliveryISO = (value: string): string | undefined => {
    const now = new Date()
    switch (value) {
      case 'asap':
        return now.toISOString()
      case '30min':
        return new Date(now.getTime() + 30 * 60 * 1000).toISOString()
      case '1hour':
        return new Date(now.getTime() + 60 * 60 * 1000).toISOString()
      case '2hour':
        return new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString()
      case 'custom':
        return customTime ? new Date(customTime).toISOString() : undefined
      default:
        return undefined
    }
  }

  // Order type specific configurations
  const orderTypeConfig = {
    'dine-in': {
      title: t('confirmOrderDineIn'),
      description: t('completeOrderRestaurant'),
      icon: MapPin,
      color: 'text-blue-600',
      showDeliveryTime: false,
      showAddress: false,
      showTableInfo: true
    },
    takeaway: {
      title: t('confirmOrderTakeaway'),
      description: t('completeOrderPickup'),
      icon: Package,
      color: 'text-orange-600',
      showDeliveryTime: true,
      showAddress: false,
      showTableInfo: false
    },
    delivery: {
      title: t('confirmOrderDelivery'),
      description: t('completeOrderDeliver'),
      icon: Truck,
      color: 'text-green-600',
      showDeliveryTime: true,
      showAddress: true,
      showTableInfo: false
    }
  }

  const currentConfig = orderTypeConfig[orderType as keyof typeof orderTypeConfig]

  // Load cart and table data
  useEffect(() => {
    if (!dishes || dishes.length === 0) return

    const loadCartData = () => {
      try {
        const storedCart = localStorage.getItem('cart')
        if (storedCart) {
          const parsedCart = JSON.parse(storedCart)

          // Nếu là object { dishId: quantity }
          if (parsedCart && typeof parsedCart === 'object' && !Array.isArray(parsedCart)) {
            const validatedCart = Object.entries(parsedCart)
              .map(([dishId, quantity]) => {
                const dish = dishes.find((d) => d._id === dishId)
                if (!dish) return null

                return {
                  id: dish._id,
                  dishId: dish._id,
                  name: dish.name,
                  price: dish.price,
                  image: dish.image || '/placeholder-dish.jpg',
                  quantity: Number(quantity) || 1
                }
              })
              .filter((item): item is CartItem => item !== null)

            setCartItems(validatedCart)
          }
        }

        if (orderType === 'dine-in') {
          const storedTableInfo = localStorage.getItem('tableInfo')
          if (storedTableInfo) {
            setTableInfo(JSON.parse(storedTableInfo))
          } else {
            router.push('/customer/scan-qr')
          }
        }
      } catch (error) {
        console.error('Error loading cart data:', error)
        setCartItems([])
      } finally {
        setIsLoading(false)
      }
    }

    loadCartData()
  }, [orderType, router, dishes])

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const deliveryFee = orderType === 'delivery' ? 15000 : 0
  const total = subtotal + deliveryFee

  // Update cart in localStorage
  const updateCartInStorage = (newCartItems: CartItem[]) => {
    try {
      localStorage.setItem('cart', JSON.stringify(newCartItems))
    } catch (error) {
      console.error('Error saving cart:', error)
    }
  }

  const handleQuantityChange = (itemId: string, change: number) => {
    setCartItems((prevItems) => {
      const updatedItems = prevItems.map((item) => {
        if (item.id === itemId) {
          const newQuantity = Math.max(1, item.quantity + change)
          return { ...item, quantity: newQuantity }
        }
        return item
      })
      updateCartInStorage(updatedItems)
      return updatedItems
    })
  }

  const handleRemoveItem = (itemId: string) => {
    setCartItems((prevItems) => {
      const updatedItems = prevItems.filter((item) => item.id !== itemId)
      updateCartInStorage(updatedItems)
      return updatedItems
    })
  }

  const handlePlaceOrder = async () => {
    if (!customerInfo.name.trim() || !customerInfo.phone.trim()) {
      toast.error(t('enterNameAndPhone'))
      return
    }

    if (currentConfig.showAddress && !customerInfo.address.trim() && !selectedLocation) {
      toast.error(t('enterAddress') || 'Vui lòng nhập địa chỉ hoặc chọn vị trí trên bản đồ')
      return
    }

    if (cartItems.length === 0) {
      toast.error(t('cartEmpty'))
      return
    }

    const body: CreateOrderGroupBodyType = {
      table_number: currentConfig.showTableInfo ? (tableInfo?.tableNumber ?? null) : null,
      order_type: orderType as 'dine-in' | 'delivery' | 'takeaway',
      orders: cartItems.map((item) => ({
        dish_id: item.dishId,
        quantity: item.quantity
      })),
      delivery_info: currentConfig.showAddress
        ? {
            address: selectedLocation
              ? `${customerInfo.address} (Tọa độ: ${selectedLocation.lat.toFixed(6)}, ${selectedLocation.lng.toFixed(6)})`
              : customerInfo.address,
            receiver_name: customerInfo.name,
            receiver_phone: customerInfo.phone,
            notes: customerInfo.notes || null
          }
        : undefined,
      takeaway_info:
        orderType === 'takeaway'
          ? {
              pickup_time: getDeliveryISO(deliveryTime),
              customer_name: customerInfo.name,
              customer_phone: customerInfo.phone,
              notes: customerInfo.notes || null
            }
          : undefined
    }

    try {
      const res = await createOrder.mutateAsync(body)

      localStorage.removeItem('cart')

      toast.success(res.payload.message)
      router.push(`/customer/${orderType}/orders`)
    } catch (error) {
      console.error('Error placing order:', error)
      toast.error(t('orderError'))
    }
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className='container mx-auto px-4 py-6 max-w-4xl'>
        <div className='flex items-center justify-center h-64'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4'></div>
            <p className='text-muted-foreground'>{t('loadingOrderInfo')}</p>
          </div>
        </div>
      </div>
    )
  }

  // Show error if no valid order type
  if (!currentConfig) {
    return (
      <div className='container mx-auto px-4 py-6 max-w-4xl'>
        <div className='text-center py-8'>
          <h1 className='text-2xl font-bold mb-4'>{t('invalidOrderType')}</h1>
          <Button onClick={() => router.push('/customer/menu')}>{t('backToMenu')}</Button>
        </div>
      </div>
    )
  }

  return (
    <div className='container mx-auto px-4 py-6 max-w-4xl'>
      {/* Header */}
      <div className='flex items-center gap-4 mb-8'>
        <Button variant='ghost' size='icon' onClick={() => router.back()}>
          <ArrowLeft className='h-4 w-4' />
        </Button>
        <div className='flex items-center gap-3'>
          <div className={`p-2 rounded-lg bg-muted`}>
            <currentConfig.icon className={`h-6 w-6 ${currentConfig.color}`} />
          </div>
          <div>
            <h1 className='text-3xl font-bold'>{currentConfig.title}</h1>
            <p className='text-muted-foreground'>{currentConfig.description}</p>
          </div>
        </div>
      </div>

      <div className='grid lg:grid-cols-3 gap-8'>
        {/* Left Column - Order Details */}
        <div className='lg:col-span-2 space-y-6'>
          {/* Order Type Info */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <ShoppingCart className='h-5 w-5' />
                {t('orderType')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='flex items-center space-x-3 p-3 border rounded-lg bg-muted/50'>
                <div className={`p-2 rounded-lg bg-muted`}>
                  <currentConfig.icon className={`h-5 w-5 ${currentConfig.color}`} />
                </div>
                <div className='flex-1'>
                  <div className='font-medium'>{orderTypes.find((t) => t.id === orderType)?.name}</div>
                  <div className='text-sm text-muted-foreground'>
                    {orderTypes.find((t) => t.id === orderType)?.description}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Table Info for Dine-in */}
          {currentConfig.showTableInfo && tableInfo && (
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <MapPin className='h-5 w-5' />
                  {t('tableInformation')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='p-3 border rounded-lg bg-blue-50 dark:bg-blue-950/20'>
                  <div className='flex items-center gap-2'>
                    <MapPin className='h-4 w-4 text-blue-600' />
                    <span className='font-medium text-blue-800 dark:text-blue-200'>
                      {t('table')} {tableInfo.tableNumber} - {tableInfo.location}
                    </span>
                  </div>
                  <p className='text-sm text-blue-700 dark:text-blue-300 mt-1'>
                    {t('capacity')}: {tableInfo.capacity} {t('people')}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <User className='h-5 w-5' />
                {t('customerInformation')}
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid md:grid-cols-2 gap-4'>
                <div>
                  <Label className='mb-1' htmlFor='name'>
                    {t('fullName')} <span className='text-red-500'>*</span>
                  </Label>
                  <Input
                    id='name'
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder={t('enterFullName')}
                    required
                  />
                </div>
                <div>
                  <Label className='mb-1' htmlFor='phone'>
                    {t('phoneNumber')} <span className='text-red-500'>*</span>
                  </Label>
                  <Input
                    id='phone'
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo((prev) => ({ ...prev, phone: e.target.value }))}
                    placeholder={t('enterPhoneNumber')}
                    required
                  />
                </div>
              </div>

              {currentConfig.showAddress && (
                <div className='space-y-4'>
                  <div>
                    <Label className='mb-1' htmlFor='address'>
                      {t('deliveryAddress')} <span className='text-red-500'>*</span>
                    </Label>
                    <Textarea
                      id='address'
                      value={customerInfo.address}
                      onChange={(e) => setCustomerInfo((prev) => ({ ...prev, address: e.target.value }))}
                      placeholder={t('enterDeliveryAddress') || 'Nhập địa chỉ giao hàng hoặc chọn trên bản đồ'}
                      rows={3}
                      required
                    />
                  </div>
                  <div>
                    <Label className='mb-1'>Chọn vị trí trên bản đồ (tùy chọn)</Label>
                    <MapPicker
                      onLocationSelect={(location) => {
                        setSelectedLocation({ lat: location.lat, lng: location.lng })
                        // Tự động điền địa chỉ nếu có
                        if (location.address && !customerInfo.address) {
                          setCustomerInfo((prev) => ({ ...prev, address: location.address || '' }))
                        } else if (!customerInfo.address && location.lat !== 0 && location.lng !== 0) {
                          // Nếu không có địa chỉ, điền tọa độ
                          setCustomerInfo((prev) => ({
                            ...prev,
                            address: `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`
                          }))
                        }
                      }}
                      initialPosition={selectedLocation || undefined}
                    />
                  </div>
                </div>
              )}

              <div>
                <Label className='mb-1' htmlFor='notes'>
                  {t('specialInstructions')}
                </Label>
                <Textarea
                  id='notes'
                  value={customerInfo.notes}
                  onChange={(e) => setCustomerInfo((prev) => ({ ...prev, notes: e.target.value }))}
                  placeholder={t('enterSpecialInstructions')}
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Delivery Time */}
          {currentConfig.showDeliveryTime && (
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Clock className='h-5 w-5' />
                  {t('deliveryTime')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={deliveryTime} onValueChange={setDeliveryTime}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('selectTime')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='asap'>{t('asap')}</SelectItem>
                    <SelectItem value='30min'>{t('in30min')}</SelectItem>
                    <SelectItem value='1hour'>{t('in1hour')}</SelectItem>
                    <SelectItem value='2hour'>{t('in2hours')}</SelectItem>
                    <SelectItem value='custom'>{t('selectSpecificTime')}</SelectItem>
                  </SelectContent>
                </Select>

                {deliveryTime === 'custom' && (
                  <div>
                    <Label className='mt-2 mb-1' htmlFor='customTime'>
                      {t('chooseCustomTime')}
                    </Label>
                    <Input
                      id='customTime'
                      type='datetime-local'
                      value={customTime || ''}
                      onChange={(e) => setCustomTime(e.target.value)}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Order Summary */}
        <div className='space-y-6'>
          {/* Cart Items */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center justify-between'>
                <span>{t('yourOrder')}</span>
                <span className='text-sm text-muted-foreground'>
                  ({cartItems.length} {t('items')})
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {cartItems.length === 0 ? (
                  <div className='text-center py-8 text-muted-foreground'>
                    <ShoppingCart className='h-12 w-12 mx-auto mb-4 opacity-50' />
                    <p className='font-medium mb-2'>{t('yourCartEmpty')}</p>
                    <Button variant='outline' size='sm' onClick={() => router.push(`/customer/${orderType}/menu`)}>
                      {t('selectDishes')}
                    </Button>
                  </div>
                ) : (
                  cartItems.map((item, index) => (
                    <div key={`${item.id}-${index}`} className='flex items-start gap-3 p-3 border rounded-lg'>
                      <div className='relative w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0'>
                        <img
                          src={item.image}
                          alt={item.name}
                          className='w-full h-full object-cover'
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder-dish.jpg'
                          }}
                        />
                      </div>
                      <div className='flex-1 min-w-0'>
                        <h4 className='font-medium text-sm leading-tight mb-1'>{item.name}</h4>
                        <p className='text-sm text-muted-foreground mb-1'>{item.price.toLocaleString('vi-VN')}đ</p>
                        {item.notes && (
                          <p className='text-xs text-muted-foreground italic bg-muted px-2 py-1 rounded'>
                            {item.notes}
                          </p>
                        )}
                        <div className='flex items-center justify-between mt-2'>
                          <div className='flex items-center gap-1'>
                            <Button
                              size='sm'
                              variant='outline'
                              onClick={() => handleQuantityChange(item.id, -1)}
                              disabled={item.quantity <= 1}
                              className='h-7 w-7 p-0'
                            >
                              <Minus className='h-3 w-3' />
                            </Button>
                            <span className='w-8 text-center text-sm font-medium'>{item.quantity}</span>
                            <Button
                              size='sm'
                              variant='outline'
                              onClick={() => handleQuantityChange(item.id, 1)}
                              className='h-7 w-7 p-0'
                            >
                              <Plus className='h-3 w-3' />
                            </Button>
                          </div>
                          <Button
                            size='sm'
                            variant='ghost'
                            onClick={() => handleRemoveItem(item.id)}
                            className='text-destructive hover:text-destructive h-7 w-7 p-0'
                          >
                            <Trash2 className='h-3 w-3' />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Order Summary */}
          {cartItems.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>{t('orderSummary')}</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='space-y-2'>
                  <div className='flex justify-between text-sm'>
                    <span>
                      {t('subtotal')} ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} {t('items')})
                    </span>
                    <span>{subtotal.toLocaleString('vi-VN')}đ</span>
                  </div>
                  {deliveryFee > 0 && (
                    <div className='flex justify-between text-sm'>
                      <span>{t('deliveryFee')}</span>
                      <span>{deliveryFee.toLocaleString('vi-VN')}đ</span>
                    </div>
                  )}

                  <Separator />
                  <div className='flex justify-between font-semibold text-lg'>
                    <span>{tCommon('total')}</span>
                    <span className='text-primary'>{total.toLocaleString('vi-VN')}đ</span>
                  </div>
                </div>

                <Button
                  size='lg'
                  className='w-full'
                  onClick={handlePlaceOrder}
                  disabled={
                    !customerInfo.name.trim() ||
                    !customerInfo.phone.trim() ||
                    (currentConfig.showAddress && !customerInfo.address.trim() && !selectedLocation) ||
                    cartItems.length === 0
                  }
                >
                  {t('placeOrder')} • {total.toLocaleString('vi-VN')}đ
                </Button>

                <p className='text-xs text-muted-foreground text-center'>
                  {t('byPlacingOrder')}{' '}
                  <a href='#' className='underline hover:text-primary'>
                    {t('termsOfService')}
                  </a>{' '}
                  {t('and')}{' '}
                  <a href='#' className='underline hover:text-primary'>
                    {t('privacyPolicy')}
                  </a>
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
