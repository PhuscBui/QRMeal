import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import loyaltyApiRequest from '@/apiRequests/loyalty'
import { UpdateLoyaltyBodyType } from '@/schemaValidations/loyalty.schema'

export const useGetLoyaltyQuery = ({ customerId, enabled }: { customerId?: string; enabled: boolean }) => {
  return useQuery({
    queryKey: ['loyalty', customerId],
    queryFn: () => loyaltyApiRequest.getLoyalty(customerId),
    enabled
  })
}

export const useUpdateLoyaltyMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ customerId, ...body }: UpdateLoyaltyBodyType & { customerId: string }) =>
      loyaltyApiRequest.update(body, customerId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['loyalty']
      })
    }
  })
}

export const useGetAllLoyaltyQuery = () => {
  return useQuery({
    queryKey: ['loyalty'],
    queryFn: () => loyaltyApiRequest.getAllGuestLoyalty()
  })
}
