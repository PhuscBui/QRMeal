// server/src/services/recommendations.service.ts
import { ObjectId } from 'mongodb'
import { DishStatus } from '~/constants/type'
import databaseService from '~/services/databases.service'

class RecommendationsService {
  async getRecommendationsForCustomer(customerId: string, limit = 10) {
    const customerObjectId = new ObjectId(customerId)

    const recommendations = await databaseService.orders
      .aggregate([
        // Join sang order_groups để biết đơn này thuộc customer nào
        {
          $lookup: {
            from: 'order_groups',
            localField: 'order_group_id',
            foreignField: '_id',
            as: 'order_group'
          }
        },
        { $unwind: '$order_group' },
        { $match: { 'order_group.customer_id': customerObjectId } },

        // Join dish_snapshots để biết món gốc (dish_id)
        {
          $lookup: {
            from: 'dish_snapshots',
            localField: 'dish_snapshot_id',
            foreignField: '_id',
            as: 'dish_snapshot'
          }
        },
        { $unwind: '$dish_snapshot' },

        // Gom nhóm theo dish_id, tính số lần/quantity
        {
          $group: {
            _id: '$dish_snapshot.dish_id',
            total_quantity: { $sum: '$quantity' },
            last_order_at: { $max: '$created_at' }
          }
        },

        // Lấy thông tin món hiện tại
        {
          $lookup: {
            from: 'dishes',
            localField: '_id',
            foreignField: '_id',
            as: 'dish'
          }
        },
        { $unwind: '$dish' },
        {
          $lookup: {
            from: 'dish_reviews',
            localField: '_id',
            foreignField: 'dish_id',
            as: 'reviews'
          }
        },
        {
          $addFields: {
            avg_rating: { $avg: '$reviews.rating' }
          }
        },
        // Chỉ gợi ý món đang còn bán
        {
          $match: {
            'dish.status': DishStatus.Available
          }
        },

        // Sắp xếp: ăn nhiều nhất + gần đây nhất
        {
          $sort: {
            total_quantity: -1,
            last_order_at: -1
          }
        },
        { $limit: limit },

        {
          $project: {
            _id: 0,
            dish: '$dish',
            total_quantity: 1,
            last_order_at: 1
          }
        }
      ])
      .toArray()

    return recommendations
  }
}

const recommendationsService = new RecommendationsService()
export default recommendationsService
