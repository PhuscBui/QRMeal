import { ApiResponse } from '~/type'

export interface AccountResponseResult {
  _id: string
  name: string
  email: string
  avatar: string
  role: string
  date_of_birth: string
  owner_id: string
  created_at: string
  updated_at: string
}

export type CreateEmployeeResponse = ApiResponse<AccountResponseResult>
export type GetEmployeeResponse = ApiResponse<AccountResponseResult>
export type GetEmployeesResponse = ApiResponse<AccountResponseResult[]>
export type UpdateEmployeeResponse = ApiResponse<AccountResponseResult>
export type DeleteEmployeeResponse = ApiResponse
export type GetMeResponse = ApiResponse<AccountResponseResult>
export type UpdateMeResponse = ApiResponse<AccountResponseResult>
export type ChangePasswordResponse = ApiResponse
