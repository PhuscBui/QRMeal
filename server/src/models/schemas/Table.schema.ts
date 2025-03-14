import { ObjectId } from 'mongodb'

interface TableType {
  _id?: ObjectId
  number: number
  capacity: number
  status: string
  token: string
  created_at?: Date
  updated_at?: Date
}

export class Table {
  _id?: ObjectId
  number: number
  capacity: number
  status: string
  token: string
  created_at: Date
  updated_at: Date

  constructor(table: TableType) {
    const date = new Date()
    this._id = table._id
    this.number = table.number
    this.capacity = table.capacity
    this.status = table.status
    this.token = table.token
    this.created_at = table.created_at || date
    this.updated_at = table.updated_at || date
  }
}
