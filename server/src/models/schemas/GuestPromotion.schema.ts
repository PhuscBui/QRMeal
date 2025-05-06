import { ObjectId } from 'mongodb'

interface GuestPromotionType {
  _id?: ObjectId
  guest_id: ObjectId
  guest_phone: string
  promotion_id: ObjectId
  used?: boolean
  created_at?: Date
  updated_at?: Date
}

export default class GuestPromotion {
  _id?: ObjectId
  guest_id: ObjectId
  guest_phone: string
  promotion_id: ObjectId
  used?: boolean
  created_at?: Date
  updated_at?: Date

  constructor(guestPromotion: GuestPromotionType) {
    const date = new Date()
    this._id = guestPromotion._id
    this.guest_id = guestPromotion.guest_id
    this.guest_phone = guestPromotion.guest_phone
    this.promotion_id = guestPromotion.promotion_id
    this.used = guestPromotion.used || false
    this.created_at = guestPromotion.created_at || date
    this.updated_at = guestPromotion.updated_at || date
  }
}
