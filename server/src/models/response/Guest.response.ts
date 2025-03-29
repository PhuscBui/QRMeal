import { GuestResponseResult } from '~/models/response/Account.response'
import { OrderResponseResult } from '~/models/response/Order.response'
import { ApiResponse } from '~/type'

export interface GuestLoginResponseResult {
  access_token: string
  refresh_token: string
  guest: GuestResponseResult
}

export type GuestLoginResponse = ApiResponse<GuestLoginResponseResult>
export type GuestLogoutResponse = ApiResponse
export type GuestCreateOrdersResponse = ApiResponse<OrderResponseResult[]>
