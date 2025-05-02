import http from '@/lib/http'
import queryString from 'query-string'

import {
  CreatePromotionBodyType,
  PromotionListResType,
  PromotionResType,
  GetPromotionsQuery,
  DeletePromotionResType,
  UpdatePromotionBodyType
} from '@/schemaValidations/promotion.schema'

const promotionApiRequest = {
  createPromotion: (body: CreatePromotionBodyType) => http.post<PromotionResType>('/promotions', body),
  getPromotionList: (queryParams?: GetPromotionsQuery) =>
    http.get<PromotionListResType>(
      '/promotions?' +
        queryString.stringify({
          active: queryParams?.active
        })
    ),
  getPromotionDetail: (promotionId: string) => http.get<PromotionResType>(`/promotions/${promotionId}`),
  updatePromotion: (promotionId: string, body: UpdatePromotionBodyType) =>
    http.put<PromotionResType>(`/promotions/${promotionId}`, body),
  deletePromotion: (promotionId: string) => http.delete<DeletePromotionResType>(`/promotions/${promotionId}`)
}
export default promotionApiRequest
