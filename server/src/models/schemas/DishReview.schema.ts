import { ObjectId } from 'mongodb'

interface DishReviewType {
  _id?: ObjectId
  guest_id: ObjectId
  dish_id: ObjectId
  rating: number
  comment?: string
  created_at?: Date
  updated_at?: Date
}

export default class DishReview {
  _id?: ObjectId
  guest_id: ObjectId
  dish_id: ObjectId
  rating: number
  comment?: string
  created_at?: Date
  updated_at?: Date

  constructor(dishReview: DishReviewType) {
    const date = new Date()
    this._id = dishReview._id
    this.guest_id = dishReview.guest_id
    this.dish_id = dishReview.dish_id
    this.rating = dishReview.rating
    this.comment = dishReview.comment
    this.created_at = dishReview.created_at || date
    this.updated_at = dishReview.updated_at || date
  }
}
