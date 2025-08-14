import { ObjectId } from 'mongodb'

interface ChatMessageType {
  _id?: ObjectId
  session_id: ObjectId
  sender_type: 'user' | 'bot' | 'staff'
  message: string
  created_at?: Date
}

export default class ChatMessage {
  _id?: ObjectId
  session_id: ObjectId
  sender_type: 'user' | 'bot' | 'staff'
  message: string
  created_at?: Date

  constructor(chatMessage: ChatMessageType) {
    const date = new Date()
    this._id = chatMessage._id
    this.session_id = chatMessage.session_id
    this.sender_type = chatMessage.sender_type
    this.message = chatMessage.message
    this.created_at = chatMessage.created_at || date
  }
}
