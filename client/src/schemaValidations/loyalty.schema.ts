import z from 'zod'

export const LoyaltySchema = z.object({
  _id: z.string(),
  customer_id: z.string(),
  total_spend: z.number(),
  visit_count: z.number(),
  loyalty_points: z.number(),
  created_at: z.date(),
  updated_at: z.date()
})

export const LoyaltyRes = z.object({
  message: z.string(),
  result: LoyaltySchema
})

export const LoyaltyListRes = z.object({
  message: z.string(),
  result: z.array(LoyaltySchema)
})

export type Loyalty = z.infer<typeof LoyaltySchema>
export type LoyaltyResType = z.infer<typeof LoyaltyRes>
export type LoyaltyListResType = z.infer<typeof LoyaltyListRes>

export const UpdateLoyaltyBody = z.object({
  total_spend: z.number(),
  visit_count: z.number(),
  loyalty_points: z.number()
})

export type UpdateLoyaltyBodyType = z.infer<typeof UpdateLoyaltyBody>
