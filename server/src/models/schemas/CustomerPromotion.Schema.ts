import { ObjectId } from 'mongodb'

interface CustomerPromotionType {
  _id?: ObjectId
  customer_id: ObjectId
  promotion_id: ObjectId
  used?: boolean
  created_at?: Date
  updated_at?: Date
}

export default class CustomerPromotion {
  _id?: ObjectId
  customer_id: ObjectId
  promotion_id: ObjectId
  used?: boolean
  created_at?: Date
  updated_at?: Date

  constructor(guestPromotion: CustomerPromotionType) {
    const date = new Date()
    this._id = guestPromotion._id
    this.customer_id = guestPromotion.customer_id
    this.promotion_id = guestPromotion.promotion_id
    this.used = guestPromotion.used || false
    this.created_at = guestPromotion.created_at || date
    this.updated_at = guestPromotion.updated_at || date
  }
}
