import z from 'zod'

export const CustomerPromotionSchema = z.object({
  _id: z.string(),
  customer_id: z.string(),
  promotion_id: z.string(),
  used: z.boolean(),
  create_at: z.date(),
  updated_at: z.date()
})

export type CustomerPromotion = z.infer<typeof CustomerPromotionSchema>

export const CreateCustomerPromotionBody = z.object({
  customer_id: z.string(),
  promotion_id: z.string()
})

export type CreateCustomerPromotionBodyType = z.infer<typeof CreateCustomerPromotionBody>

export const CustomerPromotionRes = z.object({
  message: z.string(),
  result: CustomerPromotionSchema
})

export type CustomerPromotionResType = z.infer<typeof CustomerPromotionRes>

export const DeleteCustomerPromotionRes = z.object({
  message: z.string()
})

export type DeleteCustomerPromotionResType = z.infer<typeof DeleteCustomerPromotionRes>

export const CustomerPromotionParams = z.object({
  customerId: z.string()
})

export type CustomerPromotionParamsType = z.infer<typeof CustomerPromotionParams>

export const DeleteCustomerPromotionBody = z.object({
  customer_id: z.string(),
  promotion_id: z.string()
})

export type DeleteCustomerPromotionBodyType = z.infer<typeof DeleteCustomerPromotionBody>

export const UsedPromotionBody = z.object({
  customer_id: z.string(),
  promotion_id: z.string()
})

export type UsedPromotionBodyType = z.infer<typeof UsedPromotionBody>
