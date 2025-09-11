import { ObjectId } from 'mongodb'

interface LoyaltyType {
  _id?: ObjectId
  customer_id: ObjectId
  total_spend: number
  visit_count: number
  loyalty_points: number
  created_at?: Date
  updated_at?: Date
}

export default class Loyalty {
  _id?: ObjectId
  customer_id: ObjectId
  total_spend: number
  visit_count: number
  loyalty_points: number
  created_at?: Date
  updated_at?: Date
  constructor(loyalty: LoyaltyType) {
    const date = new Date()
    this._id = loyalty._id
    this.customer_id = loyalty.customer_id
    this.total_spend = loyalty.total_spend
    this.visit_count = loyalty.visit_count
    this.loyalty_points = loyalty.loyalty_points
    this.created_at = loyalty.created_at || date
    this.updated_at = loyalty.updated_at || date
  }
}
