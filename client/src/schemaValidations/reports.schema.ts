import z from 'zod'

export const RevenueStatisticsItemSchema = z.object({
  period: z.string(),
  totalRevenue: z.number(),
  count: z.number()
})

export const RevenueStatisticsResSchema = z.object({
  message: z.string(),
  result: z.array(RevenueStatisticsItemSchema)
})

export type RevenueStatisticsResType = z.TypeOf<typeof RevenueStatisticsResSchema>

export const DishStatItemSchema = z.object({
  dishId: z.string(),
  dishName: z.string(),
  dishImage: z.string().optional(),
  totalQuantity: z.number(),
  totalRevenue: z.number(),
  orderCount: z.number()
})

export const DishStatisticsResSchema = z.object({
  message: z.string(),
  result: z.object({
    bestSellers: z.array(DishStatItemSchema),
    leastOrdered: z.array(DishStatItemSchema),
    neverOrdered: z.array(DishStatItemSchema),
    totalDishes: z.number(),
    orderedDishes: z.number()
  })
})

export type DishStatisticsResType = z.TypeOf<typeof DishStatisticsResSchema>

export const GetReportsQuerySchema = z.object({
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
  period: z.enum(['day', 'week', 'month']).optional()
})

export type GetReportsQueryType = z.TypeOf<typeof GetReportsQuerySchema>

