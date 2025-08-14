import { ObjectId } from 'mongodb'

interface DishType {
  _id?: ObjectId
  name: string
  price: number
  description: string
  category_ids: ObjectId[]
  image?: string
  status: string
  created_at?: Date
  updated_at?: Date
}

export default class Dish {
  _id?: ObjectId
  name: string
  price: number
  description: string
  category_ids: ObjectId[]
  image?: string
  status: string
  created_at: Date
  updated_at: Date

  constructor(dish: DishType) {
    const date = new Date()
    this._id = dish._id
    this.name = dish.name
    this.price = dish.price
    this.description = dish.description
    this.category_ids = dish.category_ids
    this.image = dish.image || ''
    this.status = dish.status
    this.created_at = dish.created_at || date
    this.updated_at = dish.updated_at || date
  }
}
