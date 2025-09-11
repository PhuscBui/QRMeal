import { ApplicableToValues, DiscountTypeValues, PromotionCategoryValues } from '@/constants/type'
import z from 'zod'

// Conditions schema
export const PromotionConditions = z.object({
  min_spend: z.coerce.number().optional(),
  min_visits: z.coerce.number().optional(),
  min_loyalty_points: z.coerce.number().optional(),
  buy_quantity: z.coerce.number().optional(),
  get_quantity: z.coerce.number().optional(),
  applicable_items: z.array(z.string()).optional() // ObjectId dưới dạng string
})

// Main schema
export const PromotionSchema = z.object({
  _id: z.string(),
  name: z.string(),
  description: z.string(),
  category: z.enum(PromotionCategoryValues),
  discount_type: z.enum(DiscountTypeValues).optional(),
  discount_value: z.number().optional(),
  conditions: PromotionConditions.optional(),
  start_date: z.date(),
  end_date: z.date(),
  is_active: z.boolean(),
  applicable_to: z.enum(ApplicableToValues)
})

// API response
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

// Base schema chưa refine
const BasePromotionBody = z.object({
  name: z.string().min(1).max(256),
  description: z.string().max(10000),
  category: z.enum(PromotionCategoryValues),
  discount_type: z.enum(DiscountTypeValues).optional(),
  discount_value: z.coerce.number().optional(),
  conditions: PromotionConditions.optional(),
  start_date: z.coerce.date(),
  end_date: z.coerce.date(),
  is_active: z.boolean(),
  applicable_to: z.enum(ApplicableToValues)
})

// Create = base + refine
export const CreatePromotionBody = BasePromotionBody.superRefine((data, ctx) => {
  if (data.category === 'discount') {
    if (!data.discount_type || data.discount_value === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'discount_type and discount_value are required for discount category'
      })
    }
  }

  if (data.category === 'buy_x_get_y') {
    if (!data.conditions?.buy_quantity || !data.conditions?.get_quantity) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'buy_quantity and get_quantity are required for buy_x_get_y category'
      })
    }
  }
})

// Update = chỉ cần partial base

export type CreatePromotionBodyType = z.TypeOf<typeof CreatePromotionBody>

// Params
export const PromotionParams = z.object({
  promotionId: z.string()
})
export type PromotionParamsType = z.TypeOf<typeof PromotionParams>

// Query params
export const GetPromotionsQueryParams = z.object({
  active: z.string().optional(),
  category: z.enum(PromotionCategoryValues).optional(),
  applicable_to: z.enum(ApplicableToValues).optional()
})
export type GetPromotionsQuery = z.TypeOf<typeof GetPromotionsQueryParams>

// Delete response
export const DeletePromotionRes = z.object({
  message: z.string()
})
export type DeletePromotionResType = z.TypeOf<typeof DeletePromotionRes>

// Update body (optional fields)
export const UpdatePromotionBody = BasePromotionBody.partial()
export type UpdatePromotionBodyType = z.TypeOf<typeof UpdatePromotionBody>
