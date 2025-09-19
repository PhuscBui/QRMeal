import HTTP_STATUS from '~/constants/httpStatus'
import { REVENUES_MESSAGE } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Error'
import { CreateRevenueReqBody, GetRevenuesQueryParams } from '~/models/requests/Revenue.request'
import Revenue from '~/models/schemas/Revenue.schema'
import databaseService from '~/services/databases.service'

class RevenuesService {
  async getRevenues(query: GetRevenuesQueryParams) {
    const { fromDate, toDate } = query
    const matchCondition: { created_at?: { $gte?: Date; $lte?: Date } } = {}
    if (fromDate || toDate) {
      matchCondition.created_at = {}
      if (fromDate) {
        matchCondition.created_at.$gte = new Date(fromDate)
      }
      if (toDate) {
        matchCondition.created_at.$lte = new Date(toDate)
      }
    }
    const result = await databaseService.revenues
      .aggregate([
        {
          $match: matchCondition
        }
      ])
      .toArray()

    return result
  }

  async getRevenueByGuestPhone(guest_phone: string) {
    const revenue = await databaseService.revenues.find({ guest_phone: guest_phone }).toArray()
    return revenue
  }

  async getRevenueByCustomerId(customer_id: string) {
    const revenue = await databaseService.revenues.find({ customer_id: customer_id }).toArray()
    return revenue
  }

  async createRevenue(revenue: CreateRevenueReqBody) {
    const result = await databaseService.revenues.insertOne(
      new Revenue({
        guest_id: revenue.guest_id,
        guest_phone: revenue.guest_phone,
        total_amount: revenue.total_amount,
        customer_id: revenue.customer_id
      })
    )
    if (!result.acknowledged) {
      throw new ErrorWithStatus({
        message: REVENUES_MESSAGE.REVENUE_CREATE_FAILED,
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR
      })
    }
    return await databaseService.revenues.findOne({ _id: result.insertedId })
  }
}

const revenuesService = new RevenuesService()
export default revenuesService
