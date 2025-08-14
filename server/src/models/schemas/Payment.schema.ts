import { ObjectId } from 'mongodb'

interface PaymentType {
  _id?: ObjectId
  order_group_id: ObjectId
  amount: number
  method: 'stripe' | 'payos' | 'bank' | 'cod' | 'cash'
  status: 'pending' | 'success' | 'failed' | 'refunded'
  transaction_id?: string
  created_at?: Date
  updated_at?: Date
}

export default class Payment {
  _id?: ObjectId
  order_group_id: ObjectId
  amount: number
  method: 'stripe' | 'payos' | 'bank' | 'cod' | 'cash'
  status: 'pending' | 'success' | 'failed' | 'refunded'
  transaction_id?: string
  created_at?: Date
  updated_at?: Date

  constructor(payment: PaymentType) {
    const date = new Date()
    this._id = payment._id
    this.order_group_id = payment.order_group_id
    this.amount = payment.amount
    this.method = payment.method
    this.status = payment.status
    this.transaction_id = payment.transaction_id
    this.created_at = payment.created_at || date
    this.updated_at = payment.updated_at || date
  }
}
