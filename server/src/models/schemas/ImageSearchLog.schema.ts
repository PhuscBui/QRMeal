import { ObjectId } from 'mongodb'

interface ImageSearchLogType {
  _id?: ObjectId
  guest_id?: ObjectId
  uploaded_image_url: string
  matched_dish_ids: ObjectId[]
  confidence_scores: number[]
  created_at?: Date
}

export default class ImageSearchLog {
  _id?: ObjectId
  guest_id?: ObjectId
  uploaded_image_url: string
  matched_dish_ids: ObjectId[]
  confidence_scores: number[]
  created_at?: Date

  constructor(imageSearchLog: ImageSearchLogType) {
    const date = new Date()
    this._id = imageSearchLog._id
    this.guest_id = imageSearchLog.guest_id
    this.uploaded_image_url = imageSearchLog.uploaded_image_url
    this.matched_dish_ids = imageSearchLog.matched_dish_ids
    this.confidence_scores = imageSearchLog.confidence_scores
    this.created_at = imageSearchLog.created_at || date
  }
}
