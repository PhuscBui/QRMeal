import { ParamsDictionary } from 'express-serve-static-core'

export interface CreateCustomerPromotionReqBody {
  customer_id: string
  promotion_id: string
}

export interface CustomerPromotionReqParams extends ParamsDictionary {
  customerId: string
}

export interface DeleteCustomerPromotionReqParams extends ParamsDictionary {
  customerPromotionId: string
}

export interface UsedPromotionReqBody {
  customer_id: string
  promotion_id: string
  order_group_ids: string[]
}

export interface DeleteCustomerPromotionReqBody {
  customer_id: string
  promotion_id: string
}
