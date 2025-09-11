import { ObjectId } from 'mongodb'
import { UpdateLoyaltyReqBody } from '~/models/requests/GuestLoyalty.request'
import databaseService from '~/services/databases.service'

class LoyaltyService {
  async getAllLoyalties() {
    const result = await databaseService.loyalties.find().toArray()
    return result
  }

  async getLoyaltyByCustomerId(customerId: string) {
    const result = await databaseService.loyalties.findOne({ customer_id: new ObjectId(customerId) })
    return result
  }

  async updateLoyalty(customerId: string, loyaltyData: UpdateLoyaltyReqBody) {
    const result = await databaseService.loyalties.findOneAndUpdate(
      { customer_id: new ObjectId(customerId) },
      {
        $set: {
          total_spend: loyaltyData.total_spend,
          visit_count: loyaltyData.visit_count,
          loyalty_points: loyaltyData.loyalty_points
        },
        $currentDate: {
          updated_at: true
        }
      },
      { returnDocument: 'after' }
    )

    return result
  }

  async deleteLoyalty(customerId: string) {
    const result = await databaseService.loyalties.deleteOne({ customer_id: new ObjectId(customerId) })
    return result
  }
}

const loyaltyService = new LoyaltyService()
export default loyaltyService
