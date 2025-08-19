import { ObjectId } from 'mongodb'

interface AccountType {
  _id?: ObjectId
  name: string
  phone: string
  email: string
  password: string
  avatar?: string
  role: string
  date_of_birth: Date
  owner_id: null | string
  created_at?: Date
  updated_at?: Date
}

export default class Account {
  _id?: ObjectId
  name: string
  phone: string
  email: string
  password: string
  avatar?: string
  role: string
  date_of_birth: Date
  owner_id: null | ObjectId
  created_at?: Date
  updated_at?: Date

  constructor(account: AccountType) {
    const date = new Date()
    this._id = account._id
    this.name = account.name
    this.phone = account.phone
    this.email = account.email
    this.password = account.password
    this.avatar = account.avatar || ''
    this.role = account.role
    this.date_of_birth = account.date_of_birth
    this.owner_id = account.owner_id ? new ObjectId(account.owner_id) : null
    this.created_at = account.created_at || date
    this.updated_at = account.updated_at || date
  }
}
