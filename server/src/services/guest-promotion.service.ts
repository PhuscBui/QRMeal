import { ObjectId } from 'mongodb'
import { CreateGuestPromotionReqBody } from '~/models/requests/GuestPromotion.request'
import GuestPromotion from '~/models/schemas/GuestPromotion.schema'
import databaseService from '~/services/databases.service'

class GuestPromotionService {
  async getGuestPromotionByGuestId(guestId: string) {
    const result = await databaseService.guest_promotions.find({ guest_id: new ObjectId(guestId) }).toArray()
    return result
  }

  async createGuestPromotion(guestPromotion: CreateGuestPromotionReqBody) {
    const result = await databaseService.guest_promotions.insertOne(
      new GuestPromotion({
        guest_id: new ObjectId(guestPromotion.guest_id),
        guest_phone: guestPromotion.guest_phone,
        promotion_id: new ObjectId(guestPromotion.promotion_id)
      })
    )
    const guestPromotionResult = await databaseService.guest_promotions.findOne({ _id: result.insertedId })
    return guestPromotionResult
  }

  async deleteGuestPromotion(guest_id: string, promotion_id: string) {
    const result = await databaseService.guest_promotions.findOneAndDelete({
      guest_id: new ObjectId(guest_id),
      promotion_id: new ObjectId(promotion_id)
    })
    return result
  }
}

const guestPromotionService = new GuestPromotionService()
export default guestPromotionService
