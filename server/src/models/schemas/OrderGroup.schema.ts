import { ObjectId } from 'mongodb'

interface OrderGroupType {
  _id?: ObjectId
  customer_id?: ObjectId | null
  guest_id?: ObjectId | null
  table_number?: number | null
  order_type: string
  status: string
  created_at?: Date
  updated_at?: Date
}

export default class OrderGroup {
  _id?: ObjectId
  customer_id?: ObjectId | null
  guest_id?: ObjectId | null
  table_number?: number | null
  order_type: string
  status: string
  created_at?: Date
  updated_at?: Date

  constructor(orderGroup: OrderGroupType) {
    const date = new Date()
    this._id = orderGroup._id
    this.customer_id = orderGroup.customer_id
    this.guest_id = orderGroup.guest_id
    this.table_number = orderGroup.table_number
    this.order_type = orderGroup.order_type
    this.status = orderGroup.status
    this.created_at = orderGroup.created_at || date
    this.updated_at = orderGroup.updated_at || date
  }
}
