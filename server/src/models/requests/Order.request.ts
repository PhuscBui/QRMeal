import { ParamsDictionary } from 'express-serve-static-core'

export interface CreateOrdersReqBody {
  guest_id: string
  orders: {
    dish_id: string
    quantity: number
  }[]
}

export interface GetOrdersQueryParams {
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
