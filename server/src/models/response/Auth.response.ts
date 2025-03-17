import { ApiResponse } from '~/type'

export interface AuthResponseResult {
  access_token: string
  refresh_token: string
  account: {
    id: string
    name: string
    email: string
    role: string
  }
}

export type AuthResponse = ApiResponse<AuthResponseResult>

export interface LogoutResponse {
  message: string
}
