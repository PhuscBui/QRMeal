import { ObjectId } from 'mongodb'

interface DishReviewType {
  _id?: ObjectId
  dish_id: ObjectId
  author_id: ObjectId
  author_type: string
  rating: number
  comment?: string
  created_at?: Date
  updated_at?: Date
}

export default class DishReview {
  _id?: ObjectId
  author_id: ObjectId
  author_type: string
  dish_id: ObjectId
  rating: number
  comment?: string
  created_at?: Date
  updated_at?: Date

  constructor(dishReview: DishReviewType) {
    const date = new Date()
    this._id = dishReview._id
    this.author_id = dishReview.author_id
    this.author_type = dishReview.author_type
    this.dish_id = dishReview.dish_id
    this.rating = dishReview.rating
    this.comment = dishReview.comment
    this.created_at = dishReview.created_at || date
    this.updated_at = dishReview.updated_at || date
  }
}
