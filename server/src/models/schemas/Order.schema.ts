import { ObjectId } from 'mongodb'

interface OrderType {
  _id?: ObjectId
  guest_id: ObjectId | null
  table_number: number | null
  dish_snapshot_id: ObjectId | null
  quantity: number
  order_handler_id: ObjectId | null
  status: string
  created_at?: Date
  updated_at?: Date
}

export default class Order {
  _id?: ObjectId
  guest_id: ObjectId | null
  table_number: number | null
  dish_snapshot_id: ObjectId | null
  quantity: number
  order_handler_id: ObjectId | null
  status: string
  created_at?: Date
  updated_at?: Date

  constructor(order: OrderType) {
    const date = new Date()
    this._id = order._id
    this.guest_id = order.guest_id
    this.table_number = order.table_number
    this.dish_snapshot_id = order.dish_snapshot_id
    this.quantity = order.quantity
    this.order_handler_id = order.order_handler_id
    this.status = order.status
    this.created_at = order.created_at || date
    this.updated_at = order.updated_at || date
  }
}
