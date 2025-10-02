import { ObjectId } from 'mongodb'

interface ChatSessionType {
  _id?: ObjectId
  start_time: Date
  end_time?: Date
  guest_id?: ObjectId
  customer_id?: ObjectId
  anonymous_id?: string // For unauthenticated users
}

export default class ChatSession {
  _id?: ObjectId
  start_time: Date
  end_time?: Date
  guest_id?: ObjectId
  customer_id?: ObjectId
  anonymous_id?: string

  constructor(session: ChatSessionType) {
    this._id = session._id
    this.start_time = session.start_time
    this.end_time = session.end_time
    this.guest_id = session.guest_id
    this.customer_id = session.customer_id
    this.anonymous_id = session.anonymous_id
  }
}
