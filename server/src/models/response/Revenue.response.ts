import Revenue from '~/models/schemas/Revenue.schema'
import { ApiResponse } from '~/type'

export type CreateRevenueResponse = ApiResponse<Revenue>
export type GetRevenueByGuestPhoneResponse = ApiResponse<Revenue[]>
export type GetRevenuesResponse = ApiResponse<Revenue[]>
