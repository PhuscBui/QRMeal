import { ObjectId } from 'mongodb'

interface ChatMessageType {
  _id?: ObjectId
  session_id: ObjectId
  sender_type: 'user' | 'staff' | 'bot'
  message: string
  created_at?: Date
}

export default class ChatMessage {
  _id?: ObjectId
  session_id: ObjectId
  sender_type: 'user' | 'staff' | 'bot'
  message: string
  created_at: Date

  constructor(message: ChatMessageType) {
    this._id = message._id
    this.session_id = message.session_id
    this.sender_type = message.sender_type
    this.message = message.message
    this.created_at = message.created_at || new Date()
  }
}
