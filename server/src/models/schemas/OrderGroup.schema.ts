import { ObjectId } from 'mongodb'

interface OrderGroupType {
  _id?: ObjectId
  guest_id: ObjectId
  table_number?: string
  order_type: 'dine_in' | 'takeaway' | 'delivery'
  status: 'pending' | 'preparing' | 'completed' | 'canceled'
  created_at?: Date
  updated_at?: Date
}

export default class OrderGroup {
  _id?: ObjectId
  guest_id: ObjectId
  table_number?: string
  order_type: 'dine_in' | 'takeaway' | 'delivery'
  status: 'pending' | 'preparing' | 'completed' | 'canceled'
  created_at?: Date
  updated_at?: Date

  constructor(orderGroup: OrderGroupType) {
    const date = new Date()
    this._id = orderGroup._id
    this.guest_id = orderGroup.guest_id
    this.table_number = orderGroup.table_number
    this.order_type = orderGroup.order_type
    this.status = orderGroup.status
    this.created_at = orderGroup.created_at || date
    this.updated_at = orderGroup.updated_at || date
  }
}
