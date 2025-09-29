import { ParamsDictionary, Query } from 'express-serve-static-core'

interface TakeawayInfo {
  pickup_time?: Date
  customer_name: string
  customer_phone: string
  notes?: string
}

export interface CreateOrdersReqBody {
  guest_id: string
  orders: {
    dish_id: string
    quantity: number
  }[]
}

export interface GetOrdersQueryParams extends Query {
  fromDate?: string
  toDate?: string
}

export interface OrderParam extends ParamsDictionary {
  order_id: string
}

export interface UpdateOrderReqBody {
  status: 'Pending' | 'Processing' | 'Rejected' | 'Delivered' | 'Paid'
  dish_id: string
  quantity: number
}

export interface PayGuestOrdersReqBody {
  guestId: string
}

export interface CreateOrderGroupReqBody {
  customer_id?: string // Optional: for registered customers
  guest_id?: string // Optional: for guest users
  table_number?: number | null // Optional: for dine-in orders
  order_type: 'dine-in' | 'delivery' | 'takeaway' // Type of order
  orders: OrderItem[] // Array of items to order
  delivery_info?: DeliveryInfo // Required for delivery orders
  takeaway_info?: TakeawayInfo
}

export interface OrderItem {
  dish_id: string
  quantity: number
}

export interface DeliveryInfo {
  address: string
  receiver_name: string
  receiver_phone: string
  notes?: string
}

export interface GetOrdersQueryParams {
  fromDate?: string
  toDate?: string
  status?: 'Pending' | 'Processing' | 'Rejected' | 'Delivered' | 'Paid'
  order_type?: 'dine-in' | 'delivery' | 'takeaway'
  customer_id?: string
  guest_id?: string
}

export interface PayOrdersReqBody {
  customer_id?: string
  guest_id?: string
  is_customer?: boolean
}

export interface UpdateDeliveryStatusReqBody {
  delivery_status: 'pending' | 'confirmed' | 'preparing' | 'on-the-way' | 'delivered' | 'cancelled'
  shipper_info?: string // Optional shipper information
  estimated_time?: string // Optional estimated delivery time
}

// Param types for routes
export interface OrderParam {
  order_id: string
}

export interface OrderGroupParam extends ParamsDictionary {
  order_group_id: string
}

export interface CreatePaymentLinkReqBody {
  order_group_ids: string[]
  total_amount: number
}

// Legacy support - keeping old interface for backward compatibility
export interface CreateOrdersReqBody {
  guest_id: string
  orders: OrderItem[]
}

export interface PayGuestOrdersReqBody {
  guestId: string
}
