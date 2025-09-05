import { AuthorTypeValues } from '@/constants/type'
import z from 'zod'

export const DishReviewSchema = z.object({
  _id: z.any().optional(),
  dish_id: z.any(),
  author_id: z.any(),
  author_type: z.enum(AuthorTypeValues),
  rating: z.number(),
  comment: z.string().optional(),
  created_at: z.date().optional(),
  updated_at: z.date().optional()
})

export const DishReviewRes = z.object({
  message: z.string(),
  result: DishReviewSchema
})

export type DishReviewResType = z.TypeOf<typeof DishReviewRes>

export const DishReviewByDishListRes = z.object({
  message: z.string(),
  result: z.object({
    reviews: z.array(
      z.object({
        _id: z.string(),
        rating: z.number(),
        comment: z.string().optional(),
        created_at: z.string().optional(),
        updated_at: z.string().optional(),
        author: z.object({
          _id: z.string(),
          name: z.string(),
          role: z.string(),
          avatar: z.string().optional()
        })
      })
    ),
    total: z.number()
  })
})

export type DishReviewByDishListResType = z.TypeOf<typeof DishReviewByDishListRes>

export const CreateDishReviewBody = z.object({
  dish_id: z.string(),
  rating: z.number(),
  comment: z.string().optional()
})

export type CreateDishReviewBodyType = z.TypeOf<typeof CreateDishReviewBody>

export const UpdateDishReviewReqBodySchema = z.object({
  rating: z.number().optional(),
  comment: z.string().optional()
})

export type UpdateDishReviewReqBodyType = z.TypeOf<typeof UpdateDishReviewReqBodySchema>

export const DeleteDishReviewRes = z.object({
  message: z.string()
})

export type DeleteDishReviewResType = z.TypeOf<typeof DeleteDishReviewRes>

export const DishReviewStatsRes = z.object({
  message: z.string(),
  result: z.object({
    average_rating: z.number(),
    total_reviews: z.number(),
    rating_distribution: z.record(z.string(), z.number())
  })
})

export type DishReviewStatsResType = z.TypeOf<typeof DishReviewStatsRes>

export const DishReviewByMeListRes = z.object({
  message: z.string(),
  result: z.object({
    reviews: z.array(
      z.object({
        _id: z.string(),
        author_id: z.string(),
        author_type: z.enum(AuthorTypeValues),
        dish_id: z.string(),
        rating: z.number(),
        comment: z.string().optional(),
        created_at: z.string().optional(),
        updated_at: z.string().optional()
      })
    ),
    total: z.number()
  })
})

export type DishReviewByMeListResType = z.TypeOf<typeof DishReviewByMeListRes>

export const GetDishReviewsQuery = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  rating: z.string().optional(),
  sortBy: z.enum(['rating', 'created_at']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional()
})

export type GetDishReviewsQueryType = z.TypeOf<typeof GetDishReviewsQuery>
