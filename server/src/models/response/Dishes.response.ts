import Dish from '~/models/schemas/Dish.schema'
import { ApiResponse } from '~/type'

export type GetDishesResponse = ApiResponse<Dish[]>
export type GetDishResponse = ApiResponse<Dish>
export type CreateDishResponse = ApiResponse<Dish>
export type UpdateDishResponse = ApiResponse<Dish>
export type DeleteDishResponse = ApiResponse
