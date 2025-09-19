import { ParamsDictionary, Query } from 'express-serve-static-core'

type PromotionCategory = 'discount' | 'buy_x_get_y' | 'combo' | 'freeship' | 'loyalty'
type DiscountType = 'percentage' | 'fixed'
type ApplicableTo = 'guest' | 'customer' | 'both'

export interface PromotionConditions {
  min_spend?: number
  min_visits?: number
  min_loyalty_points?: number
  buy_quantity?: number
  get_quantity?: number
  applicable_items?: string[]
}

export interface CreatePromotionReqBody {
  name: string
  description: string
  category: PromotionCategory
  discount_type?: DiscountType
  discount_value?: number
  conditions?: PromotionConditions
  start_date: Date
  end_date: Date
  is_active: boolean
  applicable_to: ApplicableTo
}

export interface GetPromotionsQueryParams extends Query {
  active?: string
  category?: PromotionCategory
  applicable_to?: ApplicableTo
}

export interface PromotionParam extends ParamsDictionary {
  promotionId: string
}

export interface UpdatePromotionReqBody {
  name?: string
  description?: string
  category?: PromotionCategory
  discount_type?: DiscountType
  discount_value?: number
  conditions?: PromotionConditions
  start_date?: Date
  end_date?: Date
  is_active?: boolean
  applicable_to?: ApplicableTo
}
