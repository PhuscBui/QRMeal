import { ObjectId } from 'mongodb'

interface DeliveryType {
  _id?: ObjectId
  order_group_id: ObjectId
  address: string
  notes?: string
  receiver_name: string
  receiver_phone: string
  delivery_status: string
  shipper_info?: string
  estimated_time?: Date
  created_at?: Date
  updated_at?: Date
}

export default class Delivery {
  _id?: ObjectId
  order_group_id: ObjectId
  address: string
  notes?: string
  receiver_name: string
  receiver_phone: string
  delivery_status: string
  shipper_info?: string
  estimated_time?: Date
  created_at?: Date
  updated_at?: Date

  constructor(delivery: DeliveryType) {
    const date = new Date()
    this._id = delivery._id
    this.order_group_id = delivery.order_group_id
    this.address = delivery.address
    this.notes = delivery.notes
    this.receiver_name = delivery.receiver_name
    this.receiver_phone = delivery.receiver_phone
    this.delivery_status = delivery.delivery_status
    this.shipper_info = delivery.shipper_info
    this.estimated_time = delivery.estimated_time
    this.created_at = delivery.created_at || date
    this.updated_at = delivery.updated_at || date
  }
}
