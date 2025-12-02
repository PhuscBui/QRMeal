import http from '@/lib/http'
import {
  CreateDishBodyType,
  DishListResType,
  DishRecommendationsResType,
  DishResType,
  ImageSearchBodyType,
  ImageSearchResType,
  UpdateDishBodyType
} from '@/schemaValidations/dish.schema'

const dishApiRequest = {
  list: () => http.get<DishListResType>('dishes', { next: { tags: ['dishes'] } }),
  add: (body: CreateDishBodyType) => http.post<DishResType>('dishes', body),
  getDish: (id: string) => http.get<DishResType>(`dishes/${id}`),
  updateDish: (id: string, body: UpdateDishBodyType) => http.put<DishResType>(`dishes/${id}`, body),
  deleteDish: (id: string) => http.delete<DishResType>(`dishes/${id}`),
  searchByImage: (body: ImageSearchBodyType) => http.post<ImageSearchResType>('dishes/image-search', body),
  recommendationsForMe: () => http.get<DishRecommendationsResType>('dishes/recommendations/me')
}

export default dishApiRequest
