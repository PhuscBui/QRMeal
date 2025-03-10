import { ApiResponse } from '~/type'

export interface AuthResponseResult {
  access_token: string
  refresh_token: string
}

export type AuthResponse = ApiResponse<AuthResponseResult>

export interface LogoutResponse {
  message: string
}
