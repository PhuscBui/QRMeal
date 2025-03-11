import { ApiResponse } from '~/type'

export interface DishResponseResult {
  _id: string
  name: string
  price: number
  description: string
  image: string
  status: string
  created_at: string
  updated_at: string
}

export type GetDishesResponse = ApiResponse<DishResponseResult[]>
export type GetDishResponse = ApiResponse<DishResponseResult>
export type CreateDishResponse = ApiResponse<DishResponseResult>
export type UpdateDishResponse = ApiResponse<DishResponseResult>
export type DeleteDishResponse = ApiResponse
