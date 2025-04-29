import Promotion from '~/models/schemas/Promotion.schema'
import { ApiResponse } from '~/type'

export type GetPromotionsResponse = ApiResponse<Promotion[]>
export type GetPromotionResponse = ApiResponse<Promotion>
export type CreatePromotionResponse = ApiResponse<Promotion>
export type UpdatePromotionResponse = ApiResponse<Promotion>
export type DeletePromotionResponse = ApiResponse
