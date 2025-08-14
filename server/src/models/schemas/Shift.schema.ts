import { ObjectId } from 'mongodb'

interface ShiftType {
  _id?: ObjectId
  staff_id: ObjectId
  shift_date: Date
  start_time: string
  end_time: string
  total_hours?: number
}

export default class Shift {
  _id?: ObjectId
  staff_id: ObjectId
  shift_date: Date
  start_time: string
  end_time: string
  total_hours?: number

  constructor(shift: ShiftType) {
    this._id = shift._id
    this.staff_id = shift.staff_id
    this.shift_date = shift.shift_date
    this.start_time = shift.start_time
    this.end_time = shift.end_time
    this.total_hours = shift.total_hours
  }
}
