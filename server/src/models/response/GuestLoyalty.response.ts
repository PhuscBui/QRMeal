import { ApiResponse } from '~/type'

import GuestLoyalty from '~/models/schemas/GuestLoyalty.schema'

export type GetGuestLoyaltyResponse = ApiResponse<GuestLoyalty[]>
export type GetGuestLoyaltyByPhoneResponse = ApiResponse<GuestLoyalty>
export type UpdateGuestLoyaltyResponse = ApiResponse<GuestLoyalty>
export type DeleteGuestLoyaltyResponse = ApiResponse
