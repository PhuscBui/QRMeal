import { DishStatusValues } from '@/constants/type'
import z from 'zod'

export const CreateDishBody = z.object({
  name: z.string().min(1).max(256),
  price: z.coerce.number().positive(),
  description: z.string().max(10000),
  category_id: z.string().min(1).max(256),
  image: z.string().url().optional(),
  status: z.enum(DishStatusValues).optional()
})

export type CreateDishBodyType = z.TypeOf<typeof CreateDishBody>

export const DishSchema = z.object({
  _id: z.string(),
  name: z.string(),
  price: z.coerce.number(),
  description: z.string(),
  category_id: z.string().min(1).max(256),
  category_name: z.string().optional(),
  avg_rating: z.number().nullable().optional(),
  image: z.string().nullable(),
  status: z.enum(DishStatusValues),
  created_at: z.date(),
  updated_at: z.date()
})

export const DishRes = z.object({
  message: z.string(),
  result: DishSchema
})

export type DishResType = z.TypeOf<typeof DishRes>

export const DishListRes = z.object({
  message: z.string(),
  result: z.array(DishSchema)
})

export type DishListResType = z.TypeOf<typeof DishListRes>

export const UpdateDishBody = CreateDishBody
export type UpdateDishBodyType = CreateDishBodyType
export const DishParams = z.object({
  id: z.string()
})
export type DishParamsType = z.TypeOf<typeof DishParams>

export const ImageSearchBodySchema = z
  .object({
    image_url: z.string().url().optional(),
    image_base64: z.string().optional(),
    maxResults: z.number().min(1).max(20).optional().default(5)
  })
  .refine((data) => data.image_url || data.image_base64, { message: 'Either image_url or image_base64 is required' })

export type ImageSearchBodyType = z.TypeOf<typeof ImageSearchBodySchema>

export const ImageSearchResSchema = z.object({
  message: z.string(),
  result: z.object({
    dishes: z.array(DishSchema),
    labels: z.array(
      z.object({
        description: z.string().optional(),
        score: z.number().optional()
      })
    ),
    searchStrategy: z.string().optional(),
    keywords: z.array(z.string()).optional(),
    expandedKeywords: z.array(z.string()).optional()
  })
})

export type ImageSearchResType = z.TypeOf<typeof ImageSearchResSchema>

export const DishRecommendationItemSchema = z.object({
  dish: DishSchema,
  total_quantity: z.number(),
  last_order_at: z.string()
})

export const DishRecommendationsResSchema = z.object({
  message: z.string(),
  result: z.array(DishRecommendationItemSchema)
})

export type DishRecommendationItemType = z.TypeOf<typeof DishRecommendationItemSchema>
export type DishRecommendationsResType = z.TypeOf<typeof DishRecommendationsResSchema>
