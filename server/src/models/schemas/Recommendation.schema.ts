import { ObjectId } from 'mongodb'

interface RecommendationType {
  _id?: ObjectId
  guest_id: ObjectId
  dish_id: ObjectId
  score: number
  reason: string
  created_at?: Date
}

export default class Recommendation {
  _id?: ObjectId
  guest_id: ObjectId
  dish_id: ObjectId
  score: number
  reason: string
  created_at?: Date

  constructor(recommendation: RecommendationType) {
    const date = new Date()
    this._id = recommendation._id
    this.guest_id = recommendation.guest_id
    this.dish_id = recommendation.dish_id
    this.score = recommendation.score
    this.reason = recommendation.reason
    this.created_at = recommendation.created_at || date
  }
}
