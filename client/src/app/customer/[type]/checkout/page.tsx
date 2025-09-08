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

// Mock data - sẽ được thay thế bằng API thực tế
const cartItems = [
  {
    id: '1',
    name: 'Phở Bò Tái',
    price: 45000,
    quantity: 2,
    image: '/api/placeholder/80/80',
    notes: 'Ít rau, nhiều thịt'
  },
  {
    id: '2',
    name: 'Bún Chả Hà Nội',
    price: 55000,
    quantity: 1,
    image: '/api/placeholder/80/80',
    notes: ''
  },
  {
    id: '3',
    name: 'Gỏi Cuốn Tôm Thịt',
    price: 35000,
    quantity: 3,
    image: '/api/placeholder/80/80',
    notes: 'Không tôm'
  }
]

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
  const params = useParams()
  const router = useRouter()
  const orderType = params.type as string

  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    notes: ''
  })
  const [deliveryTime, setDeliveryTime] = useState('asap')
  const [cartItems, setCartItems] = useState<any[]>([])
  const [tableInfo, setTableInfo] = useState<any>(null)

  // Order type specific configurations
  const orderTypeConfig = {
    'dine-in': {
      title: 'Thanh toán - Ăn tại quán',
      description: 'Hoàn tất đơn hàng và thưởng thức tại nhà hàng',
      icon: MapPin,
      color: 'text-blue-600',
      showDeliveryTime: false,
      showAddress: false,
      showTableInfo: true
    },
    takeaway: {
      title: 'Thanh toán - Mua mang về',
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

  useEffect(() => {
    // Load cart data from localStorage
    const storedCart = localStorage.getItem('cart')
    if (storedCart) {
      setCartItems(JSON.parse(storedCart))
    }

    // Load table info for dine-in orders
    if (orderType === 'dine-in') {
      const storedTableInfo = localStorage.getItem('tableInfo')
      if (storedTableInfo) {
        setTableInfo(JSON.parse(storedTableInfo))
      } else {
        // Redirect to scan QR if no table info
        router.push('/customer/scan-qr')
      }
    }
  }, [orderType, router])

  const subtotal = Array.isArray(cartItems) ? cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0) : 0
  const deliveryFee = orderType === 'delivery' ? 15000 : 0
  const serviceFee = subtotal * 0.05 // 5% service fee
  const total = subtotal + deliveryFee + serviceFee

  const handleQuantityChange = (itemId: string, change: number) => {
    // Logic to update cart quantity
    console.log('Update quantity:', itemId, change)
  }

  const handleRemoveItem = (itemId: string) => {
    // Logic to remove item from cart
    console.log('Remove item:', itemId)
  }

  const handlePlaceOrder = () => {
    // Logic to place order
    const orderData = {
      orderType,
      paymentMethod,
      customerInfo,
      deliveryTime: currentConfig.showDeliveryTime ? deliveryTime : null,
      tableInfo: currentConfig.showTableInfo ? tableInfo : null,
      items: cartItems,
      total,
      subtotal,
      deliveryFee,
      serviceFee
    }

    console.log('Place order:', orderData)

    // Store order data for confirmation
    localStorage.setItem('currentOrder', JSON.stringify(orderData))

    // Clear cart and table info
    localStorage.removeItem('cart')
    if (orderType === 'dine-in') {
      localStorage.removeItem('tableInfo')
    }

    router.push(`/customer/${orderType}/orders`)
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
                      {tableInfo.tableNumber} - {tableInfo.floor}
                    </span>
                  </div>
                  <p className='text-sm text-blue-700 dark:text-blue-300 mt-1'>Tối đa {tableInfo.capacity} người</p>
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
                  <Label htmlFor='name'>Họ và tên *</Label>
                  <Input
                    id='name'
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder='Nhập họ và tên'
                  />
                </div>
                <div>
                  <Label htmlFor='phone'>Số điện thoại *</Label>
                  <Input
                    id='phone'
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo((prev) => ({ ...prev, phone: e.target.value }))}
                    placeholder='Nhập số điện thoại'
                  />
                </div>
              </div>

              <div>
                <Label htmlFor='email'>Email</Label>
                <Input
                  id='email'
                  type='email'
                  value={customerInfo.email}
                  onChange={(e) => setCustomerInfo((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder='Nhập email (tùy chọn)'
                />
              </div>

              {currentConfig.showAddress && (
                <div>
                  <Label htmlFor='address'>Địa chỉ giao hàng *</Label>
                  <Textarea
                    id='address'
                    value={customerInfo.address}
                    onChange={(e) => setCustomerInfo((prev) => ({ ...prev, address: e.target.value }))}
                    placeholder='Nhập địa chỉ giao hàng chi tiết'
                    rows={3}
                  />
                </div>
              )}

              <div>
                <Label htmlFor='notes'>Ghi chú đặc biệt</Label>
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
              <CardTitle>Đơn hàng của bạn</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {cartItems.length === 0 ? (
                  <div className='text-center py-8 text-muted-foreground'>
                    <ShoppingCart className='h-12 w-12 mx-auto mb-4 opacity-50' />
                    <p>Giỏ hàng trống</p>
                  </div>
                ) : (
                  Array.isArray(cartItems) &&
                  cartItems.map((item) => (
                    <div key={item.id} className='flex items-center gap-3'>
                      <div className='relative w-16 h-16 rounded-lg overflow-hidden bg-muted'>
                        <img src={item.image} alt={item.name} className='w-full h-full object-cover' />
                      </div>
                      <div className='flex-1 min-w-0'>
                        <h4 className='font-medium text-sm truncate'>{item.name}</h4>
                        <p className='text-sm text-muted-foreground'>{item.price.toLocaleString('vi-VN')}đ</p>
                        {item.notes && <p className='text-xs text-muted-foreground italic'>Ghi chú: {item.notes}</p>}
                      </div>
                      <div className='flex items-center gap-2'>
                        <Button size='sm' variant='outline' onClick={() => handleQuantityChange(item.id, -1)}>
                          <Minus className='h-3 w-3' />
                        </Button>
                        <span className='w-8 text-center text-sm font-medium'>{item.quantity}</span>
                        <Button size='sm' variant='outline' onClick={() => handleQuantityChange(item.id, 1)}>
                          <Plus className='h-3 w-3' />
                        </Button>
                        <Button
                          size='sm'
                          variant='ghost'
                          onClick={() => handleRemoveItem(item.id)}
                          className='text-destructive hover:text-destructive'
                        >
                          <Trash2 className='h-3 w-3' />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Tổng kết đơn hàng</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-2'>
                <div className='flex justify-between text-sm'>
                  <span>Tạm tính</span>
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
                  !customerInfo.name ||
                  !customerInfo.phone ||
                  (currentConfig.showAddress && !customerInfo.address) ||
                  cartItems.length === 0
                }
              >
                Đặt hàng ngay
              </Button>

              <p className='text-xs text-muted-foreground text-center'>
                Bằng cách đặt hàng, bạn đồng ý với{' '}
                <a href='#' className='underline'>
                  Điều khoản sử dụng
                </a>{' '}
                và{' '}
                <a href='#' className='underline'>
                  Chính sách bảo mật
                </a>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
