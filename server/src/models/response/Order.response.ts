import { ApiResponse } from '~/type'

export interface OrderResponseResult {
  _id: string
  guest_id: string
  guest: {
    _id: string
    name: string
    table_number: number
    created_at: string
    updated_at: string
  }
  table_number: number
  dish_snapshot_id: string
  dish_snapshot: {
    _id: string
    name: string
    price: number
    image: string
    description: string
    status: string
    dish_id: string
    created_at: string
    updated_at: string
  }
  quantity: number
  order_handler_id?: string
  order_handler?: {
    _id: string
    name: string
    email: string
    avatar: string
    role: string
    date_of_birth: string
  }
  status: string
  created_at: string
  updated_at: string
}

export type CreateOrderResponse = ApiResponse<OrderResponseResult>
export type GetOrdersResponse = ApiResponse<OrderResponseResult[]>
export type GetOrderResponse = ApiResponse<OrderResponseResult>
export type UpdateOrderResponse = ApiResponse<OrderResponseResult>
export type PayGuestOrdersResponse = ApiResponse<OrderResponseResult[]>
export type DeleteOrderResponse = ApiResponse
