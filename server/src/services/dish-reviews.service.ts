import { ObjectId } from 'mongodb'
import DishReview from '../models/schemas/DishReview.schema'
import databaseService from '~/services/databases.service'
import {
  CreateDishReviewReqBody,
  GetDishReviewsQuery,
  UpdateDishReviewReqBody
} from '~/models/requests/DishReview.request'
import { ErrorWithStatus } from '~/models/Error'
import { DISH_REVIEWS_MESSAGE } from '~/constants/messages'
import HTTP_STATUS from '~/constants/httpStatus'

class DishReviewService {
  async createDishReview(authorId: string, role: string, payload: CreateDishReviewReqBody) {
    const existingReview = await databaseService.dishReviews.findOne({
      author_id: new ObjectId(authorId),
      dish_id: new ObjectId(payload.dish_id)
    })

    if (existingReview) {
      throw new ErrorWithStatus({
        message: DISH_REVIEWS_MESSAGE.DISH_REVIEW_ALREADY_EXISTS,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    const review = new DishReview({
      author_id: new ObjectId(authorId),
      author_type: role,
      dish_id: new ObjectId(payload.dish_id),
      rating: payload.rating,
      comment: payload.comment
    })

    const result = await databaseService.dishReviews.insertOne(review)

    return await databaseService.dishReviews.findOne({ _id: result.insertedId })
  }

  async getDishReviewById(reviewId: string) {
    const result = await databaseService.dishReviews.findOne({ _id: new ObjectId(reviewId) })

    return result
  }

  async getDishReviewsByDish(dishId: string, query: GetDishReviewsQuery) {
    const limit = typeof query.limit === 'number' ? query.limit : 10
    const page = typeof query.page === 'number' ? query.page : 1
    const skip = (page - 1) * limit

    const match: Record<string, unknown> = { dish_id: new ObjectId(dishId) }
    if (query.rating) {
      match.rating = Number(query.rating)
    }

    const pipeline = [
      { $match: match },
      {
        $lookup: {
          from: 'accounts',
          localField: 'author_id',
          foreignField: '_id',
          as: 'user_info'
        }
      },
      {
        $lookup: {
          from: 'guests',
          localField: 'author_id',
          foreignField: '_id',
          as: 'guest_info'
        }
      },
      {
        $addFields: {
          author: {
            $cond: [
              { $eq: ['$author_type', 'Customer'] },
              { $arrayElemAt: ['$user_info', 0] },
              { $arrayElemAt: ['$guest_info', 0] }
            ]
          }
        }
      },
      {
        $project: {
          _id: 1,
          rating: 1,
          comment: 1,
          created_at: 1,
          updated_at: 1,
          'author._id': 1,
          'author.name': 1,
          'author.avatar': 1,
          'author.role': 1
        }
      },
      { $sort: { created_at: -1 } },
      { $skip: skip },
      { $limit: limit }
    ]

    const [reviews, total] = await Promise.all([
      databaseService.dishReviews.aggregate(pipeline).toArray(),
      databaseService.dishReviews.countDocuments(match)
    ])

    return { reviews, total }
  }

  async getDishReviewsByMe(accountId: string) {
    const [reviews, total] = await Promise.all([
      databaseService.dishReviews.find({ author_id: new ObjectId(accountId) }).toArray(),
      databaseService.dishReviews.countDocuments({ author_id: new ObjectId(accountId) })
    ])

    return {
      reviews,
      total
    }
  }

  async updateDishReview(reviewId: string, payload: UpdateDishReviewReqBody) {
    const result = await databaseService.dishReviews.findOneAndUpdate(
      { _id: new ObjectId(reviewId) },
      {
        $set: {
          comment: payload.comment,
          rating: payload.rating
        },
        $currentDate: { updated_at: true }
      },
      { returnDocument: 'after' }
    )

    return result
  }

  async deleteDishReview(reviewId: string) {
    const result = await databaseService.dishReviews.deleteOne({ _id: new ObjectId(reviewId) })
    return result.deletedCount > 0
  }

  async getDishReviewStats(dishId: string) {
    const pipeline = [
      { $match: { dish_id: new ObjectId(dishId) } },
      {
        $group: {
          _id: null,
          average_rating: { $avg: '$rating' },
          total_reviews: { $sum: 1 },
          rating_distribution: {
            $push: '$rating'
          }
        }
      }
    ]

    const result = await databaseService.dishReviews.aggregate(pipeline).toArray()

    if (result.length === 0) {
      return {
        average_rating: 0,
        total_reviews: 0,
        rating_distribution: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 }
      }
    }

    const stats = result[0]
    const ratingDistribution = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 }

    stats.rating_distribution.forEach((rating: number) => {
      ratingDistribution[rating as unknown as keyof typeof ratingDistribution]++
    })

    return {
      average_rating: Math.round(stats.average_rating * 10) / 10,
      total_reviews: stats.total_reviews,
      rating_distribution: ratingDistribution
    }
  }
}

const dishReviewService = new DishReviewService()
export default dishReviewService
