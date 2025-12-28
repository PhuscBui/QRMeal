import reportsApiRequest from '@/apiRequests/reports'
import { GetReportsQueryType } from '@/schemaValidations/reports.schema'
import { useQuery } from '@tanstack/react-query'

export const useRevenueStatisticsQuery = (enabled: boolean, query?: GetReportsQueryType) => {
  return useQuery({
    queryKey: ['reports', 'revenue', query],
    queryFn: () => reportsApiRequest.getRevenueStatistics(query),
    enabled
  })
}

export const useDishStatisticsQuery = (enabled: boolean, query?: GetReportsQueryType) => {
  return useQuery({
    queryKey: ['reports', 'dishes', query],
    queryFn: () => reportsApiRequest.getDishStatistics(query),
    enabled
  })
}

