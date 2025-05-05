import revenueApiRequest from '@/apiRequests/revenue'
import { GetRevenuesQueryParamsType } from '@/schemaValidations/revenue.schema'
import { useMutation, useQuery } from '@tanstack/react-query'

export const useRevenueListQuery = (queryParams?: GetRevenuesQueryParamsType) => {
  return useQuery({
    queryFn: () => revenueApiRequest.getRevenueList(queryParams),
    queryKey: ['revenues', queryParams]
  })
}

export const useGetRevenueByGuestPhoneQuery = (guestPhone: string) => {
  return useQuery({
    queryFn: () => revenueApiRequest.getRevenueByGuestPhone(guestPhone),
    queryKey: ['revenue', guestPhone]
  })
}

export const useCreateRevenueMutation = () => {
  return useMutation({
    mutationFn: revenueApiRequest.createRevenue
  })
}
