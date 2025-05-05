import { ParamsDictionary } from 'express-serve-static-core'
import { Query } from 'express-serve-static-core'

export interface GetRevenuesQueryParams extends Query {
  fromDate?: string
  toDate?: string
}

export interface GetRevenueByGuestPhoneParams extends ParamsDictionary {
  guestPhone: string
}

export interface CreateRevenueReqBody {
  guest_id: string
  guest_phone: string
  total_amount: number
}
