import { ObjectId } from 'mongodb'
import { UpdateGuestLoyaltyReqBody } from '~/models/requests/GuestLoyalty.request'
import databaseService from '~/services/databases.service'

class GuestLoyaltyService {
  async getAllGuestLoyalty() {
    const result = await databaseService.guest_loyalties.find().toArray()
    return result
  }

  async getGuestLoyaltyByPhone(guestPhone: string) {
    const result = await databaseService.guest_loyalties.findOne({ guest_phone: guestPhone })
    return result
  }

  async updateGuestLoyalty(guestPhone: string, guestLoyalty: UpdateGuestLoyaltyReqBody) {
    const result = await databaseService.guest_loyalties.findOneAndUpdate(
      { guest_phone: guestPhone },
      {
        $set: {
          total_spend: guestLoyalty.total_spend,
          visit_count: guestLoyalty.visit_count,
          loyalty_points: guestLoyalty.loyalty_points
        },
        $currentDate: {
          updated_at: true
        }
      },
      { returnDocument: 'after' }
    )

    return result
  }

  async deleteGuestLoyalty(guestPhone: string) {
    const result = await databaseService.guest_loyalties.deleteOne({ guest_phone: guestPhone })
    return result
  }
}

const guestLoyaltyService = new GuestLoyaltyService()
export default guestLoyaltyService
