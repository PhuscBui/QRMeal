import http from '@/lib/http'
import {
  UpdateGuestLoyaltyBodyType,
  GuestLoyaltyResType,
  GuestLoyaltyListResType
} from '@/schemaValidations/guest-loyalty.schema'

const guestLoyaltyApiRequest = {
  update: (body: UpdateGuestLoyaltyBodyType, guestPhone: string) =>
    http.put<GuestLoyaltyResType>(`guest-loyalty/${guestPhone}`, body),
  getGuestLoyalty: (guestPhone: string) => http.get<GuestLoyaltyResType>(`guest-loyalty/${guestPhone}`),
  getAllGuestLoyalty: () => http.get<GuestLoyaltyListResType>(`guest-loyalty`)
}

export default guestLoyaltyApiRequest
