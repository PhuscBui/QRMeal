import { ObjectId } from 'mongodb'

interface GuestType {
  _id?: ObjectId
  name: string
  phone: string
  table_number: number
  role: string
  refresh_token?: string | null
  refresh_token_exp?: Date | null
  created_at?: Date
  updated_at?: Date
}

export default class Guest {
  _id?: ObjectId
  name: string
  phone: string
  table_number: number
  role: string
  refresh_token?: string | null
  refresh_token_exp?: Date | null
  created_at?: Date
  updated_at?: Date

  constructor(guest: GuestType) {
    const date = new Date()
    this._id = guest._id
    this.name = guest.name
    this.phone = guest.phone
    this.table_number = guest.table_number
    this.role = guest.role
    this.refresh_token = guest.refresh_token || null
    this.refresh_token_exp = guest.refresh_token_exp || null
    this.created_at = guest.created_at || date
    this.updated_at = guest.updated_at || date
  }
}
