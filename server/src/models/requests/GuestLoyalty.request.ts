import { ParamsDictionary } from 'express-serve-static-core'

export interface UpdateLoyaltyReqBody {
  total_spend: number
  visit_count: number
  loyalty_points: number
}

export interface LoyaltyParams extends ParamsDictionary {
  customerId: string
}
