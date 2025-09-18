import http from '@/lib/http'
import {
  CreateCustomerPromotionBodyType,
  CustomerPromotionResType,
  DeleteCustomerPromotionBodyType,
  DeleteCustomerPromotionResType
} from '@/schemaValidations/customer-promotion.schema'
import { UsedPromotionBodyType } from '@/schemaValidations/guest-promotion.schema'

const customerPromotionApiRequest = {
  add: (body: CreateCustomerPromotionBodyType) => http.post<CustomerPromotionResType>('customer-promotion', body),
  getCustomerPromotion: (customerId: string) => http.get<CustomerPromotionResType>(`customer-promotion/${customerId}`),
  usedPromotion: (body: UsedPromotionBodyType) => http.post<CustomerPromotionResType>('customer-promotion/used', body),
  deleteCustomerPromotion: (body: DeleteCustomerPromotionBodyType) =>
    http.post<DeleteCustomerPromotionResType>('customer-promotion/cancel', body)
}

export default customerPromotionApiRequest
