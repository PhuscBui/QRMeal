import { ObjectId } from 'mongodb'

interface ShiftType {
  _id?: ObjectId
  staff_id: ObjectId
  shift_date: Date
  start_time: string
  end_time: string
  reason?: string
  total_hours?: number
  status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled'
  reviewed_by?: ObjectId
  reviewed_at?: Date
  review_note?: string
  cancelled_by?: ObjectId
  cancelled_at?: Date
  created_at?: Date
  updated_at?: Date
}

export default class Shift {
  _id?: ObjectId
  staff_id: ObjectId
  shift_date: Date
  start_time: string
  end_time: string
  total_hours?: number
  reason?: string
  status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled'
  reviewed_by?: ObjectId
  reviewed_at?: Date
  review_note?: string
  cancelled_by?: ObjectId
  cancelled_at?: Date
  created_at?: Date
  updated_at?: Date

  constructor(shift: ShiftType) {
    const now = new Date()
    this._id = shift._id
    this.staff_id = shift.staff_id
    this.shift_date = shift.shift_date
    this.start_time = shift.start_time
    this.end_time = shift.end_time
    this.reason = shift.reason
    this.status = shift.status
    this.total_hours = shift.total_hours
    this.reviewed_by = shift.reviewed_by
    this.reviewed_at = shift.reviewed_at
    this.review_note = shift.review_note
    this.cancelled_by = shift.cancelled_by
    this.cancelled_at = shift.cancelled_at
    this.created_at = shift.created_at || now
    this.updated_at = shift.updated_at || now
  }
}
