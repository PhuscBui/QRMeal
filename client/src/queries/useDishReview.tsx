import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import dishReviewApiRequest from '@/apiRequests/dish-review'
import { GetDishReviewsQueryType, UpdateDishReviewReqBodyType } from '@/schemaValidations/dish-review.schema'

export const useDishReviewListQuery = (dishId: string, enabled: boolean, query?: GetDishReviewsQueryType) => {
  return useQuery({
    queryKey: ['dishReviews', dishId, query],
    queryFn: () => dishReviewApiRequest.getByDish(dishId, query),
    enabled: enabled
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
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['dishReviews']
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

export const useGetDishReviewsByMeQuery = (enabled: boolean) => {
  return useQuery({
    queryKey: ['dishReviews', 'me'],
    queryFn: () => dishReviewApiRequest.getByMe(),
    enabled
  })
}
