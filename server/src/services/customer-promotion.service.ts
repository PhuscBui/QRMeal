import { ObjectId } from 'mongodb'
import { CreateCustomerPromotionReqBody } from '~/models/requests/CustomerPromotion.request'
import CustomerPromotion from '~/models/schemas/CustomerPromotion.Schema'
import databaseService from '~/services/databases.service'

class CustomerPromotionService {
  async getCustomerPromotionByCustomerId(customerId: string) {
    const result = await databaseService.customer_promotions.find({ customer_id: new ObjectId(customerId) }).toArray()
    return result
  }

  async createCustomerPromotion(customerPromotion: CreateCustomerPromotionReqBody) {
    const result = await databaseService.customer_promotions.insertOne(
      new CustomerPromotion({
        customer_id: new ObjectId(customerPromotion.customer_id),
        promotion_id: new ObjectId(customerPromotion.promotion_id)
      })
    )
    const customerPromotionResult = await databaseService.customer_promotions.findOne({ _id: result.insertedId })
    return customerPromotionResult
  }

  async deleteCustomerPromotion(customer_id: string, promotion_id: string) {
    const result = await databaseService.customer_promotions.findOneAndDelete({
      customer_id: new ObjectId(customer_id),
      promotion_id: new ObjectId(promotion_id)
    })
    return result
  }

  async usedPromotion(customer_id: string, promotion_id: string) {
    const result = await databaseService.customer_promotions.findOneAndUpdate(
      {
        customer_id: new ObjectId(customer_id),
        promotion_id: new ObjectId(promotion_id)
      },
      { $set: { used: true } },
      { returnDocument: 'after' }
    )
    return result
  }
}

const customerPromotionService = new CustomerPromotionService()
export default customerPromotionService
