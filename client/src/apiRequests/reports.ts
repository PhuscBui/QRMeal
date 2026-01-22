import http from '@/lib/http'
import { DishStatisticsResType, GetReportsQueryType, RevenueStatisticsResType } from '@/schemaValidations/reports.schema'
import queryString from 'query-string'

const reportsApiRequest = {
  getRevenueStatistics: (query?: GetReportsQueryType) =>
    http.get<RevenueStatisticsResType>(
      '/reports/revenue' + (query ? `?${queryString.stringify(query)}` : '')
    ),
  getDishStatistics: (query?: GetReportsQueryType) =>
    http.get<DishStatisticsResType>(
      '/reports/dishes' + (query ? `?${queryString.stringify(query)}` : '')
    )
}

export default reportsApiRequest

