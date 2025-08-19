/* eslint-disable @typescript-eslint/no-explicit-any */
import { GetDashboardQueryParams } from '~/models/requests/Dashboard.request'
import databaseService from '~/services/databases.service'

class DashboardService {
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

  private async getTotalRevenue(matchCondition: any) {
    const result = await databaseService.revenues
      .aggregate([{ $match: matchCondition }, { $group: { _id: null, total: { $sum: '$total_amount' } } }])
      .toArray()
    return result[0]?.total || 0
  }

  private async getTotalOrders(matchCondition: any) {
    const result = await databaseService.orders
      .aggregate([{ $match: matchCondition }, { $group: { _id: null, count: { $sum: 1 } } }])
      .toArray()
    return result[0]?.count || 0
  }

  private async getNewCustomers(matchCondition: any) {
    const result = await databaseService.guests
      .aggregate([{ $match: matchCondition }, { $group: { _id: null, count: { $sum: 1 } } }])
      .toArray()
    return result[0]?.count || 0
  }

  private async getTimeStats(matchCondition: any) {
    const [orders, revenues, visitors] = await Promise.all([
      // Get orders by date
      databaseService.orders
        .aggregate([
          { $match: matchCondition },
          {
            $group: {
              _id: {
                $dateToString: { format: '%Y-%m-%d', date: '$created_at' }
              },
              orders: { $sum: 1 }
            }
          },
          { $sort: { _id: 1 } },
          {
            $project: {
              _id: 0,
              date: '$_id',
              orders: 1
            }
          }
        ])
        .toArray(),

      // Get revenues by date
      databaseService.revenues
        .aggregate([
          { $match: matchCondition },
          {
            $group: {
              _id: {
                $dateToString: { format: '%Y-%m-%d', date: '$created_at' }
              },
              revenue: { $sum: '$total_amount' }
            }
          },
          { $sort: { _id: 1 } },
          {
            $project: {
              _id: 0,
              date: '$_id',
              revenue: 1
            }
          }
        ])
        .toArray(),

      // Get visitors by date
      databaseService.guests
        .aggregate([
          { $match: matchCondition },
          {
            $group: {
              _id: {
                $dateToString: { format: '%Y-%m-%d', date: '$created_at' }
              },
              visitors: { $sum: 1 }
            }
          },
          { $sort: { _id: 1 } },
          {
            $project: {
              _id: 0,
              date: '$_id',
              visitors: 1
            }
          }
        ])
        .toArray()
    ])

    // Merge the stats by date
    const dateMap = new Map()

    ;[orders, revenues, visitors].forEach((statArray) => {
      statArray.forEach((stat) => {
        if (!dateMap.has(stat.date)) {
          dateMap.set(stat.date, { date: stat.date, orders: 0, revenue: 0, visitors: 0 })
        }
        const entry = dateMap.get(stat.date)
        if ('orders' in stat) entry.orders = stat.orders
        if ('revenue' in stat) entry.revenue = stat.revenue
        if ('visitors' in stat) entry.visitors = stat.visitors
      })
    })

    return Array.from(dateMap.values()).sort((a, b) => a.date.localeCompare(b.date))
  }

  private async getQrCodes() {
    return databaseService.tables
      .aggregate([
        {
          $project: {
            id: { $toString: '$_id' },
            name: { $concat: ['Table ', { $toString: '$number' }] },
            created_at: { $dateToString: { format: '%Y-%m-%dT%H:%M:%S.%LZ', date: '$created_at' } }
          }
        }
      ])
      .toArray()
  }

  async getIndicators(query: GetDashboardQueryParams) {
    const matchCondition = this.createDateMatchCondition(query.fromDate, query.toDate)

    const [totalRevenue, totalOrders, newCustomers, activeAccounts, timeStats, qrCodes] = await Promise.all([
      this.getTotalRevenue(matchCondition),
      this.getTotalOrders(matchCondition),
      this.getNewCustomers(matchCondition),
      databaseService.accounts.countDocuments({ role: 'Employee' }),
      this.getTimeStats(matchCondition),
      this.getQrCodes()
    ])

    return {
      totalRevenue,
      totalOrders,
      newCustomers,
      activeAccounts,
      timeStats,
      qrCodes,
      meta: {
        lastUpdated: new Date().toISOString()
      }
    }
  }
}

const dashboardService = new DashboardService()
export default dashboardService
