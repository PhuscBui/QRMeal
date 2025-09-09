/* eslint-disable @next/next/no-img-element */
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft,
  CreditCard,
  Clock,
  User,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  MapPin,
  Package,
  Truck
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useDishListQuery } from '@/queries/useDish'
import { TableInfo } from '@/types/common.type'
import { useAccountMe } from '@/queries/useAccount'

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

const paymentMethods = [
  { id: 'cash', name: 'Tiền mặt', description: 'Thanh toán khi nhận hàng' },
  { id: 'card', name: 'Thẻ tín dụng', description: 'Visa, Mastercard' },
  { id: 'banking', name: 'Chuyển khoản', description: 'Internet Banking' },
  { id: 'momo', name: 'Ví MoMo', description: 'Thanh toán qua MoMo' }
]

const orderTypes = [
  { id: 'dine-in', name: 'Tại chỗ', description: 'Thưởng thức tại nhà hàng', icon: MapPin },
  { id: 'takeaway', name: 'Mang về', description: 'Đến lấy tại nhà hàng', icon: Package },
  { id: 'delivery', name: 'Giao hàng', description: 'Giao tận nơi', icon: Truck }
]

export default function CheckoutPage() {
  const { data } = useDishListQuery()
  const { data: accountData } = useAccountMe()
  const dishes = data?.payload.result || []
  const user = accountData?.payload.result || null
  const params = useParams()
  const router = useRouter()
  const orderType = params.type as string

  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [customerInfo, setCustomerInfo] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    address: '',
    notes: ''
  })

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
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [tableInfo, setTableInfo] = useState<TableInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Order type specific configurations
  const orderTypeConfig = {
    'dine-in': {
      title: 'Thanh toán - Tại chỗ',
      description: 'Hoàn tất đơn hàng và thưởng thức tại nhà hàng',
      icon: MapPin,
      color: 'text-blue-600',
      showDeliveryTime: false,
      showAddress: false,
      showTableInfo: true
    },
    takeaway: {
      title: 'Thanh toán - Mang về',
      description: 'Hoàn tất đơn hàng và đến lấy tại nhà hàng',
      icon: Package,
      color: 'text-orange-600',
      showDeliveryTime: true,
      showAddress: false,
      showTableInfo: false
    },
    delivery: {
      title: 'Thanh toán - Giao hàng',
      description: 'Hoàn tất đơn hàng và giao tận nơi',
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
    const loadCartData = () => {
      try {
        const storedCart = localStorage.getItem('cart')
        if (storedCart) {
          const parsedCart = JSON.parse(storedCart)
          // Validate cart structure and ensure it's an array
          if (Array.isArray(parsedCart)) {
            // Map cart items to match our CartItem interface
            const validatedCart = parsedCart
              .map((item: any) => ({
                id: item.id || item.dishId || '',
                name: item.name || '',
                price: Number(item.price) || 0,
                image: item.image || '/placeholder-dish.jpg',
                quantity: Number(item.quantity) || 1,
                notes: item.notes || '',
                dishId: item.dishId || item.id || ''
              }))
              .filter((item: CartItem) => item.id && item.name && item.price > 0)

            setCartItems(validatedCart)
          }
        }

        // Load table info for dine-in orders
        if (orderType === 'dine-in') {
          const storedTableInfo = localStorage.getItem('tableInfo')
          if (storedTableInfo) {
            try {
              setTableInfo(JSON.parse(storedTableInfo))
            } catch (error) {
              console.error('Error parsing table info:', error)
              // Redirect to scan QR if table info is invalid
              router.push('/customer/scan-qr')
            }
          } else {
            // Redirect to scan QR if no table info
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
  }, [orderType, router])

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const deliveryFee = orderType === 'delivery' ? 15000 : 0
  const serviceFee = Math.round(subtotal * 0.05) // 5% service fee, rounded
  const total = subtotal + deliveryFee + serviceFee

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

  const handlePlaceOrder = () => {
    // Validate required fields
    if (!customerInfo.name.trim() || !customerInfo.phone.trim()) {
      alert('Vui lòng nhập đầy đủ họ tên và số điện thoại')
      return
    }

    if (currentConfig.showAddress && !customerInfo.address.trim()) {
      alert('Vui lòng nhập địa chỉ giao hàng')
      return
    }

    if (cartItems.length === 0) {
      alert('Giỏ hàng trống, vui lòng chọn món ăn')
      return
    }

    // Create order data
    const orderData = {
      orderType,
      paymentMethod,
      customerInfo: {
        ...customerInfo,
        name: customerInfo.name.trim(),
        phone: customerInfo.phone.trim(),
        address: customerInfo.address.trim(),
        notes: customerInfo.notes.trim()
      },
      deliveryTime: currentConfig.showDeliveryTime ? deliveryTime : null,
      tableInfo: currentConfig.showTableInfo ? tableInfo : null,
      items: cartItems,
      total,
      subtotal,
      deliveryFee,
      serviceFee,
      createdAt: new Date().toISOString()
    }

    try {
      // Store order data for confirmation
      localStorage.setItem('currentOrder', JSON.stringify(orderData))

      // Clear cart and table info
      localStorage.removeItem('cart')
      if (orderType === 'dine-in') {
        localStorage.removeItem('tableInfo')
      }

      console.log('Order placed:', orderData)

      // Navigate to order confirmation
      router.push(`/customer/${orderType}/order-confirmation`)
    } catch (error) {
      console.error('Error placing order:', error)
      alert('Có lỗi xảy ra khi đặt hàng, vui lòng thử lại')
    }
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className='container mx-auto px-4 py-6 max-w-4xl'>
        <div className='flex items-center justify-center h-64'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4'></div>
            <p className='text-muted-foreground'>Đang tải thông tin đơn hàng...</p>
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
          <h1 className='text-2xl font-bold mb-4'>Loại đơn hàng không hợp lệ</h1>
          <Button onClick={() => router.push('/customer/menu')}>Quay về menu</Button>
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
                Loại đơn hàng
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
                  Thông tin bàn
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='p-3 border rounded-lg bg-blue-50 dark:bg-blue-950/20'>
                  <div className='flex items-center gap-2'>
                    <MapPin className='h-4 w-4 text-blue-600' />
                    <span className='font-medium text-blue-800 dark:text-blue-200'>
                      Bàn {tableInfo.tableNumber} - {tableInfo.location}
                    </span>
                  </div>
                  <p className='text-sm text-blue-700 dark:text-blue-300 mt-1'>Sức chứa: {tableInfo.capacity} người</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <User className='h-5 w-5' />
                Thông tin khách hàng
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid md:grid-cols-2 gap-4'>
                <div>
                  <Label className='mb-1' htmlFor='name'>
                    Họ và tên *
                  </Label>
                  <Input
                    id='name'
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder='Nhập họ và tên'
                    required
                  />
                </div>
                <div>
                  <Label className='mb-1' htmlFor='phone'>
                    Số điện thoại *
                  </Label>
                  <Input
                    id='phone'
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo((prev) => ({ ...prev, phone: e.target.value }))}
                    placeholder='Nhập số điện thoại'
                    required
                  />
                </div>
              </div>

              {currentConfig.showAddress && (
                <div>
                  <Label className='mb-1' htmlFor='address'>
                    Địa chỉ giao hàng *
                  </Label>
                  <Textarea
                    id='address'
                    value={customerInfo.address}
                    onChange={(e) => setCustomerInfo((prev) => ({ ...prev, address: e.target.value }))}
                    placeholder='Nhập địa chỉ giao hàng chi tiết'
                    rows={3}
                    required
                  />
                </div>
              )}

              <div>
                <Label className='mb-1' htmlFor='notes'>
                  Ghi chú đặc biệt
                </Label>
                <Textarea
                  id='notes'
                  value={customerInfo.notes}
                  onChange={(e) => setCustomerInfo((prev) => ({ ...prev, notes: e.target.value }))}
                  placeholder='Ghi chú về đơn hàng (tùy chọn)'
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
                  Thời gian nhận hàng
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={deliveryTime} onValueChange={setDeliveryTime}>
                  <SelectTrigger>
                    <SelectValue placeholder='Chọn thời gian nhận hàng' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='asap'>Càng sớm càng tốt</SelectItem>
                    <SelectItem value='30min'>Sau 30 phút</SelectItem>
                    <SelectItem value='1hour'>Sau 1 giờ</SelectItem>
                    <SelectItem value='2hour'>Sau 2 giờ</SelectItem>
                    <SelectItem value='custom'>Chọn thời gian cụ thể</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          )}

          {/* Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <CreditCard className='h-5 w-5' />
                Phương thức thanh toán
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                <div className='space-y-3'>
                  {paymentMethods.map((method) => (
                    <label
                      key={method.id}
                      className='flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-accent'
                    >
                      <RadioGroupItem value={method.id} />
                      <div className='flex-1'>
                        <div className='font-medium'>{method.name}</div>
                        <div className='text-sm text-muted-foreground'>{method.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Order Summary */}
        <div className='space-y-6'>
          {/* Cart Items */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center justify-between'>
                <span>Đơn hàng của bạn</span>
                <span className='text-sm text-muted-foreground'>({cartItems.length} món)</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {cartItems.length === 0 ? (
                  <div className='text-center py-8 text-muted-foreground'>
                    <ShoppingCart className='h-12 w-12 mx-auto mb-4 opacity-50' />
                    <p className='font-medium mb-2'>Giỏ hàng trống</p>
                    <Button variant='outline' size='sm' onClick={() => router.push('/customer/menu')}>
                      Chọn món ăn
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
                <CardTitle>Tổng kết đơn hàng</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='space-y-2'>
                  <div className='flex justify-between text-sm'>
                    <span>Tạm tính ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} món)</span>
                    <span>{subtotal.toLocaleString('vi-VN')}đ</span>
                  </div>
                  {deliveryFee > 0 && (
                    <div className='flex justify-between text-sm'>
                      <span>Phí giao hàng</span>
                      <span>{deliveryFee.toLocaleString('vi-VN')}đ</span>
                    </div>
                  )}
                  <div className='flex justify-between text-sm'>
                    <span>Phí dịch vụ (5%)</span>
                    <span>{serviceFee.toLocaleString('vi-VN')}đ</span>
                  </div>
                  <Separator />
                  <div className='flex justify-between font-semibold text-lg'>
                    <span>Tổng cộng</span>
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
                    (currentConfig.showAddress && !customerInfo.address.trim()) ||
                    cartItems.length === 0
                  }
                >
                  Đặt hàng ngay • {total.toLocaleString('vi-VN')}đ
                </Button>

                <p className='text-xs text-muted-foreground text-center'>
                  Bằng cách đặt hàng, bạn đồng ý với{' '}
                  <a href='#' className='underline hover:text-primary'>
                    Điều khoản sử dụng
                  </a>{' '}
                  và{' '}
                  <a href='#' className='underline hover:text-primary'>
                    Chính sách bảo mật
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
