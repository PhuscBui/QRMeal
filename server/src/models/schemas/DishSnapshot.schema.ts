import { ObjectId } from 'mongodb'

interface DishSnapshotType {
  _id?: ObjectId
  name: string
  price: number
  image?: string
  description: string
  status: string
  dish_id: ObjectId | null
  created_at?: Date
  updated_at?: Date
}

export default class DishSnapshot {
  _id?: ObjectId
  name: string
  price: number
  image?: string
  description: string
  status: string
  dish_id: ObjectId | null
  created_at?: Date
  updated_at?: Date

  constructor(dishSnapshot: DishSnapshotType) {
    const date = new Date()
    this._id = dishSnapshot._id
    this.name = dishSnapshot.name
    this.price = dishSnapshot.price
    this.image = dishSnapshot.image || ''
    this.description = dishSnapshot.description
    this.status = dishSnapshot.status
    this.dish_id = dishSnapshot.dish_id
    this.created_at = dishSnapshot.created_at || date
    this.updated_at = dishSnapshot.updated_at || date
  }
}
