import promotionApiRequest from '@/apiRequests/promotion'
import { GetPromotionsQuery, UpdatePromotionBodyType } from '@/schemaValidations/promotion.schema'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export const usePromotionListQuery = (queryParams?: GetPromotionsQuery) => {
  return useQuery({
    queryFn: () => promotionApiRequest.getPromotionList(queryParams),
    queryKey: ['promotions', queryParams]
  })
}

export const usePromotionDetailQuery = ({ id, enabled }: { id: string; enabled: boolean }) => {
  return useQuery({
    queryFn: () => promotionApiRequest.getPromotionDetail(id),
    queryKey: ['promotions', id],
    enabled
  })
}

export const useCreatePromotionMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: promotionApiRequest.createPromotion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotions'] })
    }
  })
}

export const useUpdatePromotionMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ promotionId, body }: { promotionId: string; body: UpdatePromotionBodyType }) =>
      promotionApiRequest.updatePromotion(promotionId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotions'] })
    }
  })
}

export const useDeletePromotionMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: promotionApiRequest.deletePromotion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotions'] })
    }
  })
}
