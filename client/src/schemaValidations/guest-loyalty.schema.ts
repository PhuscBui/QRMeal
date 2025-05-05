import z from 'zod'

export const GuestLoyaltySchema = z.object({
  _id: z.string(),
  guest_phone: z.string(),
  total_spend: z.number(),
  visit_count: z.number(),
  loyalty_points: z.number(),
  created_at: z.date(),
  updated_at: z.date()
})

export const GuestLoyaltyRes = z.object({
  message: z.string(),
  result: GuestLoyaltySchema
})

export const GuestLoyaltyListRes = z.object({
  message: z.string(),
  result: z.array(GuestLoyaltySchema)
})

export type GuestLoyalty = z.infer<typeof GuestLoyaltySchema>
export type GuestLoyaltyResType = z.infer<typeof GuestLoyaltyRes>
export type GuestLoyaltyListResType = z.infer<typeof GuestLoyaltyListRes>

export const UpdateGuestLoyaltyBody = z.object({
  total_spend: z.number(),
  visit_count: z.number(),
  loyalty_points: z.number()
})

export type UpdateGuestLoyaltyBodyType = z.infer<typeof UpdateGuestLoyaltyBody>
