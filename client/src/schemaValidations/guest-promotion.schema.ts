import z from 'zod'

export const GuestPromotionSchema = z.object({
  _id: z.string(),
  guest_id: z.string(),
  guest_phone: z.string(),
  promotion_id: z.string(),
  used: z.boolean(),
  create_at: z.date(),
  updated_at: z.date()
})

export type GuestPromotion = z.infer<typeof GuestPromotionSchema>

export const CreateGuestPromotionBody = z.object({
  guest_id: z.string(),
  guest_phone: z.string(),
  promotion_id: z.string()
})

export type CreateGuestPromotionBodyType = z.infer<typeof CreateGuestPromotionBody>

export const GuestPromotionRes = z.object({
  message: z.string(),
  result: GuestPromotionSchema
})

export type GuestPromotionResType = z.infer<typeof GuestPromotionRes>

export const DeleteGuestPromotionRes = z.object({
  message: z.string()
})

export type DeleteGuestPromotionResType = z.infer<typeof DeleteGuestPromotionRes>

export const GuestPromotionParams = z.object({
  guestId: z.string()
})

export type GuestPromotionParamsType = z.infer<typeof GuestPromotionParams>

export const DeleteGuestPromotionBody = z.object({
  guest_id: z.string(),
  promotion_id: z.string()
})

export type DeleteGuestPromotionBodyType = z.infer<typeof DeleteGuestPromotionBody>

export const UsedPromotionBody = z.object({
  guest_id: z.string(),
  promotion_id: z.string()
})

export type UsedPromotionBodyType = z.infer<typeof UsedPromotionBody>
