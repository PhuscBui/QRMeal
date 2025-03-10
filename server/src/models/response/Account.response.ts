import { ApiResponse } from '~/type'

export interface Employee {
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

export type CreateEmployeeResponse = ApiResponse<Employee>
export type GetEmployeeResponse = ApiResponse<Employee>
export type GetEmployeesResponse = ApiResponse<Employee[]>
export type UpdateEmployeeResponse = ApiResponse<Employee>
export type DeleteEmployeeResponse = ApiResponse
