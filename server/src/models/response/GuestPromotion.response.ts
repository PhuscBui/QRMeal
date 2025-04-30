import { ApiResponse } from '~/type'
import GuestPromotion from '~/models/schemas/GuestPromotion.schema'

export type GetGuestPromotionByGuestId = ApiResponse<GuestPromotion[]>
export type CreateGuestPromotionResponse = ApiResponse<GuestPromotion>
export type DeleteGuestPromotionResponse = ApiResponse
