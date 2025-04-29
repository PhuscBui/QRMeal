export interface GuestLoginReqBody {
  name: string
  phone: string
  token: string
  table_number: number
}

export interface GuestLogoutReqBody {
  refresh_token: string
}

export interface GuestCreateOrderReqBody {
  dish_id: string
  quantity: number
}

export type GuestCreateOrdersReqBody = GuestCreateOrderReqBody[]
