import { ObjectId } from 'mongodb'

interface PromotionType {
  _id?: ObjectId
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
  created_at?: Date
  updated_at?: Date
}

export default class Promotion {
  _id?: ObjectId
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
  created_at?: Date
  updated_at?: Date

  constructor(promotion: PromotionType) {
    const date = new Date()
    this._id = promotion._id
    this.name = promotion.name
    this.description = promotion.description
    this.discount_type = promotion.discount_type
    this.discount_value = promotion.discount_value
    this.min_spend = promotion.min_spend
    this.min_visits = promotion.min_visits
    this.min_loyalty_points = promotion.min_loyalty_points
    this.start_date = promotion.start_date || date
    this.end_date = promotion.end_date || date.setTime(date.getTime() + 86400000) // 1 day later
    this.is_active = promotion.is_active || false
    this.created_at = promotion.created_at || date
    this.updated_at = promotion.updated_at || date
  }
}
