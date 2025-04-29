import { ObjectId } from 'mongodb'
import { CreatePromotionReqBody, GetPromotionsQueryParams } from '~/models/requests/Promotion.request'
import Promotion from '~/models/schemas/Promotion.schema'
import databaseService from '~/services/databases.service'

class PromotionsService {
  async createPromotion(promotion: CreatePromotionReqBody) {
    const result = await databaseService.promotions.insertOne(
      new Promotion({
        name: promotion.name,
        description: promotion.description,
        discount_type: promotion.discount_type,
        discount_value: promotion.discount_value,
        min_spend: promotion.min_spend,
        min_visits: promotion.min_visits,
        min_loyalty_points: promotion.min_loyalty_points,
        start_date: promotion.start_date,
        end_date: promotion.end_date,
        is_active: promotion.is_active
      })
    )
    return await databaseService.promotions.findOne({ _id: result.insertedId })
  }

  async getPromotions(query: GetPromotionsQueryParams) {
    const active = query.active === 'true' ? true : query.active === 'false' ? false : undefined
    const filter = query.active ? { is_active: active } : {}
    const promotions = await databaseService.promotions.find(filter).toArray()
    return promotions
  }

  async getPromotionById(id: string) {
    const promotion = await databaseService.promotions.findOne({ _id: new ObjectId(id) })
    return promotion
  }

  async updatePromotion(id: string, promotion: CreatePromotionReqBody) {
    const result = await databaseService.promotions.findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          name: promotion.name,
          description: promotion.description,
          discount_type: promotion.discount_type,
          discount_value: promotion.discount_value,
          min_spend: promotion.min_spend,
          min_visits: promotion.min_visits,
          min_loyalty_points: promotion.min_loyalty_points,
          start_date: promotion.start_date,
          end_date: promotion.end_date,
          is_active: promotion.is_active
        },
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
