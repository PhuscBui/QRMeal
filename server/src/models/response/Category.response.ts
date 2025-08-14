import Category from '~/models/schemas/Category.schema'
import { ApiResponse } from '~/type'

export type GetCategoriesResponse = ApiResponse<Category[]>
export type GetCategoryResponse = ApiResponse<Category>
export type CreateCategoryResponse = ApiResponse<Category>
export type UpdateCategoryResponse = ApiResponse<Category>
export type DeleteCategoryResponse = ApiResponse
