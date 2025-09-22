import customerPromotionApiRequest from '@/apiRequests/customer-promotion'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export const useGetCustomerPromotionQuery = ({ customerId, enabled }: { customerId: string; enabled: boolean }) => {
  return useQuery({
    queryKey: ['customer-promotion', customerId],
    queryFn: () => customerPromotionApiRequest.getCustomerPromotion(customerId),
    enabled
  })
}

export const useCustomerUsedPromotionMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: customerPromotionApiRequest.usedPromotion,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['customer-promotion']
      })
    }
  })
}

export const useAddCustomerPromotionMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: customerPromotionApiRequest.add,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['customer-promotion']
      })
    }
  })
}

export const useDeleteCustomerPromotionMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: customerPromotionApiRequest.deleteCustomerPromotion,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['customer-promotion']
      })
    }
  })
}
