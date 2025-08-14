import { ObjectId } from 'mongodb'

interface ChatSessionType {
  _id?: ObjectId
  guest_id?: ObjectId
  start_time: Date
  end_time?: Date
}

export default class ChatSession {
  _id?: ObjectId
  guest_id?: ObjectId
  start_time: Date
  end_time?: Date

  constructor(chatSession: ChatSessionType) {
    this._id = chatSession._id
    this.guest_id = chatSession.guest_id
    this.start_time = chatSession.start_time
    this.end_time = chatSession.end_time
  }
}
