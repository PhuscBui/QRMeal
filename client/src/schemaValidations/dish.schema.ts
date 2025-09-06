import { DishStatusValues } from '@/constants/type'
import z from 'zod'

export const CreateDishBody = z.object({
  name: z.string().min(1).max(256),
  price: z.coerce.number().positive(),
  description: z.string().max(10000),
  category_id: z.string().min(1).max(256),
  image: z.string().url().optional(),
  status: z.enum(DishStatusValues).optional()
})

export type CreateDishBodyType = z.TypeOf<typeof CreateDishBody>

export const DishSchema = z.object({
  _id: z.string(),
  name: z.string(),
  price: z.coerce.number(),
  description: z.string(),
  category_id: z.string().min(1).max(256),
  category_name: z.string().optional(),
  avg_rating: z.number().nullable().optional(),
  image: z.string().nullable(),
  status: z.enum(DishStatusValues),
  created_at: z.date(),
  updated_at: z.date()
})

export const DishRes = z.object({
  message: z.string(),
  result: DishSchema
})

export type DishResType = z.TypeOf<typeof DishRes>

export const DishListRes = z.object({
  message: z.string(),
  result: z.array(DishSchema)
})

export type DishListResType = z.TypeOf<typeof DishListRes>

export const UpdateDishBody = CreateDishBody
export type UpdateDishBodyType = CreateDishBodyType
export const DishParams = z.object({
  id: z.string()
})
export type DishParamsType = z.TypeOf<typeof DishParams>
