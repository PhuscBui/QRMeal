import http from '@/lib/http'
import {
  CreateDishReviewBodyType,
  DeleteDishReviewResType,
  DishReviewByDishListResType,
  DishReviewByMeListResType,
  DishReviewResType,
  DishReviewStatsResType,
  UpdateDishReviewReqBodyType
} from '@/schemaValidations/dish-review.schema'

const dishReviewApiRequest = {
  create: (data: CreateDishReviewBodyType) => http.post<DishReviewResType>('/dish-reviews', data),
  getById: (id: string) => http.get<DishReviewResType>(`/dish-reviews/${id}`),
  getByDish: (dishId: string) => http.get<DishReviewByDishListResType>(`/dish-reviews/dish/${dishId}`),
  update: (id: string, data: UpdateDishReviewReqBodyType) => http.put<DishReviewResType>(`/dish-reviews/${id}`, data),
  delete: (id: string) => http.delete<DeleteDishReviewResType>(`/dish-reviews/${id}`),
  getStats: (dishId: string) => http.get<DishReviewStatsResType>(`/dish-reviews/${dishId}/stats`),
  getByMe: () => http.get<DishReviewByMeListResType>(`/dish-reviews/reviews/me`)
}

export default dishReviewApiRequest
