import { ParamsDictionary } from 'express-serve-static-core'

export interface CreatePromotionReqBody {
  name: string
  description: string
  discount_type: string
  discount_value: number
  min_spend: number
  min_visits: number
  min_loyalty_points: number
  start_date: Date
  end_date: Date
  is_active: boolean
}

export interface GetPromotionsQueryParams {
  active?: string
}

export interface PromotionParam extends ParamsDictionary {
  promotionId: string
}

export interface UpdatePromotionReqBody {
  name: string
  description: string
  discount_type: string
  discount_value: number
  min_spend: number
  min_visits: number
  min_loyalty_points: number
  start_date: Date
  end_date: Date
  is_active: boolean
}
