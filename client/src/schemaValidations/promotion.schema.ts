import { PromotionTypeValues } from '@/constants/type'
import z from 'zod'

export const PromotionSchema = z.object({
  _id: z.string(),
  name: z.string(),
  description: z.string(),
  discount_type: z.enum(PromotionTypeValues),
  discount_value: z.number(),
  min_spend: z.number(),
  min_visits: z.number(),
  min_loyalty_points: z.number(),
  start_date: z.date(),
  end_date: z.date(),
  is_active: z.boolean()
})

export const PromotionRes = z.object({
  message: z.string(),
  result: PromotionSchema
})

export type PromotionResType = z.TypeOf<typeof PromotionRes>

export const PromotionListRes = z.object({
  message: z.string(),
  result: z.array(PromotionSchema)
})

export type PromotionListResType = z.TypeOf<typeof PromotionListRes>

export const CreatePromotionBody = z.object({
  name: z.string().min(1).max(256),
  description: z.string().max(10000),
  discount_type: z.enum(PromotionTypeValues),
  discount_value: z.coerce.number(),
  min_spend: z.coerce.number(),
  min_visits: z.coerce.number(),
  min_loyalty_points: z.coerce.number(),
  start_date: z.date(),
  end_date: z.date(),
  is_active: z.boolean()
})

export type CreatePromotionBodyType = z.TypeOf<typeof CreatePromotionBody>

export const PromotionParams = z.object({
  promotionId: z.string()
})

export type PromotionParamsType = z.TypeOf<typeof PromotionParams>

export const GetPromotionsQueryParams = z.object({
  active: z.string().optional()
})

export type GetPromotionsQuery = z.TypeOf<typeof GetPromotionsQueryParams>

export const DeletePromotionRes = z.object({
  message: z.string()
})

export type DeletePromotionResType = z.TypeOf<typeof DeletePromotionRes>

export const UpdatePromotionBody = CreatePromotionBody
export type UpdatePromotionBodyType = CreatePromotionBodyType
