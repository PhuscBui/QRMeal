import { ParamsDictionary } from 'express-serve-static-core'

export interface UpdateGuestLoyaltyReqBody {
  total_spend: number
  visit_count: number
  loyalty_points: number
}

export interface GuestLoyaltyParams extends ParamsDictionary {
  guestPhone: string
}
