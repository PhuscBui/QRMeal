import { ObjectId } from 'mongodb'

interface AttendanceType {
  _id?: ObjectId
  staff_id: ObjectId
  shift_id?: ObjectId
  check_in?: Date
  check_out?: Date
  status: 'present' | 'absent' | 'late' | 'on_time'
  notes?: string
  created_at?: Date
  updated_at?: Date
}

export default class Attendance {
  _id?: ObjectId
  staff_id: ObjectId
  shift_id?: ObjectId
  check_in?: Date
  check_out?: Date
  status: 'present' | 'absent' | 'late' | 'on_time'
  notes?: string
  created_at?: Date
  updated_at?: Date

  constructor(attendance: AttendanceType) {
    const now = new Date()
    this._id = attendance._id
    this.staff_id = attendance.staff_id
    this.shift_id = attendance.shift_id
    this.check_in = attendance.check_in
    this.check_out = attendance.check_out
    this.status = attendance.status
    this.notes = attendance.notes
    this.created_at = attendance.created_at || now
    this.updated_at = attendance.updated_at || now
  }
}
