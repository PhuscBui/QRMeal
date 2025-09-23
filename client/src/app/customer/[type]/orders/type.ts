import { OrderStatus } from '@/constants/type'
import { GetOrderDetailResType } from '@/schemaValidations/order.schema'
import { CheckCircle, Clock, CreditCard, MapPin, Package, Truck, XCircle } from 'lucide-react'

// Types for payment handling
export type OrderGroupForPayment = GetOrderDetailResType['result']
export type PaymentOrders = OrderGroupForPayment | OrderGroupForPayment[]

export const statusConfig = {
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

export const orderTypeConfig = {
  'dine-in': { label: 'In-place', icon: MapPin, color: 'bg-blue-100 text-blue-800' },
  takeaway: { label: 'Take home', icon: Package, color: 'bg-orange-100 text-orange-800' },
  delivery: { label: 'Delivery', icon: Truck, color: 'bg-green-100 text-green-800' }
}

export const paymentMethodConfig = {
  cash: { label: 'Cash', icon: CreditCard },
  card: { label: 'Credit Card', icon: CreditCard },
  banking: { label: 'Bank Transfer', icon: CreditCard },
  momo: { label: 'MoMo Wallet', icon: CreditCard }
}
