import { DeliveryStatusValues, DishStatusValues, OrderStatusValues, OrderTypeValues } from '@/constants/type'
import { AccountSchema } from '@/schemaValidations/account.schema'
import { TableSchema } from '@/schemaValidations/table.schema'
import z from 'zod'

const DishSnapshotSchema = z.object({
  _id: z.string(),
  name: z.string(),
  price: z.number(),
  image: z.string(),
  category_id: z.string().min(1).max(256),
  description: z.string(),
  status: z.enum(DishStatusValues),
  dish_id: z.string().nullable(),
  created_at: z.date(),
  updated_at: z.date()
})

// Guest info
export const GuestSchema = z.object({
  _id: z.string(),
  name: z.string(),
  phone: z.string(),
  table_number: z.number().nullable(),
  role: z.string(),
  created_at: z.string(),
  updated_at: z.string()
})

// Customer (simplified)
export const CustomerSchema = z.object({
  _id: z.string(),
  name: z.string(),
  phone: z.string(),
  email: z.string(),
  avatar: z.string(),
  role: z.string(),
  date_of_birth: z.string().datetime(),
  owner_id: z.string().nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime()
})

// Delivery info
export const DeliverySchema = z.object({
  _id: z.string(),
  order_group_id: z.string(),
  address: z.string(),
  notes: z.string().nullable(),
  receiver_name: z.string(),
  receiver_phone: z.string(),
  delivery_status: z.string(),
  shipper_info: z.string().nullable(),
  estimated_time: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string()
})

// Order item (trong 1 order group)
export const OrderSchema = z.object({
  _id: z.string(),
  order_group_id: z.string(),
  dish_snapshot_id: z.string(),
  quantity: z.number(),
  order_handler_id: z.string().nullable(),
  status: z.enum(OrderStatusValues),
  created_at: z.string(),
  updated_at: z.string(),
  dish_snapshot: DishSnapshotSchema,
  order_handler: AccountSchema.optional().nullable()
})

// OrderGroup = 1 nhóm order (dine-in / delivery)
export const OrderGroupSchema = z.object({
  _id: z.string(),
  customer_id: z.string().nullable(),
  guest_id: z.string().nullable(),
  table_number: z.number().nullable(),
  order_type: z.enum(OrderTypeValues),
  status: z.enum(OrderStatusValues),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  // Related data
  delivery: DeliverySchema.nullable(),
  takeaway_info: z
    .object({
      pickup_time: z.string().datetime().optional(),
      customer_name: z.string(),
      customer_phone: z.string(),
      notes: z.string().optional().nullable()
    })
    .nullable(),
  customer: CustomerSchema.nullable(),
  guest: GuestSchema.nullable(),
  orders: z.array(OrderSchema),
  table: TableSchema.nullable().optional()
})

export const CreateOrderGroupBody = z.object({
  customer_id: z.string().optional(),
  guest_id: z.string().optional(),
  table_number: z.number().nullable().optional(),
  order_type: z.enum(['dine-in', 'delivery', 'takeaway']),
  orders: z.array(
    z.object({
      dish_id: z.string(),
      quantity: z.number()
    })
  ),
  delivery_info: z
    .object({
      address: z.string(),
      receiver_name: z.string(),
      receiver_phone: z.string(),
      notes: z.string().optional().nullable()
    })
    .optional(),
  takeaway_info: z
    .object({
      pickup_time: z.string().optional(),
      customer_name: z.string(),
      customer_phone: z.string(),
      notes: z.string().optional().nullable()
    })
    .optional()
})
export type CreateOrderGroupBodyType = z.TypeOf<typeof CreateOrderGroupBody>

export const UpdateOrderBody = z.object({
  status: z.enum(OrderStatusValues),
  dish_id: z.string(),
  quantity: z.number().min(1).optional()
})

export type UpdateOrderBodyType = z.TypeOf<typeof UpdateOrderBody>

export const PayOrdersBody = z.object({
  customer_id: z.string().optional(),
  guest_id: z.string().optional(),
  is_customer: z.boolean().default(false)
})
export type PayOrdersBodyType = z.TypeOf<typeof PayOrdersBody>

export const UpdateDeliveryStatusBody = z.object({
  delivery_status: z.enum(DeliveryStatusValues),
  shipper_info: z.string().optional(),
  estimated_time: z.string().optional()
})
export type UpdateDeliveryStatusBodyType = z.TypeOf<typeof UpdateDeliveryStatusBody>

// -------------------- Params --------------------
export const OrderParam = z.object({
  order_id: z.string()
})
export type OrderParamType = z.TypeOf<typeof OrderParam>

export const OrderGroupParam = z.object({
  order_group_id: z.string()
})
export type OrderGroupParamType = z.TypeOf<typeof OrderGroupParam>

// -------------------- Query --------------------
export const GetOrdersQueryParams = z.object({
  fromDate: z.coerce.date().optional(),
  toDate: z.coerce.date().optional(),
  status: z.enum(OrderStatusValues).optional(),
  order_type: z.enum(['dine-in', 'delivery', 'takeaway']).optional(),
  customer_id: z.string().optional(),
  guest_id: z.string().optional()
})
export type GetOrdersQueryParamsType = z.TypeOf<typeof GetOrdersQueryParams>

// -------------------- Response Schemas --------------------
export const GetOrdersRes = z.object({
  message: z.string(),
  result: z.array(OrderGroupSchema)
})
export type GetOrdersResType = z.TypeOf<typeof GetOrdersRes>

export const GetOrderDetailRes = z.object({
  message: z.string(),
  result: OrderGroupSchema.extend({
    table: TableSchema.nullable()
  })
})
export type GetOrderDetailResType = z.TypeOf<typeof GetOrderDetailRes>

export const UpdateOrderRes = z.object({
  message: z.string(),
  result: OrderSchema.extend({
    order_group: OrderGroupSchema.omit({ orders: true, customer: true, guest: true, table: true, delivery: true }),
    customer: CustomerSchema.nullable(),
    guest: GuestSchema.nullable()
  })
})

export type UpdateOrderResType = z.TypeOf<typeof UpdateOrderRes>

export const CreateOrderGroupRes = z.object({
  message: z.string(),
  result: z.object({
    orderGroup: OrderGroupSchema.omit({
      orders: true,
      created_at: true,
      updated_at: true,
      table: true
    }),
    orders: z.array(OrderSchema)
  })
})
export type CreateOrderGroupResType = z.TypeOf<typeof CreateOrderGroupRes>

export const PayOrdersRes = GetOrdersRes
export type PayOrdersResType = z.TypeOf<typeof PayOrdersRes>

export const UpdateDeliveryRes = z.object({
  message: z.string(),
  result: OrderGroupSchema
})

export type UpdateDeliveryResType = z.TypeOf<typeof UpdateDeliveryRes>
