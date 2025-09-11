import http from '@/lib/http'
import { LoyaltyListResType, LoyaltyResType, UpdateLoyaltyBodyType } from '@/schemaValidations/loyalty.schema'

const loyaltyApiRequest = {
  update: (body: UpdateLoyaltyBodyType, customerId: string) =>
    http.put<LoyaltyResType>(`loyalties/${customerId}`, body),
  getLoyalty: (customerId?: string) => http.get<LoyaltyResType>(`loyalties/${customerId}`),
  getAllGuestLoyalty: () => http.get<LoyaltyListResType>(`loyalties`)
}

export default loyaltyApiRequest
