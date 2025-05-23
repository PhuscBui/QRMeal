import { ParamsDictionary } from 'express-serve-static-core'

export interface CreateGuestPromotionReqBody {
  guest_id: string
  guest_phone: string
  promotion_id: string
}

export interface GuestPromotionReqParams extends ParamsDictionary {
  guestId: string
}

export interface GuestPromotionByPhoneReqParams extends ParamsDictionary {
  guestPhone: string
}
export interface DeleteGuestPromotionReqParams extends ParamsDictionary {
  guestPromotionId: string
}
export interface UsedPromotionReqBody {
  guest_id: string
  promotion_id: string
}

export interface DeleteGuestPromotionReqBody {
  guest_id: string
  promotion_id: string
}
