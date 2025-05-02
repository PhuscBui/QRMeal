import http from '@/lib/http'
import {
  CreateGuestPromotionBodyType,
  DeleteGuestPromotionBodyType,
  DeleteGuestPromotionResType,
  GuestPromotionResType
} from '@/schemaValidations/guest-promotion.schema'

const guestPromotionApiRequest = {
  add: (body: CreateGuestPromotionBodyType) => http.post<GuestPromotionResType>('guest-promotion', body),
  getGuestPromotion: (guestId: string) => http.get<GuestPromotionResType>(`guest-promotion/${guestId}`),
  deleteGuestPromotion: (body: DeleteGuestPromotionBodyType) =>
    http.post<DeleteGuestPromotionResType>('guest-promotion/cancel', body)
}

export default guestPromotionApiRequest
