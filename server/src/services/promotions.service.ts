import { ObjectId } from 'mongodb'
import {
  CreatePromotionReqBody,
  GetPromotionsQueryParams,
  UpdatePromotionReqBody
} from '~/models/requests/Promotion.request'
import Promotion from '~/models/schemas/Promotion.schema'
import databaseService from '~/services/databases.service'

class PromotionsService {
  async createPromotion(promotion: CreatePromotionReqBody) {
    const promotionData = {
      ...promotion,
      conditions: promotion.conditions
        ? {
            ...promotion.conditions,
            applicable_items: promotion.conditions.applicable_items?.map((id) => new ObjectId(id))
          }
        : undefined
    }
    const result = await databaseService.promotions.insertOne(new Promotion(promotionData))
    return await databaseService.promotions.findOne({ _id: result.insertedId })
  }

  async getPromotions(query: GetPromotionsQueryParams) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: any = {}

    if (query.active === 'true') filter.is_active = true
    if (query.active === 'false') filter.is_active = false
    if (query.category) filter.category = query.category
    if (query.applicable_to) filter.applicable_to = query.applicable_to

    return await databaseService.promotions.find(filter).toArray()
  }

  async getPromotionById(id: string) {
    const promotion = await databaseService.promotions.findOne({ _id: new ObjectId(id) })
    return promotion
  }

  async updatePromotion(id: string, promotion: UpdatePromotionReqBody) {
    const promotionData = {
      ...promotion,
      conditions: promotion.conditions
        ? {
            ...promotion.conditions,
            applicable_items: promotion.conditions.applicable_items?.map((id) => new ObjectId(id))
          }
        : undefined
    }
    const result = await databaseService.promotions.findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: promotionData,
        $currentDate: { updated_at: true }
      },
      { returnDocument: 'after' }
    )
    return result
  }

  async deletePromotion(id: string) {
    const result = await databaseService.promotions.deleteOne({ _id: new ObjectId(id) })
    return result
  }
}

const promotionsService = new PromotionsService()
export default promotionsService
