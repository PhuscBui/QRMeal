import z from 'zod'

export const CreateCategoryBody = z.object({
  name: z.string().min(1).max(256),
  description: z.string().max(10000)
})

export type CreateCategoryBodyType = z.TypeOf<typeof CreateCategoryBody>

export const CategorySchema = z.object({
  _id: z.string(),
  name: z.string(),
  description: z.string(),
  dish_count: z.number().optional(),
  created_at: z.date(),
  updated_at: z.date()
})

export const CategoryRes = z.object({
  message: z.string(),
  result: CategorySchema
})

export type CategoryResType = z.TypeOf<typeof CategoryRes>

export const CategoryListRes = z.object({
  message: z.string(),
  result: z.array(CategorySchema)
})

export type CategoryListResType = z.TypeOf<typeof CategoryListRes>

export const UpdateCategoryBody = CreateCategoryBody
export type UpdateCategoryBodyType = CreateCategoryBodyType
export const CategoryParams = z.object({
  id: z.string()
})
export type CategoryParamsType = z.TypeOf<typeof CategoryParams>
