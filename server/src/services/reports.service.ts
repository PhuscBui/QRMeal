/* eslint-disable @typescript-eslint/no-explicit-any */
import { ObjectId } from 'mongodb'
import databaseService from '~/services/databases.service'

interface GetReportsQueryParams {
  fromDate?: string
  toDate?: string
  period?: 'day' | 'week' | 'month'
}

class ReportsService {
  private createDateMatchCondition(fromDate?: string, toDate?: string) {
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
    return matchCondition
  }

  async getRevenueStatistics(query: GetReportsQueryParams) {
    const matchCondition = this.createDateMatchCondition(query.fromDate, query.toDate)
    const period = query.period || 'day'

    let dateFormat = '%Y-%m-%d'
    if (period === 'week') {
      dateFormat = '%Y-W%V' // Year-Week
    } else if (period === 'month') {
      dateFormat = '%Y-%m' // Year-Month
    }

    const revenueStats = await databaseService.revenues
      .aggregate([
        { $match: matchCondition },
        {
          $group: {
            _id: {
              $dateToString: { format: dateFormat, date: '$created_at' }
            },
            totalRevenue: { $sum: '$total_amount' },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } },
        {
          $project: {
            _id: 0,
            period: '$_id',
            totalRevenue: 1,
            count: 1
          }
        }
      ])
      .toArray()

    return revenueStats
  }

  async getDishStatistics(query: GetReportsQueryParams) {
    const matchCondition = this.createDateMatchCondition(query.fromDate, query.toDate)

    // Get dish sales statistics
    const dishStats = await databaseService.orders
      .aggregate([
        { $match: matchCondition },
        {
          $lookup: {
            from: 'dish_snapshots',
            localField: 'dish_snapshot_id',
            foreignField: '_id',
            as: 'dish_snapshot'
          }
        },
        { $unwind: '$dish_snapshot' },
        {
          $lookup: {
            from: 'dishes',
            localField: 'dish_snapshot.dish_id',
            foreignField: '_id',
            as: 'dish'
          }
        },
        {
          $group: {
            _id: '$dish_snapshot.dish_id',
            dishName: { $first: { $arrayElemAt: ['$dish.name', 0] } },
            dishImage: { $first: { $arrayElemAt: ['$dish.image', 0] } },
            totalQuantity: { $sum: '$quantity' },
            totalRevenue: { $sum: { $multiply: ['$quantity', '$dish_snapshot.price'] } },
            orderCount: { $sum: 1 }
          }
        },
        {
          $project: {
            dishId: { $toString: '$_id' },
            dishName: 1,
            dishImage: 1,
            totalQuantity: 1,
            totalRevenue: 1,
            orderCount: 1
          }
        },
        { $sort: { totalQuantity: -1 } }
      ])
      .toArray()

    // Get best sellers (top 10)
    const bestSellers = dishStats.slice(0, 10)

    // Get least ordered (bottom 10, but only dishes that have been ordered)
    const leastOrdered = dishStats.slice(-10).reverse()

    // Get all dishes to find ones that haven't been ordered
    const allDishes = await databaseService.dishes
      .aggregate([
        {
          $project: {
            dishId: { $toString: '$_id' },
            dishName: '$name',
            dishImage: '$image',
            totalQuantity: { $literal: 0 },
            totalRevenue: { $literal: 0 },
            orderCount: { $literal: 0 }
          }
        }
      ])
      .toArray()

    const orderedDishIds = new Set(dishStats.map((d: any) => d.dishId))
    const neverOrdered = allDishes.filter((d: any) => !orderedDishIds.has(d.dishId))

    return {
      bestSellers,
      leastOrdered,
      neverOrdered: neverOrdered.slice(0, 10),
      totalDishes: allDishes.length,
      orderedDishes: dishStats.length
    }
  }
}

const reportsService = new ReportsService()
export default reportsService

