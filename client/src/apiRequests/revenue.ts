import http from '@/lib/http'
import {
  CreateRevenueBodyType,
  GetRevenuesQueryParamsType,
  RevenueListResType,
  RevenueResType
} from '@/schemaValidations/revenue.schema'
import queryString from 'query-string'

const revenueApiRequest = {
  getRevenueList: (queryParams?: GetRevenuesQueryParamsType) =>
    http.get<RevenueListResType>(
      '/revenues?' +
        queryString.stringify({
          fromDate: queryParams?.fromDate?.toISOString(),
          toDate: queryParams?.toDate?.toISOString()
        })
    ),
  getRevenueByGuestPhone: (guestPhone: string) => http.get<RevenueListResType>(`/revenues/${guestPhone}`),
  createRevenue: (body: CreateRevenueBodyType) => http.post<RevenueResType>('/revenues', body)
}

export default revenueApiRequest
