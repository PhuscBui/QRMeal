import { ObjectId } from 'mongodb'
import { ParamsDictionary } from 'express-serve-static-core'

export interface CreateOrdersReqBody {
  guest_id: ObjectId
  orders: {
    dish_id: ObjectId
    quantity: number
  }[]
}

export interface GetOrdersQueryParams {
  fromDate?: Date
  toDate?: Date
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
  guest_id: string
}
