import { DishStatusValues, OrderStatusValues } from '@/constants/type'
import { AccountSchema } from '@/schemaValidations/account.schema'
import { TableSchema } from '@/schemaValidations/table.schema'
import z from 'zod'

const DishSnapshotSchema = z.object({
  _id: z.string(),
  name: z.string(),
  price: z.number(),
  image: z.string(),
  description: z.string(),
  status: z.enum(DishStatusValues),
  dish_id: z.string().nullable(),
  created_at: z.date(),
  updated_at: z.date()
})
export const OrderSchema = z.object({
  _id: z.string(),
  guest_id: z.string().nullable(),
  guest: z
    .object({
      _id: z.string(),
      name: z.string(),
      table_number: z.number().nullable(),
      created_at: z.date(),
      updated_at: z.date()
    })
    .nullable(),
  table_number: z.number().nullable(),
  dish_snapshot_id: z.string(),
  dish_snapshot: DishSnapshotSchema,
  quantity: z.number(),
  order_handler_id: z.number().nullable(),
  order_handler: AccountSchema.nullable(),
  status: z.enum(OrderStatusValues),
  created_at: z.date(),
  updated_at: z.date()
})

export const UpdateOrderBody = z.object({
  status: z.enum(OrderStatusValues),
  dish_id: z.string(),
  quantity: z.number()
})

export type UpdateOrderBodyType = z.TypeOf<typeof UpdateOrderBody>

export const OrderParam = z.object({
  orderId: z.coerce.number()
})

export type OrderParamType = z.TypeOf<typeof OrderParam>

export const UpdateOrderRes = z.object({
  message: z.string(),
  result: OrderSchema
})

export type UpdateOrderResType = z.TypeOf<typeof UpdateOrderRes>

export const GetOrdersQueryParams = z.object({
  fromDate: z.coerce.date().optional(),
  toDate: z.coerce.date().optional()
})

export type GetOrdersQueryParamsType = z.TypeOf<typeof GetOrdersQueryParams>

export const GetOrdersRes = z.object({
  message: z.string(),
  result: z.array(OrderSchema)
})

export type GetOrdersResType = z.TypeOf<typeof GetOrdersRes>

export const GetOrderDetailRes = z.object({
  message: z.string(),
  result: OrderSchema.extend({
    table: TableSchema
  })
})

export type GetOrderDetailResType = z.TypeOf<typeof GetOrderDetailRes>

export const PayGuestOrdersBody = z.object({
  guestId: z.string()
})

export type PayGuestOrdersBodyType = z.TypeOf<typeof PayGuestOrdersBody>

export const PayGuestOrdersRes = GetOrdersRes

export type PayGuestOrdersResType = z.TypeOf<typeof PayGuestOrdersRes>

export const CreateOrdersBody = z
  .object({
    guest_id: z.string(),
    orders: z.array(
      z.object({
        dish_id: z.string(),
        quantity: z.number()
      })
    )
  })
  .strict()

export type CreateOrdersBodyType = z.TypeOf<typeof CreateOrdersBody>

export const CreateOrdersRes = z.object({
  message: z.string(),
  result: z.array(OrderSchema)
})

export type CreateOrdersResType = z.TypeOf<typeof CreateOrdersRes>
