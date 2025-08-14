import { ObjectId } from 'mongodb'

interface TranslationType {
  _id?: ObjectId
  entity_type: 'dish' | 'promotion' | 'category' | 'staff' | 'table'
  entity_id: ObjectId
  language_code: string
  field: 'name' | 'description' | 'title' | 'content'
  translated_text: string
}

export default class Translation {
  _id?: ObjectId
  entity_type: 'dish' | 'promotion' | 'category' | 'staff' | 'table'
  entity_id: ObjectId
  language_code: string
  field: 'name' | 'description' | 'title' | 'content'
  translated_text: string

  constructor(translation: TranslationType) {
    this._id = translation._id
    this.entity_type = translation.entity_type
    this.entity_id = translation.entity_id
    this.language_code = translation.language_code
    this.field = translation.field
    this.translated_text = translation.translated_text
  }
}
