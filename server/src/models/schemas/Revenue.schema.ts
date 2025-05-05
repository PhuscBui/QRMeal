import { ObjectId } from 'mongodb'

interface RevenueType {
  _id?: ObjectId
  guest_id: string
  guest_phone: string | null
  total_amount: number
  created_at?: Date
}

export default class Revenue {
  _id?: ObjectId
  guest_id: string
  guest_phone: string | null
  total_amount: number
  created_at: Date

  constructor(revenue: RevenueType) {
    const date = new Date()
    this._id = revenue._id
    this.guest_id = revenue.guest_id
    this.guest_phone = revenue.guest_phone
    this.total_amount = revenue.total_amount
    this.created_at = revenue.created_at || date
  }
}
