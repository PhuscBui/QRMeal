import { ObjectId } from 'mongodb'

interface SocketType {
  _id: ObjectId
  socketId: string
  account_id?: ObjectId | null
  account?: ObjectId | null
  guest_id?: ObjectId | null
  guest?: ObjectId | null
}

export default class Socket {
  _id: ObjectId
  socketId: string
  account_id?: ObjectId | null
  account?: ObjectId | null
  guest_id?: ObjectId | null
  guest?: ObjectId | null

  constructor(socket: SocketType) {
    this._id = socket._id
    this.socketId = socket.socketId
    this.account_id = socket.account_id || null
    this.account = socket.account || null
    this.guest_id = socket.guest_id || null
    this.guest = socket.guest || null
  }
}
