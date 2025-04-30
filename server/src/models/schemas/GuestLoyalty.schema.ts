import { ObjectId } from 'mongodb'

interface GuestLoyaltyType {
  _id?: ObjectId
  guest_phone: string
  total_spend: number
  visit_count: number
  loyalty_points: number
  created_at?: Date
  updated_at?: Date
}

export default class GuestLoyalty {
  _id?: ObjectId
  guest_phone: string
  total_spend: number
  visit_count: number
  loyalty_points: number
  created_at?: Date
  updated_at?: Date

  constructor(guestLoyalty: GuestLoyaltyType) {
    const date = new Date()
    this._id = guestLoyalty._id
    this.guest_phone = guestLoyalty.guest_phone
    this.total_spend = guestLoyalty.total_spend
    this.visit_count = guestLoyalty.visit_count
    this.loyalty_points = guestLoyalty.loyalty_points
    this.created_at = guestLoyalty.created_at || date
    this.updated_at = guestLoyalty.updated_at || date
  }
}
