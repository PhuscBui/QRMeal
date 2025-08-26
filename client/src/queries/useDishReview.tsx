import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import dishReviewApiRequest from '@/apiRequests/dish-review'
import { UpdateDishReviewReqBodyType } from '@/schemaValidations/dish-review.schema'

export const useDishReviewListQuery = (dishId: string) => {
  return useQuery({
    queryKey: ['dishReviews', dishId],
    queryFn: () => dishReviewApiRequest.getByDish(dishId),
    enabled: !!dishId
  })
}

export const useAddDishReviewMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: dishReviewApiRequest.create,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['dishReviews', variables.dish_id]
      })
    }
  })
}

export const useDeleteDishReviewMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: dishReviewApiRequest.delete,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['dishReviews', variables]
      })
    }
  })
}

export const useUpdateDishReviewMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...body }: UpdateDishReviewReqBodyType & { id: string }) =>
      dishReviewApiRequest.update(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['dishReviews'],
        exact: true
      })
    }
  })
}

export const useGetDishReviewQuery = ({ id, enabled }: { id: string; enabled: boolean }) => {
  return useQuery({
    queryKey: ['dishReviews', id],
    queryFn: () => dishReviewApiRequest.getById(id),
    enabled
  })
}

export const useGetDishReviewStatsQuery = (dishId: string) => {
  return useQuery({
    queryKey: ['dishReviews', dishId, 'stats'],
    queryFn: () => dishReviewApiRequest.getStats(dishId),
    enabled: !!dishId
  })
}

export const useGetDishReviewsByGuestQuery = (enabled: boolean) => {
  return useQuery({
    queryKey: ['dishReviews', 'guest'],
    queryFn: () => dishReviewApiRequest.getByGuest(),
    enabled
  })
}
