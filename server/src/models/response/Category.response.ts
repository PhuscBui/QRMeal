import Category from '~/models/schemas/Category.schema'
import { ApiResponse } from '~/type'

export interface CategoryWithDishCount extends Category {
  dish_count: number
}

export type GetCategoriesWithDishCountResponse = ApiResponse<CategoryWithDishCount[]>
export type GetCategoryWithDishCountResponse = ApiResponse<CategoryWithDishCount>
export type GetCategoriesResponse = ApiResponse<Category[]>
export type GetCategoryResponse = ApiResponse<Category>
export type CreateCategoryResponse = ApiResponse<Category>
export type UpdateCategoryResponse = ApiResponse<Category>
export type DeleteCategoryResponse = ApiResponse
