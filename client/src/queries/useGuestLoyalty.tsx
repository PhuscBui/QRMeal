import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import guestLoyaltyApiRequest from '@/apiRequests/guest-loyalty'
import { UpdateGuestLoyaltyBodyType } from '@/schemaValidations/guest-loyalty.schema'

export const useGetGuestLoyaltyQuery = ({ guestPhone, enabled }: { guestPhone: string; enabled: boolean }) => {
  return useQuery({
    queryKey: ['guest-loyalty', guestPhone],
    queryFn: () => guestLoyaltyApiRequest.getGuestLoyalty(guestPhone),
    enabled
  })
}

export const useUpdateGuestLoyaltyMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ guestPhone, ...body }: UpdateGuestLoyaltyBodyType & { guestPhone: string }) =>
      guestLoyaltyApiRequest.update(body, guestPhone),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['guest-loyalty']
      })
    }
  })
}

export const useGetAllGuestLoyaltyQuery = () => {
  return useQuery({
    queryKey: ['guest-loyalty'],
    queryFn: () => guestLoyaltyApiRequest.getAllGuestLoyalty()
  })
}
