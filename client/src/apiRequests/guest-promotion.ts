import http from '@/lib/http'
import {
  CreateGuestPromotionBodyType,
  DeleteGuestPromotionBodyType,
  DeleteGuestPromotionResType,
  GuestPromotionResType,
  UsedPromotionBodyType
} from '@/schemaValidations/guest-promotion.schema'

const guestPromotionApiRequest = {
  add: (body: CreateGuestPromotionBodyType) => http.post<GuestPromotionResType>('guest-promotion', body),
  getGuestPromotion: (guestId: string) => http.get<GuestPromotionResType>(`guest-promotion/${guestId}`),
  getGuestPromotionByPhone: (guestPhone: string) =>
    http.get<GuestPromotionResType>(`guest-promotion/phone/${guestPhone}`),
  usedPromotion: (body: UsedPromotionBodyType) => http.post<GuestPromotionResType>('guest-promotion/used', body),
  deleteGuestPromotion: (body: DeleteGuestPromotionBodyType) =>
    http.post<DeleteGuestPromotionResType>('guest-promotion/cancel', body)
}

export default guestPromotionApiRequest
