import { ObjectId } from "mongodb"

interface TableReservationType {
  guest_id: ObjectId
  reservation_time: Date
  note: string
}

export class TableReservation {
  guest_id: ObjectId
  reservation_time: Date
  note: string

  constructor(tableReservation: TableReservationType) {
    this.guest_id = tableReservation.guest_id
    this.reservation_time = tableReservation.reservation_time
    this.note = tableReservation.note
  }
}