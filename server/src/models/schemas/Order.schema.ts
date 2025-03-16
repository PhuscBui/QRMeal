// import { DishStatusValues, OrderStatusValues } from '@/constants/type'
// import { AccountSchema } from '@/schemaValidations/account.schema'
// import { TableSchema } from '@/schemaValidations/table.schema'
// import z from 'zod'

import { ObjectId } from 'mongodb'

// export const UpdateOrderBody = z.object({
//   status: z.enum(OrderStatusValues),
//   dishId: z.number(),
//   quantity: z.number()
// })

// export type UpdateOrderBodyType = z.TypeOf<typeof UpdateOrderBody>

// export const OrderParam = z.object({
//   orderId: z.coerce.number()
// })

// export type OrderParamType = z.TypeOf<typeof OrderParam>

// export const UpdateOrderRes = z.object({
//   message: z.string(),
//   data: OrderSchema
// })

// export type UpdateOrderResType = z.TypeOf<typeof UpdateOrderRes>

// export const GetOrdersQueryParams = z.object({
//   fromDate: z.coerce.date().optional(),
//   toDate: z.coerce.date().optional()
// })

// export type GetOrdersQueryParamsType = z.TypeOf<typeof GetOrdersQueryParams>

// export const GetOrdersRes = z.object({
//   message: z.string(),
//   data: z.array(OrderSchema)
// })

// export type GetOrdersResType = z.TypeOf<typeof GetOrdersRes>

// export const GetOrderDetailRes = z.object({
//   message: z.string(),
//   data: OrderSchema.extend({
//     table: TableSchema
//   })
// })

// export type GetOrderDetailResType = z.TypeOf<typeof GetOrderDetailRes>

// export const PayGuestOrdersBody = z.object({
//   guestId: z.number()
// })

// export type PayGuestOrdersBodyType = z.TypeOf<typeof PayGuestOrdersBody>

// export const PayGuestOrdersRes = GetOrdersRes

// export type PayGuestOrdersResType = z.TypeOf<typeof PayGuestOrdersRes>

// export type CreateOrdersBodyType = z.TypeOf<typeof CreateOrdersBody>

// export const CreateOrdersRes = z.object({
//   message: z.string(),
//   data: z.array(OrderSchema)
// })

// export type CreateOrdersResType = z.TypeOf<typeof CreateOrdersRes>

interface OrderType {
  _id?: ObjectId
  guest_id: ObjectId | null
  table_number: number | null
  dish_snapshot_id: ObjectId | null
  quantity: number
  order_handler_id: ObjectId | null
  status: string
  created_at?: Date
  updated_at?: Date
}

export default class Order {
  _id?: ObjectId
  guest_id: ObjectId | null
  table_number: number | null
  dish_snapshot_id: ObjectId | null
  quantity: number
  order_handler_id: ObjectId | null
  status: string
  created_at?: Date
  updated_at?: Date

  constructor(order: OrderType) {
    const date = new Date()
    this._id = order._id
    this.guest_id = order.guest_id
    this.table_number = order.table_number
    this.dish_snapshot_id = order.dish_snapshot_id
    this.quantity = order.quantity
    this.order_handler_id = order.order_handler_id
    this.status = order.status
    this.created_at = order.created_at || date
    this.updated_at = order.updated_at || date
  }
}
