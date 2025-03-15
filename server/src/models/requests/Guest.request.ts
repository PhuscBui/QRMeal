export interface GuestLoginReqBody {
  name: string
  token: string
  table_number: number
}

export interface GuestLogoutReqBody {
  refresh_token: string
}
