import { RoleValues } from '@/constants/type'
import { OrderSchema } from '@/schemaValidations/order.schema'
import z from 'zod'

const phoneRegex = new RegExp(/^([+]?[\s0-9]+)?(\d{3}|[(]?[0-9]+[)])?([-]?[\s]?[0-9])+$/)

export const GuestLoginBody = z
  .object({
    name: z.string().min(2).max(50),
    phone: z.string().regex(phoneRegex, 'Invalid Number!').min(10).max(10),
    table_number: z.number(),
    token: z.string()
  })
  .strict()

export type GuestLoginBodyType = z.TypeOf<typeof GuestLoginBody>

export const GuestLoginRes = z.object({
  result: z.object({
    access_token: z.string(),
    refresh_token: z.string(),
    guest: z.object({
      _id: z.string(),
      name: z.string(),
      phone: z.string(),
      role: z.enum(RoleValues),
      table_number: z.number().nullable(),
      created_at: z.date(),
      updated_at: z.date()
    })
  }),
  message: z.string()
})

export type GuestLoginResType = z.TypeOf<typeof GuestLoginRes>

export const GuestCreateOrdersBody = z.array(
  z.object({
    dish_id: z.string(),
    quantity: z.number()
  })
)

export type GuestCreateOrdersBodyType = z.TypeOf<typeof GuestCreateOrdersBody>

export const GuestCreateOrdersRes = z.object({
  message: z.string(),
  result: z.array(OrderSchema)
})

export type GuestCreateOrdersResType = z.TypeOf<typeof GuestCreateOrdersRes>

export const GuestGetOrdersRes = GuestCreateOrdersRes

export type GuestGetOrdersResType = z.TypeOf<typeof GuestGetOrdersRes>

export const GuestSchema = z.object({
  _id: z.string(),
  name: z.string(),
  phone: z.string(),
  role: z.enum(RoleValues),
  table_number: z.number().nullable()
})

export const GuestRes = z.object({
  message: z.string(),
  result: GuestSchema
})

export type GuestResType = z.TypeOf<typeof GuestRes>
