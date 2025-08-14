import { ObjectId } from 'mongodb'

interface StaffType {
  _id?: ObjectId
  account_id: ObjectId
  position: 'manager' | 'waiter' | 'chef' | 'cashier' | 'delivery'
  salary_per_hour?: number
  created_at?: Date
  updated_at?: Date
}

export default class Staff {
  _id?: ObjectId
  account_id: ObjectId
  position: 'manager' | 'waiter' | 'chef' | 'cashier' | 'delivery'
  salary_per_hour?: number
  created_at?: Date
  updated_at?: Date

  constructor(staff: StaffType) {
    const date = new Date()
    this._id = staff._id
    this.account_id = staff.account_id
    this.position = staff.position
    this.salary_per_hour = staff.salary_per_hour
    this.created_at = staff.created_at || date
    this.updated_at = staff.updated_at || date
  }
}
