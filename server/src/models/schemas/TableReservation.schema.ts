import { ObjectId } from 'mongodb'

interface TableReservationType {
  customer_id?: ObjectId
  guest_id?: ObjectId
  reservation_time: Date
  note: string
  is_customer: boolean
}

export class TableReservation {
  customer_id?: ObjectId
  guest_id?: ObjectId
  reservation_time: Date
  note: string
  is_customer: boolean

  constructor(tableReservation: TableReservationType) {
    this.guest_id = tableReservation.guest_id
    this.customer_id = tableReservation.customer_id
    this.reservation_time = tableReservation.reservation_time
    this.note = tableReservation.note
    this.is_customer = tableReservation.is_customer
  }
}
