import { ObjectId } from 'mongodb'

type ApplicableTo = 'guest' | 'customer' | 'both'

type PromotionCategory = 'discount' | 'buy_x_get_y' | 'combo' | 'freeship'

interface PromotionCondition {
  min_spend?: number
  min_visits?: number
  min_loyalty_points?: number
  buy_quantity?: number
  get_quantity?: number
  applicable_items?: ObjectId[]
}

interface PromotionType {
  _id?: ObjectId
  name: string
  description: string
  category: PromotionCategory
  discount_type?: 'percentage' | 'fixed'
  discount_value?: number
  conditions?: PromotionCondition
  start_date: Date
  end_date: Date
  is_active: boolean
  applicable_to: ApplicableTo
  created_at?: Date
  updated_at?: Date
}

export default class Promotion {
  _id?: ObjectId
  name: string
  description: string
  category: PromotionCategory
  discount_type?: 'percentage' | 'fixed'
  discount_value?: number
  conditions?: PromotionCondition
  start_date: Date
  end_date: Date
  is_active: boolean
  applicable_to: ApplicableTo
  created_at?: Date
  updated_at?: Date

  constructor(promotion: PromotionType) {
    const date = new Date()
    this._id = promotion._id
    this.name = promotion.name
    this.description = promotion.description
    this.category = promotion.category
    this.discount_type = promotion.discount_type
    this.discount_value = promotion.discount_value
    this.conditions = promotion.conditions || {}
    this.start_date = promotion.start_date || date
    this.end_date = promotion.end_date || new Date(date.getTime() + 86400000)
    this.is_active = promotion.is_active ?? false
    this.applicable_to = promotion.applicable_to || 'both'
    this.created_at = promotion.created_at || date
    this.updated_at = promotion.updated_at || date
  }
}
