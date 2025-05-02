import guestPromotionApiRequest from '@/apiRequests/guest-promotion'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export const useGetGuestPromotionQuery = ({ guestId, enabled }: { guestId: string; enabled: boolean }) => {
  return useQuery({
    queryKey: ['guest-promotion', guestId],
    queryFn: () => guestPromotionApiRequest.getGuestPromotion(guestId),
    enabled
  })
}

export const useAddGuestPromotionMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: guestPromotionApiRequest.add,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['guest-promotion']
      })
    }
  })
}

export const useDeleteGuestPromotionMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: guestPromotionApiRequest.deleteGuestPromotion,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['guest-promotion']
      })
    }
  })
}
